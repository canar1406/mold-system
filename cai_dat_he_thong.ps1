$ErrorActionPreference = "Stop"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "      CHUONG TRINH CAI DAT HE THONG QUAN LY       " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Kiem tra Docker
Write-Host "[1/4] Kiem tra moi truong Docker..." -ForegroundColor Yellow
$dockerExists = Get-Command docker -ErrorAction SilentlyContinue
if (-not $dockerExists) {
    Write-Host "(!) Khong tim thay Docker Desktop." -ForegroundColor Red
    Write-Host "Dang tai ban cai dat Docker Desktop... Vui long doi it phut." -ForegroundColor Yellow
    $installerPath = "$env:TEMP\Docker Desktop Installer.exe"
    Invoke-WebRequest -Uri "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe" -OutFile $installerPath
    Write-Host "Dang khoi chay trinh cai dat Docker. Vui long lam theo huong dan tren man hinh." -ForegroundColor Cyan
    Start-Process -FilePath $installerPath -Wait
    Write-Host "(!) Cai dat Docker hoan tat. VUI LONG KHOI DONG LAI MAY TINH de Docker hoat dong!" -ForegroundColor Red
    Write-Host "Sau khi khoi dong lai, hay chay lai file KHOI_DONG.bat" -ForegroundColor Red
    exit
}
Write-Host "-> Docker da duoc cai dat." -ForegroundColor Green

# 2. Kiem tra Docker Daemon dang chay
Write-Host "[2/4] Kiem tra trang thai Docker..." -ForegroundColor Yellow
$dockerRunning = $false
for ($i=1; $i -le 6; $i++) {
    try {
        docker info *>$null
        $dockerRunning = $true
        break
    } catch {
        if ($i -eq 1) {
            Write-Host "Docker chua khoi dong, dang thu mo Docker Desktop tu dong..." -ForegroundColor Yellow
            $dockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
            if (Test-Path $dockerPath) {
                Start-Process $dockerPath -ErrorAction SilentlyContinue
            }
        }
        Write-Host "Dang doi Docker khoi dong... ($i/6)" -ForegroundColor DarkGray
        Start-Sleep -Seconds 10
    }
}

if (-not $dockerRunning) {
    Write-Host "(!) Khong the ket noi den Docker." -ForegroundColor Red
    Write-Host "Vui long tu mo ung dung 'Docker Desktop' tu Start Menu va cho den khi no hien thi Ready." -ForegroundColor Red
    Write-Host "Sau do chay lai file KHOI_DONG.bat" -ForegroundColor Red
    exit
}
Write-Host "-> Docker dang chay." -ForegroundColor Green

# 3. Chay docker-compose
Write-Host "[3/4] Dang khoi dong he thong (Database, Directus, API, Dashboard)..." -ForegroundColor Yellow
$projectDir = $PSScriptRoot
Set-Location -Path $projectDir

Write-Host "Tien trinh nay co the mat vai phut o lan dau tien chay..." -ForegroundColor Cyan
try {
    docker compose up -d --build
    Write-Host "-> He thong da khoi dong thanh cong." -ForegroundColor Green
} catch {
    Write-Host "(!) Co loi xay ra khi khoi dong he thong Docker." -ForegroundColor Red
    exit
}

# 4. Mo trinh duyet
Write-Host "[4/4] Dang mo trinh duyet..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "TAT CA DA XONG! HE THONG DANG CHAY TAI:" -ForegroundColor Green
Write-Host "- Dashboard: http://localhost:3000" -ForegroundColor White
Write-Host "- Quan Tri : http://localhost:8080" -ForegroundColor White
Write-Host "==================================================" -ForegroundColor Cyan

Start-Process "http://localhost:3000"
