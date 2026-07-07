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

    const countResult = await pool.query(`SELECT COUNT(*) as total FROM ${table}`);
    const totalRows = parseInt(countResult.rows[0].total) || 0;

    let orderClause = '';
    const sort = req.query.sort;
    if (sort) {
      if (sort.startsWith('-')) orderClause = `ORDER BY ${sort.substring(1)} DESC NULLS LAST`;
      else orderClause = `ORDER BY ${sort} ASC NULLS LAST`;
    }

    const offset = parseInt(req.query.offset) || 0;
    const result = await pool.query(`SELECT * FROM ${table} ${orderClause} LIMIT $1 OFFSET $2`, [limit, offset]);
    res.json({ list: result.rows, pageInfo: { totalRows: totalRows } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
});
