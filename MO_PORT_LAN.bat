@echo off
color 0A
echo =======================================================
echo         CONG CU MO PORT TUONG LUA (WIFI/LAN)
echo =======================================================
echo.
echo Dang yeu cau quyen Quan Tri (Administrator)...
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Da co quyen Administrator.
) else (
    echo Vui long nhay Phai Chuot vao file nay va chon "Run as Administrator"!
    pause
    exit /b
)

echo.
echo Dang mo cac port 3000, 3001, 8080, 5432...
powershell -NoProfile -ExecutionPolicy Bypass -Command "New-NetFirewallRule -DisplayName 'KM2100 System' -Direction Inbound -Action Allow -Protocol TCP -LocalPort 3000,3001,8080,5432 -Profile Any -ErrorAction SilentlyContinue"

echo.
echo [THANH CONG] Tuong lua da duoc mo! 
echo Bay gio ban co the lay dien thoai, ket noi cung mang Wifi voi may tinh.
echo Mo trinh duyet dien thoai va truy cap:
echo.
powershell -Command "$ip = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias 'Wi-Fi','Ethernet' -ErrorAction SilentlyContinue | Select-Object -First 1).IPAddress; Write-Host '-> Dashboard: http://' -NoNewline; Write-Host $ip -NoNewline; Write-Host ':3000'; Write-Host '-> Quan Tri:  http://' -NoNewline; Write-Host $ip -NoNewline; Write-Host ':8080'; Write-Host ''; Write-Host 'Dang tao ma QR Code...'; $qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=http://' + $ip + ':3000'; $qrPath = \"$env:TEMP\KM2100_QR.png\"; try { Invoke-WebRequest -Uri $qrUrl -OutFile $qrPath -ErrorAction SilentlyContinue; Start-Process $qrPath } catch {}"
echo.
pause
