@echo off
echo ========================================
echo   REINICIANDO SISTEMA QUITO TURISMO
echo ========================================

echo.
echo Deteniendo procesos existentes...
echo.

REM Detener procesos de Node.js
for /f "tokens=2" %%i in ('tasklist ^| findstr /i "node.exe"') do (
    echo Terminando proceso Node.js: %%i
    taskkill /PID %%i /F >nul 2>&1
)

REM Detener procesos de Python
for /f "tokens=2" %%i in ('tasklist ^| findstr /i "python.exe"') do (
    echo Terminando proceso Python: %%i
    taskkill /PID %%i /F >nul 2>&1
)

echo.
echo Esperando que se liberen los puertos...
timeout /t 3 /nobreak >nul

echo.
echo Iniciando servicios...
echo.

REM Iniciar backend
echo Iniciando backend...
start "Backend - Quito Turismo" cmd /k "cd backend && npm run dev"

echo Esperando que el backend inicie...
timeout /t 5 /nobreak >nul

REM Iniciar frontend
echo Iniciando frontend...
start "Frontend - Quito Turismo" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo   SISTEMA REINICIADO EXITOSAMENTE
echo ========================================
echo.
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5174
echo.
echo Presiona cualquier tecla para continuar...
pause >nul