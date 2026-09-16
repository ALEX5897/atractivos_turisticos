param(
    [switch]$Force,
    [switch]$NoWait
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  REINICIANDO SISTEMA QUITO TURISMO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Función para detener procesos
function Stop-Processes {
    param([string]$ProcessName, [string]$DisplayName)

    Write-Host "Deteniendo procesos de $DisplayName..." -ForegroundColor Yellow

    $processes = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
    if ($processes) {
        foreach ($process in $processes) {
            Write-Host "  Terminando $DisplayName (PID: $($process.Id))" -ForegroundColor Gray
            Stop-Process -Id $process.Id -Force:$Force -ErrorAction SilentlyContinue
        }
        Write-Host "  ✓ Procesos de $DisplayName detenidos" -ForegroundColor Green
    } else {
        Write-Host "  ✓ No hay procesos de $DisplayName ejecutándose" -ForegroundColor Green
    }
}

# Detener procesos existentes
Stop-Processes -ProcessName "node" -DisplayName "Node.js"
Stop-Processes -ProcessName "python" -DisplayName "Python"

Write-Host ""
Write-Host "Esperando que se liberen los puertos..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Función para verificar si un puerto está disponible
function Test-Port {
    param([int]$Port)
    $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue
    return $connection.TcpTestSucceeded
}

# Verificar puertos
$backendPort = 3000
$frontendPort = 5174

Write-Host ""
Write-Host "Verificando disponibilidad de puertos..." -ForegroundColor Yellow

if (Test-Port -Port $backendPort) {
    Write-Host "  ✓ Puerto $backendPort (Backend) está disponible" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Puerto $backendPort (Backend) aún ocupado" -ForegroundColor Red
}

if (Test-Port -Port $frontendPort) {
    Write-Host "  ✓ Puerto $frontendPort (Frontend) está disponible" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Puerto $frontendPort (Frontend) aún ocupado" -ForegroundColor Red
}

Write-Host ""
Write-Host "Iniciando servicios..." -ForegroundColor Yellow

# Iniciar backend
Write-Host "Iniciando backend..." -ForegroundColor Cyan
$backendJob = Start-Job -ScriptBlock {
    Set-Location "C:\Users\acasa\OneDrive - QuitoTurismo\Documentos\Desarrollo\atractivos_turisticos\backend"
    & npm run dev
} -Name "QuitoTurismo-Backend"

if ($backendJob) {
    Write-Host "  ✓ Backend iniciado (Job ID: $($backendJob.Id))" -ForegroundColor Green
} else {
    Write-Host "  ✗ Error al iniciar backend" -ForegroundColor Red
}

# Esperar un poco antes de iniciar el frontend
Start-Sleep -Seconds 3

# Iniciar frontend
Write-Host "Iniciando frontend..." -ForegroundColor Cyan
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "C:\Users\acasa\OneDrive - QuitoTurismo\Documentos\Desarrollo\atractivos_turisticos\frontend"
    & npm run dev
} -Name "QuitoTurismo-Frontend"

if ($frontendJob) {
    Write-Host "  ✓ Frontend iniciado (Job ID: $($frontendJob.Id))" -ForegroundColor Green
} else {
    Write-Host "  ✗ Error al iniciar frontend" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SISTEMA REINICIADO EXITOSAMENTE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "URLs de acceso:" -ForegroundColor White
Write-Host "  Backend:  http://localhost:$backendPort" -ForegroundColor White
Write-Host "  Frontend: http://localhost:$frontendPort" -ForegroundColor White
Write-Host ""
Write-Host "Jobs en ejecución:" -ForegroundColor White
Get-Job | Where-Object { $_.Name -like "QuitoTurismo-*" } | Format-Table -Property Id, Name, State
Write-Host ""

if (-not $NoWait) {
    Write-Host "Presiona Enter para continuar..." -ForegroundColor Gray
    Read-Host
}

# Mostrar logs si hay errores
$failedJobs = Get-Job | Where-Object { $_.Name -like "QuitoTurismo-*" -and $_.State -eq "Failed" }
if ($failedJobs) {
    Write-Host ""
    Write-Host "⚠ JOBS CON ERRORES:" -ForegroundColor Red
    foreach ($job in $failedJobs) {
        Write-Host "Job: $($job.Name)" -ForegroundColor Red
        Receive-Job -Job $job
    }
}