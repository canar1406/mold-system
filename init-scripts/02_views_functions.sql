-- ================================================================
-- FUNCTIONS: VBA → PostgreSQL (từ module ham.bas)
-- ================================================================

-- loai_khuon(): tách tên loại khuôn (phần trước dấu - hoặc +)
-- VD: '30X-001.A' → '30X', '0150-H' → '0150'
CREATE OR REPLACE FUNCTION loai_khuon(ten VARCHAR)
RETURNS VARCHAR LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
    pos_minus INT;
    pos_plus  INT;
    pos       INT;
BEGIN
    IF ten IS NULL OR TRIM(ten) = '' THEN RETURN ''; END IF;
    pos_minus := NULLIF(POSITION('-' IN ten), 0);
    pos_plus  := NULLIF(POSITION('+' IN ten), 0);
    pos := LEAST(COALESCE(pos_minus, 9999), COALESCE(pos_plus, 9999));
    IF pos = 9999 THEN RETURN TRIM(ten); END IF;
    RETURN TRIM(LEFT(ten, pos - 1));
END;
$$;

-- get_may(): tách mã máy từ TinhTrang
-- VD: 'AM125' → '25', 'BM10C' → '10'
CREATE OR REPLACE FUNCTION get_may(tinh_trang VARCHAR)
RETURNS VARCHAR LANGUAGE sql IMMUTABLE AS $$
    SELECT RIGHT(LEFT(TRIM(tinh_trang), 4), 2)
$$;

-- get_ca(): tách ca làm việc từ TinhTrang
-- VD: 'AM125' → 'A', 'BM10C' → 'B'
CREATE OR REPLACE FUNCTION get_ca(tinh_trang VARCHAR)
RETURNS CHAR LANGUAGE sql IMMUTABLE AS $$
    SELECT LEFT(TRIM(tinh_trang), 1)
$$;

-- kg_thuc(): KG thực tế theo ngày (logic thay đổi 19/4/2020)
CREATE OR REPLACE FUNCTION kg_thuc(
    ngay TIMESTAMPTZ,
    kgthanh DOUBLE PRECISION,
    kgthtt  DOUBLE PRECISION
)
RETURNS DOUBLE PRECISION LANGUAGE sql IMMUTABLE AS $$
    SELECT CASE
        WHEN ngay <= '2020-04-19' THEN COALESCE(kgthanh, 0)
        ELSE COALESCE(kgthtt, 0)
    END
$$;

-- ================================================================
-- VIEWS: Thay thế bảng tổng hợp tạm thời của Access
-- ================================================================

-- v_tinh_trang: Tình trạng mới nhất của từng khuôn
CREATE OR REPLACE VIEW v_tinh_trang AS
SELECT DISTINCT ON (ten_khuon)
    ten_khuon,
    tinh_trang,
    ngay
FROM nhatky_khuon
WHERE tinh_trang IS NOT NULL
  AND TRIM(tinh_trang) <> ''
ORDER BY ten_khuon, ngay DESC;

-- v_ngay_min_max: Ngày đầu / cuối chạy của từng khuôn
CREATE OR REPLACE VIEW v_ngay_min_max AS
SELECT
    ten_khuon,
    MIN(ngay) AS min_ngay,
    MAX(ngay) AS max_ngay
FROM nhatky_khuon
GROUP BY ten_khuon;

-- v_kg_stat: Thống kê KG min/max theo khuôn
CREATE OR REPLACE VIEW v_kg_stat AS
SELECT
    ten_khuon,
    MIN(CASE WHEN kgthanh > 0 THEN kgthanh END) AS min_kg,
    MAX(kgthanh) AS max_kg
FROM nhatky_khuon
WHERE kgthanh IS NOT NULL AND kgthanh > 0
GROUP BY ten_khuon;

-- v_thong_ke_khuon: Tổng hợp thống kê chính
-- Tương đương bảng 10T_TDTHKHUON_KG trong Access
CREATE OR REPLACE VIEW v_thong_ke_khuon AS
SELECT
    tk.ten_khuon,
    tk.dot,
    COUNT(nk.hieuqua)                                   AS lan_chay,
    SUM(nk.hieuqua)                                     AS hieu_qua,
    SUM(COALESCE(nk.so_thanh, 0))                       AS so_thanh,
    ROUND(SUM(
        COALESCE(nk.so_thanh, 0) *
        kg_thuc(nk.ngay, nk.kgthanh, nk.kgthtt)
    )::NUMERIC, 0)                                      AS hq_kg,
    ks.min_kg,
    COALESCE(ks.max_kg, 0)                              AS max_kg,
    vtt.tinh_trang,
    nk_in.ngay_nhap,
    vn.min_ngay                                         AS ngay_thu,
    vn.max_ngay                                         AS ngay_cuoi,
    kh.hong,
    tk.tly,
    tk.id,
    LEFT(tk.dot, 2)                                     AS hang_khuon,
    RIGHT(tk.ten_khuon, 2)                              AS duoi,
    loai_khuon(tk.ten_khuon)                            AS loai,
    tk.ghichu,
    nt.ngay_nt,
    nt.dat,
    kh.ngay                                             AS ngay_hong,
    tk.vi_tri,
    tk.sosoi,
    tk.kieu,
    tk.kich_thuoc,
    tk.don_hang
FROM tong_khuon tk
LEFT JOIN nhan_khuon nk_in   ON tk.dot = nk_in.dot_khuon
LEFT JOIN v_ngay_min_max vn  ON tk.ten_khuon = vn.ten_khuon
LEFT JOIN v_kg_stat ks       ON tk.ten_khuon = ks.ten_khuon
LEFT JOIN v_tinh_trang vtt   ON tk.ten_khuon = vtt.ten_khuon
LEFT JOIN nghiem_thu nt      ON tk.ten_khuon = nt.ten_khuon
LEFT JOIN khuon_hong kh      ON tk.ten_khuon = kh.ten_khuon
LEFT JOIN nhatky_khuon nk    ON tk.ten_khuon = nk.ten_khuon
GROUP BY
    tk.ten_khuon, tk.dot, ks.min_kg, ks.max_kg,
    vtt.tinh_trang, nk_in.ngay_nhap, vn.min_ngay, vn.max_ngay,
    kh.hong, tk.tly, tk.id, tk.ghichu, nt.ngay_nt, nt.dat,
    kh.ngay, tk.vi_tri, tk.sosoi, tk.kieu, tk.kich_thuoc, tk.don_hang
ORDER BY vn.max_ngay DESC NULLS LAST;

-- v_khuon_lau_khong_chay: Khuôn lâu không chạy (> 30 ngày)
CREATE OR REPLACE VIEW v_khuon_lau_khong_chay AS
SELECT
    tk.id, tk.ten_khuon, tk.dot, tk.ghichu,
    nk_in.ngay_nhap,
    MAX(nk.ngay)                                AS ngay_chay_cuoi,
    (CURRENT_DATE - MAX(nk.ngay)::DATE)         AS so_ngay_nghi,
    loai_khuon(tk.ten_khuon)                    AS loai
FROM tong_khuon tk
LEFT JOIN nhan_khuon nk_in ON tk.dot = nk_in.dot_khuon
LEFT JOIN nhatky_khuon nk  ON tk.ten_khuon = nk.ten_khuon
WHERE tk.tly IS NULL OR tk.tly <> 'Y'
GROUP BY tk.id, tk.ten_khuon, tk.dot, tk.ghichu, nk_in.ngay_nhap
HAVING MAX(nk.ngay) IS NULL
    OR MAX(nk.ngay) < (CURRENT_TIMESTAMP - INTERVAL '30 days')
ORDER BY so_ngay_nghi DESC NULLS FIRST;
