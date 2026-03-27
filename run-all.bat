@echo off
setlocal
cd /d "%~dp0"

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm was not found in PATH.
  echo Install Node.js first, then run this file again.
  goto :error
)

if not exist ".venv\Scripts\python.exe" (
  echo [INFO] Initial setup is required.
  call setup.bat
  if errorlevel 1 goto :error
)

".venv\Scripts\python.exe" -c "import fastapi, google.genai, uvicorn, PIL, dotenv, fitz" >nul 2>nul
if errorlevel 1 (
  echo [INFO] Python packages are missing. Running setup...
  call setup.bat
  if errorlevel 1 goto :error
)

if not exist "node_modules\electron" (
  echo [INFO] Node packages are missing. Running setup...
  call setup.bat
  if errorlevel 1 goto :error
)

echo [RUN] Starting Manga Translate Studio...
call npm start
if errorlevel 1 goto :error

exit /b 0

:error
echo.
echo [ERROR] App failed to start.
pause
exit /b 1
