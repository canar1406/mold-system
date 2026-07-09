const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const pool = new Pool({
  host: 'postgres',
  port: 5432,
  user: 'mold_user',
  password: 'mold_pass_2024',
  database: 'molddb'
});

// Chỉ cho phép truy cập các bảng/view nghiệp vụ (chặn bảng hệ thống directus_*)
const ALLOWED_TABLES = new Set([
  'don_hang', 'tonghop_phoi', 'tong_khuon', 'nhatky_khuon', 'nhatky_khuon_thanh_ly',
  'nhan_khuon', 'khuon_hong', 'thanh_ly', 'lich_su_thanh_ly', 'nghiem_thu',
  'tonghop_timkiem', 'khuon_nt_kt', 'luu_nghiem_thu', 'tonghop_nghiem_thu',
  'dat_khuon', 'tai_lieu', 'thiet_bi'
]);

// Khóa chính thật của từng bảng (mặc định là 'id')
const TABLE_PK = {
  tong_khuon: 'ten_khuon',
  nhan_khuon: 'dot_khuon'
};

function checkTable(table, res) {
  if (!ALLOWED_TABLES.has(table)) {
    res.status(403).json({ error: 'Table not allowed' });
    return false;
  }
  return true;
}

app.get('/api/stats', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM v_thong_ke_khuon');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Lấy dữ liệu cho các biểu đồ trên Dashboard
app.get('/api/charts', async (req, res) => {
  try {
    // 1. KG Sản phẩm theo tháng (lấy tổng kg thực tế)
    const kgThangRes = await pool.query(`
      SELECT EXTRACT(MONTH FROM ngay) as month, SUM(COALESCE(kgthtt, kgthanh, 0)) as total_kg
      FROM nhatky_khuon
      WHERE ngay IS NOT NULL
      GROUP BY month ORDER BY month
    `);

    // 2. Tỷ lệ theo máy (phân tích tinh_trang)
    const mayRes = await pool.query(`
      SELECT LEFT(TRIM(tinh_trang), 4) as may, COUNT(*) as count
      FROM nhatky_khuon
      WHERE tinh_trang IS NOT NULL AND TRIM(tinh_trang) != ''
      GROUP BY may ORDER BY count DESC LIMIT 10
    `);

    // 3. Hiệu quả trung bình theo tháng
    const hqThangRes = await pool.query(`
      SELECT EXTRACT(MONTH FROM ngay) as month, AVG(hieuqua) as avg_hq
      FROM nhatky_khuon
      WHERE ngay IS NOT NULL AND hieuqua > 0
      GROUP BY month ORDER BY month
    `);

    // 4. Top khuôn hiệu quả cao nhất
    const topKhuonRes = await pool.query(`
      SELECT ten_khuon, hieu_qua
      FROM v_thong_ke_khuon
      WHERE hieu_qua IS NOT NULL
      ORDER BY hieu_qua DESC LIMIT 10
    `);

    res.json({
      kgThang: kgThangRes.rows,
      may: mayRes.rows,
      hqThang: hqThangRes.rows,
      topKhuon: topKhuonRes.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Endpoint thay thế Directus API cho các bảng/view
app.get('/api/query/:table', async (req, res) => {
  try {
    const table = req.params.table;
    const limit = parseInt(req.query.limit) || 50;

    // Ngăn chặn SQL injection + chỉ cho bảng nghiệp vụ
    if (!/^[a-zA-Z0-9_]+$/.test(table)) throw new Error('Invalid table');
    if (!checkTable(table, res)) return;

    let whereClauseData = '';
    let whereClauseCount = '';
    let queryParams = [limit];
    const offset = parseInt(req.query.offset) || 0;
    queryParams.push(offset);

    const search = req.query.search;
    const filters = req.query.filters; // JSON string

    let conditions = [];
    let countConditions = [];
    
    if (search) {
      conditions.push(`CAST(ten_khuon AS TEXT) ILIKE $3`);
      countConditions.push(`CAST(ten_khuon AS TEXT) ILIKE $1`);
      queryParams.push(`%${search}%`);
    }

    if (filters) {
      try {
        const filterObj = JSON.parse(filters);
        let paramIdx = queryParams.length + 1;
        let countParamIdx = countConditions.length + 1;
        
        for (const [key, val] of Object.entries(filterObj)) {
            // Ngăn chặn SQL Injection ở tên cột
            if (/^[a-zA-Z0-9_]+$/.test(key)) {
                if (typeof val === 'string' && val.trim() !== '') {
                    conditions.push(`CAST(${key} AS TEXT) ILIKE $${paramIdx}`);
                    countConditions.push(`CAST(${key} AS TEXT) ILIKE $${countParamIdx}`);
                    queryParams.push(`%${val}%`);
                    paramIdx++;
                    countParamIdx++;
                } else if (typeof val === 'object' && val !== null) {
                    if (val.type === 'between' && val.start && val.end) {
                        conditions.push(`DATE(${key}) BETWEEN $${paramIdx} AND $${paramIdx + 1}`);
                        countConditions.push(`DATE(${key}) BETWEEN $${countParamIdx} AND $${countParamIdx + 1}`);
                        queryParams.push(val.start, val.end);
                        paramIdx += 2;
                        countParamIdx += 2;
                    } else if (val.type === 'exact') {
                        // So sánh chính xác để sử dụng Index của Database (rất quan trọng cho tốc độ)
                        conditions.push(`${key} = $${paramIdx}`);
                        countConditions.push(`${key} = $${countParamIdx}`);
                        queryParams.push(val.value);
                        paramIdx++;
                        countParamIdx++;
                    }
                }
            }
        }
      } catch (e) {
        console.error("Lỗi parse filters:", e);
      }
    }

    if (conditions.length > 0) {
        whereClauseData = 'WHERE ' + conditions.join(' AND ');
        whereClauseCount = 'WHERE ' + countConditions.join(' AND ');
    }

    // Tách riêng query params cho Count (vì Count không nhận Limit/Offset)
    const countParams = queryParams.slice(2);

    const countResult = await pool.query(`SELECT COUNT(*) as total FROM ${table} ${whereClauseCount}`, countParams);
    const totalRows = parseInt(countResult.rows[0].total) || 0;

    let orderClause = '';
    const sort = req.query.sort;
    // Chỉ chấp nhận tên cột hợp lệ (chặn SQL injection qua ORDER BY)
    if (sort && /^-?[a-zA-Z0-9_]+$/.test(sort)) {
      if (sort.startsWith('-')) orderClause = `ORDER BY ${sort.substring(1)} DESC NULLS LAST`;
      else orderClause = `ORDER BY ${sort} ASC NULLS LAST`;
    }

    const result = await pool.query(`SELECT * FROM ${table} ${whereClauseData} ${orderClause} LIMIT $1 OFFSET $2`, queryParams);
    res.json({ list: result.rows, pageInfo: { totalRows: totalRows } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// API: Thêm dữ liệu (Create)
app.post('/api/query/:table', async (req, res) => {
  const table = req.params.table;
  const data = req.body;
  if (!/^[a-zA-Z0-9_]+$/.test(table)) return res.status(400).json({ error: 'Invalid table' });
  if (!checkTable(table, res)) return;

  try {
    const keys = Object.keys(data).filter(k => /^[a-zA-Z0-9_]+$/.test(k));
    if (keys.length === 0) return res.status(400).json({ error: 'No data' });
    const values = keys.map(k => data[k]);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

    const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Lỗi INSERT:", err);
    res.status(500).json({ error: 'Database error' });
  }
});

// API: Sửa dữ liệu (Update)
app.put('/api/query/:table/:id', async (req, res) => {
  const table = req.params.table;
  const id = req.params.id;
  const data = req.body;
  if (!/^[a-zA-Z0-9_]+$/.test(table)) return res.status(400).json({ error: 'Invalid table' });
  if (!checkTable(table, res)) return;

  try {
    const pk = TABLE_PK[table] || 'id';
    // Không cho ghi đè cột id tự tăng; riêng bảng có PK chữ (vd ten_khuon) vẫn cho phép đổi tên
    const keys = Object.keys(data).filter(k => /^[a-zA-Z0-9_]+$/.test(k) && k !== 'id');
    if (keys.length === 0) return res.status(400).json({ error: 'No data' });
    const values = keys.map(k => data[k]);
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    values.push(id); // Tham số cuối cùng là giá trị khóa chính

    const query = `UPDATE ${table} SET ${setClause} WHERE ${pk} = $${values.length} RETURNING *`;
    const result = await pool.query(query, values);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Record not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Lỗi UPDATE:", err);
    res.status(500).json({ error: 'Database error' });
  }
});

// API: Xóa dữ liệu (Delete)
app.delete('/api/query/:table/:id', async (req, res) => {
  const table = req.params.table;
  const id = req.params.id;
  if (!/^[a-zA-Z0-9_]+$/.test(table)) return res.status(400).json({ error: 'Invalid table' });
  if (!checkTable(table, res)) return;

  try {
    const pk = TABLE_PK[table] || 'id';
    const query = `DELETE FROM ${table} WHERE ${pk} = $1 RETURNING ${pk}`;
    const result = await pool.query(query, [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Record not found' });
    res.json({ success: true, deleted: result.rows[0] });
  } catch (err) {
    console.error("Lỗi DELETE:", err);
    res.status(500).json({ error: 'Database error' });
  }
});

const PORT = 3001;

// -----------------------------------------
// API: CẬP NHẬT TỔNG HỢP SỐ LIỆU PHÔI
// -----------------------------------------
app.post('/api/aggregate-mold-data', async (req, res) => {
  try {
    // 1. Cập nhật tonghop_phoi từ nhatky_khuon
    await pool.query(`
      INSERT INTO tonghop_phoi (ten_khuon, lc, hq, minkg, maxkg, ngay_thu, ngay_cuoi, tinh_trang, sth, hq_kg)
      SELECT 
        n.ten_khuon,
        CAST(COUNT(n.hieuqua) AS VARCHAR) as lc,
        SUM(CAST(NULLIF(regexp_replace(CAST(n.hieuqua AS TEXT), '[^0-9.]', '', 'g'), '') AS NUMERIC)) as hq,
        MIN(CAST(NULLIF(regexp_replace(CAST(n.kgthanh AS TEXT), '[^0-9.]', '', 'g'), '') AS NUMERIC)) as minkg,
        MAX(CAST(NULLIF(regexp_replace(CAST(n.kgthanh AS TEXT), '[^0-9.]', '', 'g'), '') AS NUMERIC)) as maxkg,
        MIN(CAST(n.ngay AS DATE)) as ngay_thu,
        MAX(CAST(n.ngay AS DATE)) as ngay_cuoi,
        (SELECT tinh_trang FROM nhatky_khuon n2 WHERE n2.ten_khuon = n.ten_khuon ORDER BY n2.ngay DESC LIMIT 1) as tinh_trang,
        SUM(COALESCE(CAST(NULLIF(regexp_replace(CAST(n.so_thanh AS TEXT), '[^0-9.]', '', 'g'), '') AS NUMERIC), 0)) as sth,
        SUM(
          COALESCE(CAST(NULLIF(regexp_replace(CAST(n.so_thanh AS TEXT), '[^0-9.]', '', 'g'), '') AS NUMERIC), 0) * 
          COALESCE(CAST(NULLIF(regexp_replace(CAST(COALESCE(n.kgthtt, n.kgthanh) AS TEXT), '[^0-9.]', '', 'g'), '') AS NUMERIC), 0)
        ) as hq_kg
      FROM nhatky_khuon n
      WHERE n.ten_khuon IS NOT NULL
      GROUP BY n.ten_khuon
      ON CONFLICT (ten_khuon) DO UPDATE SET
        lc = EXCLUDED.lc,
        hq = EXCLUDED.hq,
        minkg = EXCLUDED.minkg,
        maxkg = EXCLUDED.maxkg,
        ngay_thu = EXCLUDED.ngay_thu,
        ngay_cuoi = EXCLUDED.ngay_cuoi,
        tinh_trang = EXCLUDED.tinh_trang,
        sth = EXCLUDED.sth,
        hq_kg = EXCLUDED.hq_kg;
    `);

    // 2. Cập nhật tonghop_phoi các trường bổ sung từ tong_khuon, nhan_khuon, khuon_hong
    await pool.query(`
      UPDATE tonghop_phoi t
      SET 
        dot = tk.dot,
        ghichu = tk.ghichu,
        ngay_nhap = nk.ngay_nhap,
        hong = (CASE WHEN kh.ten_khuon IS NOT NULL THEN 'x' ELSE NULL END)
      FROM tong_khuon tk
      LEFT JOIN nhan_khuon nk ON tk.dot = nk.dot_khuon
      LEFT JOIN khuon_hong kh ON tk.ten_khuon = kh.ten_khuon
      WHERE t.ten_khuon = tk.ten_khuon;
    `);

    // 3. Cập nhật vào khuon_hong
    await pool.query(`
      INSERT INTO khuon_hong (ten_khuon, ngay, ghi_chu, hong)
      SELECT 
        ten_khuon, 
        MAX(CAST(ngay AS DATE)), 
        MAX(CAST(tinh_trang AS TEXT)),
        'x'
      FROM nhatky_khuon
      WHERE (CAST(tinh_trang AS TEXT) ILIKE '%hỏng%' OR CAST(tinh_trang AS TEXT) ILIKE '%hong%')
        AND ten_khuon NOT IN (SELECT ten_khuon FROM khuon_hong WHERE ten_khuon IS NOT NULL)
      GROUP BY ten_khuon;
    `);

    // 4. Cập nhật vào thanh_ly
    await pool.query(`
      INSERT INTO thanh_ly (ten_khuon, dot, ngay, tl)
      SELECT 
        ten_khuon,
        dot,
        ngay,
        'x'
      FROM khuon_hong
      WHERE (tly IS NOT NULL AND tly <> '')
        AND ten_khuon NOT IN (SELECT ten_khuon FROM thanh_ly WHERE ten_khuon IS NOT NULL);
    `);

    res.json({ success: true, message: 'Đã tổng hợp dữ liệu thành công' });
  } catch (err) {
    console.error('Lỗi khi tổng hợp dữ liệu:', err);
    res.status(500).json({ error: err.message });
  }
});

// =========================================================
// LUỒNG THANH LÝ (port từ các query Access: 5Q_Update_Hong_Tly,
// 5_LuuKhuonThanhLy, 001_LUU_NHAT_KY..., 002_XOA_KHUON_THANH_LY)
// =========================================================

// B1: Chuyển khuôn hỏng (đã đánh dấu TLY) sang bảng thanh lý
app.post('/api/liquidation/move-damaged', async (req, res) => {
  try {
    const r = await pool.query(`
      INSERT INTO thanh_ly (ten_khuon, dot, ngay, tl, ghi_chu)
      SELECT kh.ten_khuon, kh.dot, kh.ngay, kh.tly, kh.ghi_chu
      FROM khuon_hong kh
      WHERE kh.tly IS NOT NULL AND btrim(kh.tly) <> ''
        AND NOT EXISTS (SELECT 1 FROM thanh_ly t WHERE t.ten_khuon = kh.ten_khuon)
      RETURNING id;
    `);
    res.json({ success: true, moved: r.rowCount, message: `Đã chuyển ${r.rowCount} khuôn hỏng sang thanh lý.` });
  } catch (err) {
    console.error('move-damaged:', err);
    res.status(500).json({ error: err.message });
  }
});

// B2: Lưu (lưu trữ lịch sử) khuôn thanh lý + lưu nhật ký của chúng
app.post('/api/liquidation/archive', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const r1 = await client.query(`
      INSERT INTO lich_su_thanh_ly (ngay, ten_khuon, dot, ng_sua, tl, ghi_chu)
      SELECT t.ngay, t.ten_khuon, tk.dot, t.ng_sua, t.tl, t.ghi_chu
      FROM thanh_ly t
      INNER JOIN tong_khuon tk ON tk.ten_khuon = t.ten_khuon
      WHERE NOT EXISTS (SELECT 1 FROM lich_su_thanh_ly l WHERE l.ten_khuon = t.ten_khuon)
      RETURNING id;
    `);
    const r2 = await client.query(`
      INSERT INTO nhatky_khuon_thanh_ly (ngay, ten_khuon, hieuqua, so_thanh, kgthanh, tinh_trang, phoi, sk)
      SELECT n.ngay, n.ten_khuon, n.hieuqua, n.so_thanh, n.kgthanh, n.tinh_trang, n.phoi, n.sk
      FROM nhatky_khuon n
      WHERE n.ten_khuon IN (SELECT ten_khuon FROM lich_su_thanh_ly)
        AND NOT EXISTS (
          SELECT 1 FROM nhatky_khuon_thanh_ly z
          WHERE z.ten_khuon = n.ten_khuon AND z.ngay IS NOT DISTINCT FROM n.ngay
        )
      RETURNING id;
    `);
    await client.query('COMMIT');
    res.json({ success: true, archived: r1.rowCount, logs: r2.rowCount,
      message: `Đã lưu ${r1.rowCount} khuôn thanh lý và ${r2.rowCount} dòng nhật ký kèm theo.` });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('archive:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// B3: Xóa khuôn thanh lý — XÓA MỀM (đánh dấu tong_khuon.tly = 'x')
app.post('/api/liquidation/soft-delete', async (req, res) => {
  try {
    const r = await pool.query(`
      UPDATE tong_khuon SET tly = 'x'
      WHERE ten_khuon IN (SELECT ten_khuon FROM thanh_ly)
        AND (tly IS NULL OR btrim(tly) <> 'x')
      RETURNING ten_khuon;
    `);
    res.json({ success: true, marked: r.rowCount,
      message: `Đã đánh dấu thanh lý (xóa mềm) cho ${r.rowCount} khuôn trong bảng tổng khuôn.` });
  } catch (err) {
    console.error('soft-delete:', err);
    res.status(500).json({ error: err.message });
  }
});

// =========================================================
// LUỒNG NGHIỆM THU (port từ Access: macro Q_Update toanbo_KG_KT
// rebuild bảng tạm; query Q_Udate_Nghiemthu APPEND vào 8_NghiemThu)
// =========================================================

// B1: "Cập nhật số liệu nghiệm thu" — tính lại bảng tạm tonghop_nghiem_thu
// cho các khuôn đăng ký trong khuon_nt_kt (giống make-table 10T_TDTHKHUON_KG_KT0)
app.post('/api/nghiemthu/update', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS tonghop_nghiem_thu (
        ten_khuon VARCHAR PRIMARY KEY, dot VARCHAR, lc INTEGER,
        hq DOUBLE PRECISION, sth DOUBLE PRECISION, hq_kg DOUBLE PRECISION,
        min_kg DOUBLE PRECISION, max_kg DOUBLE PRECISION,
        tinh_trang VARCHAR, ngay_nhap TIMESTAMPTZ, ngay_thu TIMESTAMPTZ,
        ngay_cuoi TIMESTAMPTZ, hong VARCHAR, tl VARCHAR,
        hangx VARCHAR, duoi VARCHAR, loai VARCHAR, ghichu TEXT,
        ngay_nt TIMESTAMPTZ, dat VARCHAR, ngay_hong TIMESTAMPTZ, vi_tri VARCHAR
      );`);
    await client.query('TRUNCATE tonghop_nghiem_thu;');
    const r = await client.query(`
      INSERT INTO tonghop_nghiem_thu
      SELECT
        k.ten_khuon, tk.dot,
        agg.lc, agg.hq, agg.sth, agg.hq_kg,
        fk.first_kg AS min_kg, COALESCE(lk.last_kg, 0) AS max_kg,
        lt.last_tt, nk.ngay_nhap, agg.ngay_thu, agg.ngay_cuoi,
        kh.hong, tl.tl,
        LEFT(COALESCE(tk.dot,''), 2), RIGHT(k.ten_khuon, 2), LEFT(k.ten_khuon, 4),
        NULLIF(CONCAT(COALESCE(tk.ghichu,''), COALESCE(k.ghi_chu,'')), ''),
        nt.ngay_nt, nt.dat, kh.ngay, tk.vi_tri
      FROM khuon_nt_kt k
      LEFT JOIN tong_khuon tk ON tk.ten_khuon = k.ten_khuon
      LEFT JOIN nhan_khuon nk ON nk.dot_khuon = tk.dot
      LEFT JOIN LATERAL (
        SELECT COUNT(n.hieuqua)::int AS lc, SUM(n.hieuqua) AS hq,
               SUM(COALESCE(n.so_thanh, 0)) AS sth,
               -- Quy tắc Access: sau 19/4/2020 dùng Kg thực tế, trước đó dùng Kg thành
               SUM(COALESCE(n.so_thanh, 0) * CASE WHEN n.ngay > '2020-04-19'
                     THEN COALESCE(n.kgthtt, 0) ELSE COALESCE(n.kgthanh, 0) END) AS hq_kg,
               MIN(n.ngay) AS ngay_thu, MAX(n.ngay) AS ngay_cuoi
        FROM nhatky_khuon n WHERE n.ten_khuon = k.ten_khuon
      ) agg ON true
      LEFT JOIN LATERAL (SELECT n.kgthanh AS first_kg FROM nhatky_khuon n
        WHERE n.ten_khuon = k.ten_khuon AND n.kgthanh IS NOT NULL ORDER BY n.ngay ASC LIMIT 1) fk ON true
      LEFT JOIN LATERAL (SELECT n.kgthanh AS last_kg FROM nhatky_khuon n
        WHERE n.ten_khuon = k.ten_khuon AND n.kgthanh IS NOT NULL ORDER BY n.ngay DESC LIMIT 1) lk ON true
      LEFT JOIN LATERAL (SELECT n.tinh_trang AS last_tt FROM nhatky_khuon n
        WHERE n.ten_khuon = k.ten_khuon AND n.tinh_trang IS NOT NULL ORDER BY n.ngay DESC LIMIT 1) lt ON true
      LEFT JOIN LATERAL (SELECT h.hong::varchar AS hong, h.ngay FROM khuon_hong h
        WHERE h.ten_khuon = k.ten_khuon ORDER BY h.ngay DESC NULLS LAST LIMIT 1) kh ON true
      LEFT JOIN LATERAL (SELECT t.tl FROM thanh_ly t
        WHERE t.ten_khuon = k.ten_khuon ORDER BY t.ngay DESC NULLS LAST LIMIT 1) tl ON true
      LEFT JOIN LATERAL (SELECT n2.ngay_nt, n2.dat FROM nghiem_thu n2
        WHERE n2.ten_khuon = k.ten_khuon ORDER BY n2.ngay_nt DESC NULLS LAST LIMIT 1) nt ON true
      RETURNING ten_khuon;
    `);
    await client.query('COMMIT');
    res.json({ success: true, rows: r.rowCount,
      message: `Đã tính lại số liệu nghiệm thu cho ${r.rowCount} khuôn.` });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('nghiemthu/update:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// B2: "Lưu khuôn nghiệm thu" — APPEND vào lịch sử nghiem_thu (không ghi đè),
// chống trùng: cùng khuôn + cùng ngày NT thì bỏ qua
app.post('/api/nghiemthu/save', async (req, res) => {
  try {
    const ngayNt = (req.body && req.body.ngay_nt) || null;
    if (!ngayNt || !/^\d{4}-\d{2}-\d{2}$/.test(ngayNt)) {
      return res.status(400).json({ error: 'Thiếu hoặc sai định dạng ngày nghiệm thu (YYYY-MM-DD)' });
    }
    const r = await pool.query(`
      INSERT INTO nghiem_thu (ngay_nt, ten_khuon, dot, lc, hq, sth, hq_kg, min_kg, max_kg,
        tinh_trang, ngay_nhap, ngay_thu, ngay_cuoi, hong, ghichu, dat, hangx, duoi, loai, tl)
      SELECT $1::timestamptz, t.ten_khuon, t.dot, t.lc, t.hq, t.sth, t.hq_kg, t.min_kg, t.max_kg,
        t.tinh_trang, t.ngay_nhap, t.ngay_thu, t.ngay_cuoi, LEFT(t.hong,1), t.ghichu, 'Đạt',
        t.hangx, t.duoi, t.loai, t.tl
      FROM tonghop_nghiem_thu t
      WHERE NOT EXISTS (
        SELECT 1 FROM nghiem_thu n
        WHERE n.ten_khuon = t.ten_khuon AND n.ngay_nt = $1::timestamptz
      )
      RETURNING id;
    `, [ngayNt]);
    res.json({ success: true, saved: r.rowCount,
      message: `Đã lưu ${r.rowCount} khuôn vào lịch sử nghiệm thu (ngày NT: ${ngayNt}).` });
  } catch (err) {
    console.error('nghiemthu/save:', err);
    res.status(500).json({ error: err.message });
  }
});

// B3: "Áp đợt khuôn nghiệm thu" — điền Đợt từ tong_khuon cho các bản ghi thiếu
app.post('/api/nghiemthu/ap-dot', async (req, res) => {
  try {
    const r1 = await pool.query(`
      UPDATE nghiem_thu n SET dot = tk.dot
      FROM tong_khuon tk
      WHERE tk.ten_khuon = n.ten_khuon
        AND (n.dot IS NULL OR btrim(n.dot) = '')
        AND tk.dot IS NOT NULL;
    `);
    const r2 = await pool.query(`
      UPDATE khuon_nt_kt k SET dot = tk.dot
      FROM tong_khuon tk
      WHERE tk.ten_khuon = k.ten_khuon
        AND (k.dot IS NULL OR btrim(k.dot) = '')
        AND tk.dot IS NOT NULL;
    `);
    res.json({ success: true,
      message: `Đã áp đợt cho ${r1.rowCount} bản ghi nghiệm thu và ${r2.rowCount} khuôn kiểm tra.` });
  } catch (err) {
    console.error('nghiemthu/ap-dot:', err);
    res.status(500).json({ error: err.message });
  }
});

// =========================================================
// BÁO CÁO SẢN PHẨM THEO THÁNG / NĂM (từ nhatky_khuon)
// =========================================================
app.get('/api/report/production', async (req, res) => {
  try {
    const by = req.query.by === 'year' ? 'year' : 'month';
    const groupCols = by === 'year'
      ? 'EXTRACT(YEAR FROM ngay)::int'
      : 'EXTRACT(YEAR FROM ngay)::int, EXTRACT(MONTH FROM ngay)::int';
    const selectCols = by === 'year'
      ? `EXTRACT(YEAR FROM ngay)::int AS nam, NULL::int AS thang`
      : `EXTRACT(YEAR FROM ngay)::int AS nam, EXTRACT(MONTH FROM ngay)::int AS thang`;
    const r = await pool.query(`
      SELECT ${selectCols},
        COUNT(*) AS luot_chay,
        ROUND(SUM(COALESCE(so_thanh,0))::numeric, 0) AS tong_thanh,
        ROUND(SUM(COALESCE(so_thanh,0) * COALESCE(kgthtt, kgthanh, 0))::numeric, 1) AS tong_kg,
        ROUND(AVG(NULLIF(hieuqua,0))::numeric, 2) AS hieu_qua_tb
      FROM nhatky_khuon
      WHERE ngay IS NOT NULL
      GROUP BY ${groupCols}
      ORDER BY nam, thang;
    `);
    res.json({ by, rows: r.rows });
  } catch (err) {
    console.error('report/production:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
});
