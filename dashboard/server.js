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
    
    // Ngăn chặn SQL injection cơ bản
    if (!/^[a-zA-Z0-9_]+$/.test(table)) throw new Error('Invalid table');

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
    if (sort) {
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
  
  try {
    const keys = Object.keys(data).filter(k => /^[a-zA-Z0-9_]+$/.test(k));
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
  
  try {
    const keys = Object.keys(data).filter(k => /^[a-zA-Z0-9_]+$/.test(k) && k !== 'id');
    const values = keys.map(k => data[k]);
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    values.push(id); // Tham số cuối cùng là ID
    
    const query = `UPDATE ${table} SET ${setClause} WHERE id = $${values.length} RETURNING *`;
    const result = await pool.query(query, values);
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
  
  try {
    const query = `DELETE FROM ${table} WHERE id = $1 RETURNING id`;
    const result = await pool.query(query, [id]);
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

app.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
});
