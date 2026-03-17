@echo off
setlocal
cd /d "%~dp0"

call :find_python
if errorlevel 1 goto :error

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm was not found in PATH.
  echo Install Node.js first, then run this file again.
  goto :error
)

if not exist ".venv\Scripts\python.exe" (
  echo [SETUP] Creating Python virtual environment...
  %PYTHON_BOOTSTRAP% -m venv .venv
  if errorlevel 1 goto :error
)

set "VENV_PY=.venv\Scripts\python.exe"

echo [SETUP] Upgrading pip...
"%VENV_PY%" -m pip install --upgrade pip
if errorlevel 1 goto :error

echo [SETUP] Installing Python packages...
"%VENV_PY%" -m pip install -r backend\requirements.txt
if errorlevel 1 goto :error

echo [SETUP] Installing Node packages...
call npm install
if errorlevel 1 goto :error

echo.
echo [DONE] Setup completed successfully.
exit /b 0

:find_python
where py >nul 2>nul
if not errorlevel 1 (
  set "PYTHON_BOOTSTRAP=py -3"
  exit /b 0
)

where python >nul 2>nul
if not errorlevel 1 (
  set "PYTHON_BOOTSTRAP=python"
  exit /b 0
)

echo [ERROR] Python 3 was not found in PATH.
exit /b 1

:error
echo.
echo [ERROR] Setup failed.
pause
exit /b 1

