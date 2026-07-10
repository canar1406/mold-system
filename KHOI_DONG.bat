@echo off
color 0B
echo =======================================================
echo     CHUONG TRINH KHOI DONG HE THONG KM21.00
echo     (Tu dong khoi dong Docker + kiem tra/sua loi CSDL)
echo =======================================================
echo.
echo Dang yeu cau quyen Quan Tri (Administrator)...
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Da co quyen Administrator.
) else (
    echo Vui long nhay phai chuot vao file nay va chon "Run as Administrator"!
    pause
    exit /b
)

echo.
echo Dang bat dau tien trinh cai dat tu dong...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0cai_dat_he_thong.ps1"
pause
