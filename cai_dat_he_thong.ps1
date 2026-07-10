$ErrorActionPreference = "Stop"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "      CHUONG TRINH CAI DAT HE THONG QUAN LY       " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Kiem tra Docker
Write-Host "[1/5] Kiem tra moi truong Docker..." -ForegroundColor Yellow
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
Write-Host "[2/5] Kiem tra trang thai Docker..." -ForegroundColor Yellow
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
Write-Host "[3/5] Dang khoi dong he thong (Database, Directus, API, Dashboard)..." -ForegroundColor Yellow
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

# 4. Kiem tra & tu dong sua loi "thieu bang du lieu" do volume CSDL cu
# (Trieu chung: bam "Cap nhat tong hop so lieu" / mo "Bang tong hop tim kiem" bao loi
#  "relation tonghop_phoi does not exist". Nguyen nhan: Docker chi nap file du lieu
#  (dump) vao luc dau tien tao volume; neu volume da co san tu ban cu (thieu bang moi)
#  thi cap nhat code sau nay se KHONG tu dong nap lai.)
Write-Host "[4/5] Dang kiem tra tinh toan ven du lieu..." -ForegroundColor Yellow

function Test-PostgresHealthy {
    param([int]$MaxTries = 30)
    for ($i = 1; $i -le $MaxTries; $i++) {
        $status = docker inspect --format='{{.State.Health.Status}}' mold_postgres 2>$null
        if ($status -eq "healthy") { return $true }
        Start-Sleep -Seconds 2
    }
    return $false
}

$dbReady = Test-PostgresHealthy
if (-not $dbReady) {
    Write-Host "(!) Khong the kiem tra du lieu luc nay (Database chua san sang). Bo qua buoc kiem tra." -ForegroundColor DarkYellow
} else {
    $checkTable = (docker exec mold_postgres psql -U mold_user -d molddb -tAc "SELECT to_regclass('public.tonghop_phoi');" 2>$null)
    if ([string]::IsNullOrWhiteSpace($checkTable)) {
        Write-Host ""
        Write-Host "(!) PHAT HIEN LOI: Co so du lieu dang THIEU bang du lieu (vd: tonghop_phoi)." -ForegroundColor Red
        Write-Host "    Nguyen nhan: Du lieu Docker cu (volume) duoc tao truoc khi he thong duoc cap nhat," -ForegroundColor Yellow
        Write-Host "    nen khong tu dong nap them bang moi." -ForegroundColor Yellow
        Write-Host "    Trieu chung: Nut 'Cap nhat tong hop so lieu' va 'Bang tong hop tim kiem' bi loi." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "    CACH SUA: Xoa du lieu Docker cu va nap lai tu ban du lieu day du moi nhat." -ForegroundColor Cyan
        Write-Host "    CANH BAO: Neu tu luc cai dat toi gio ban da nhap tay du lieu MOI qua Web," -ForegroundColor Red
        Write-Host "    thao tac nay se XOA phan du lieu nhap tay do." -ForegroundColor Red
        Write-Host "    (Du lieu goc trong ban dump - hon 184.000 dong nhat ky - van nguyen ven.)" -ForegroundColor DarkGray
        Write-Host ""
        $answer = Read-Host "    Ban co muon TU DONG SUA loi nay ngay bay gio khong? (Go Y de Dong y, hoac Enter de bo qua)"
        if ($answer -eq "Y" -or $answer -eq "y") {
            Write-Host "    Dang xoa du lieu cu va nap lai tu ban day du..." -ForegroundColor Yellow
            docker compose down -v
            docker compose up -d --build

            Write-Host "    Dang doi co so du lieu san sang..." -ForegroundColor Yellow
            Start-Sleep -Seconds 10
            $dbReady2 = Test-PostgresHealthy

            if ($dbReady2) {
                $recheck = (docker exec mold_postgres psql -U mold_user -d molddb -tAc "SELECT to_regclass('public.tonghop_phoi');" 2>$null)
                if (-not [string]::IsNullOrWhiteSpace($recheck)) {
                    Write-Host "    -> Da sua xong! Du lieu day du." -ForegroundColor Green
                } else {
                    Write-Host "    (!) Van con loi sau khi sua. Vui long lien he ky thuat vien." -ForegroundColor Red
                }
            } else {
                Write-Host "    (!) Database khoi dong lai qua lau. Vui long kiem tra thu cong sau." -ForegroundColor Red
            }
        } else {
            Write-Host "    Da bo qua buoc sua loi. Mot so tinh nang co the bi loi cho den khi ban chay lai" -ForegroundColor DarkYellow
            Write-Host "    file nay va chon Y, hoac tu chay lenh: docker compose down -v && docker compose up -d" -ForegroundColor DarkYellow
        }
        Write-Host ""
    } else {
        Write-Host "-> Du lieu day du, khong phat hien loi." -ForegroundColor Green
    }
}

# 5. Mo trinh duyet
Write-Host "[5/5] Dang mo trinh duyet..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "TAT CA DA XONG! HE THONG DANG CHAY TAI:" -ForegroundColor Green
Write-Host "- Dashboard: http://localhost:3000" -ForegroundColor White
Write-Host "- Quan Tri : http://localhost:8080" -ForegroundColor White
Write-Host "==================================================" -ForegroundColor Cyan

Start-Process "http://localhost:3000"
