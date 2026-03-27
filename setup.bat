@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

set "REPO_ROOT=%CD%"
set "ANY_INSTALL=0"

set "PYTHON_SUMMARY=Python 3: not checked"
set "NODE_SUMMARY=Node.js/npm: not checked"
set "VENV_SUMMARY=Python virtual environment: not checked"
set "PY_PACKAGES_SUMMARY=Python packages: not checked"
set "NODE_PACKAGES_SUMMARY=Node packages: not checked"
set "ENV_SUMMARY=backend\\.env: not checked"
set "GEMINI_SUMMARY=Gemini config: not checked"
set "RAG_SUMMARY=SQLite RAG store: not checked"

echo [SETUP] Checking Manga Translate Studio requirements...

call :ensure_python
if errorlevel 1 goto :error

call :ensure_node
if errorlevel 1 goto :error

call :ensure_venv
if errorlevel 1 goto :error

call :ensure_python_packages
if errorlevel 1 goto :error

call :ensure_node_packages
if errorlevel 1 goto :error

call :ensure_backend_env
if errorlevel 1 goto :error

call :ensure_rag_store
if errorlevel 1 goto :error

echo.
if "%ANY_INSTALL%"=="0" (
  echo [DONE] All required components are already installed.
) else (
  echo [DONE] Setup completed and installed missing components.
)
echo [READY] Available components:
echo   - !PYTHON_SUMMARY!
echo   - !NODE_SUMMARY!
echo   - !VENV_SUMMARY!
echo   - !PY_PACKAGES_SUMMARY!
echo   - !NODE_PACKAGES_SUMMARY!
echo   - !ENV_SUMMARY!
echo   - !GEMINI_SUMMARY!
echo   - !RAG_SUMMARY!
exit /b 0

:ensure_python
call :find_python
if errorlevel 1 (
  echo [SETUP] Python 3 was not found. Installing with winget...
  call :install_with_winget "Python.Python.3.12" "Python 3"
  if errorlevel 1 exit /b 1
  call :find_python
  if errorlevel 1 (
    echo [ERROR] Python 3 was installed, but could not be found afterwards.
    exit /b 1
  )
)

set "PYTHON_VERSION="
for /f "delims=" %%I in ('"%PYTHON_CMD%" %PYTHON_ARGS% --version 2^>^&1') do if not defined PYTHON_VERSION set "PYTHON_VERSION=%%I"
if not defined PYTHON_VERSION set "PYTHON_VERSION=Python 3 (version unavailable)"
echo [OK] Python 3 is ready.
set "PYTHON_SUMMARY=%PYTHON_VERSION%"
exit /b 0

:ensure_node
call :find_node_tools
if errorlevel 1 (
  echo [SETUP] Node.js and npm were not found. Installing with winget...
  call :install_with_winget "OpenJS.NodeJS.LTS" "Node.js LTS"
  if errorlevel 1 exit /b 1
  call :find_node_tools
  if errorlevel 1 (
    echo [ERROR] Node.js was installed, but node/npm could not be found afterwards.
    exit /b 1
  )
)

set "NODE_VERSION="
set "NPM_VERSION="
for /f "delims=" %%I in ('"%NODE_CMD%" --version 2^>^&1') do if not defined NODE_VERSION set "NODE_VERSION=%%I"
for /f "delims=" %%I in ('"%NPM_CMD%" --version 2^>^&1') do if not defined NPM_VERSION set "NPM_VERSION=%%I"
if not defined NODE_VERSION set "NODE_VERSION=unknown"
if not defined NPM_VERSION set "NPM_VERSION=unknown"
echo [OK] Node.js and npm are ready.
set "NODE_SUMMARY=Node !NODE_VERSION!, npm !NPM_VERSION!"
exit /b 0

:ensure_venv
set "VENV_PY=%REPO_ROOT%\.venv\Scripts\python.exe"
if exist "%VENV_PY%" (
  echo [OK] Python virtual environment already exists.
  set "VENV_SUMMARY=.venv ready"
  exit /b 0
)

echo [SETUP] Creating Python virtual environment...
"%PYTHON_CMD%" %PYTHON_ARGS% -m venv "%REPO_ROOT%\.venv"
if errorlevel 1 (
  echo [ERROR] Failed to create Python virtual environment.
  exit /b 1
)

if not exist "%VENV_PY%" (
  echo [ERROR] Virtual environment was created, but %VENV_PY% was not found.
  exit /b 1
)

set "ANY_INSTALL=1"
set "VENV_SUMMARY=.venv created"
exit /b 0

:ensure_python_packages
set "VENV_PY=%REPO_ROOT%\.venv\Scripts\python.exe"
if not exist "%VENV_PY%" (
  echo [ERROR] Virtual environment is missing at %VENV_PY%.
  exit /b 1
)

"%VENV_PY%" -c "import fastapi, google.genai, uvicorn, PIL, dotenv, fitz, multipart" >nul 2>nul
if errorlevel 1 (
  echo [SETUP] Installing Python packages from backend\requirements.txt...
  "%VENV_PY%" -m pip install --upgrade pip
  if errorlevel 1 exit /b 1
  "%VENV_PY%" -m pip install -r backend\requirements.txt
  if errorlevel 1 exit /b 1
  set "ANY_INSTALL=1"
  "%VENV_PY%" -c "import fastapi, google.genai, uvicorn, PIL, dotenv, fitz, multipart" >nul 2>nul
  if errorlevel 1 (
    echo [ERROR] Python packages were installed, but verification failed.
    exit /b 1
  )
)

echo [OK] Python packages are ready.
set "PY_PACKAGES_SUMMARY=fastapi, google-genai, pillow, pymupdf, python-dotenv, python-multipart, uvicorn"
exit /b 0

:ensure_node_packages
if exist "%REPO_ROOT%\node_modules\electron\package.json" if exist "%REPO_ROOT%\node_modules\ag-psd\package.json" if exist "%REPO_ROOT%\node_modules\fast-xml-parser\package.json" if exist "%REPO_ROOT%\node_modules\jszip\package.json" if exist "%REPO_ROOT%\node_modules\node-unrar-js\package.json" (
  echo [OK] Node packages are already installed.
  set "NODE_PACKAGES_SUMMARY=electron, ag-psd, fast-xml-parser, jszip, node-unrar-js"
  exit /b 0
)

echo [SETUP] Installing Node packages with npm...
call "%NPM_CMD%" install
if errorlevel 1 (
  echo [ERROR] npm install failed.
  exit /b 1
)

if not exist "%REPO_ROOT%\node_modules\electron\package.json" (
  echo [ERROR] Node packages were installed, but electron was not found afterwards.
  exit /b 1
)

set "ANY_INSTALL=1"
set "NODE_PACKAGES_SUMMARY=electron, ag-psd, fast-xml-parser, jszip, node-unrar-js"
exit /b 0

:ensure_backend_env
if not exist "%REPO_ROOT%\backend\.env" (
  if exist "%REPO_ROOT%\backend\.env.example" (
    echo [SETUP] Creating backend\.env from backend\.env.example...
    copy /y "%REPO_ROOT%\backend\.env.example" "%REPO_ROOT%\backend\.env" >nul
    if errorlevel 1 (
      echo [ERROR] Failed to create backend\.env.
      exit /b 1
    )
    set "ANY_INSTALL=1"
  ) else (
    echo [SETUP] Creating empty backend\.env...
    type nul > "%REPO_ROOT%\backend\.env"
    if errorlevel 1 (
      echo [ERROR] Failed to create backend\.env.
      exit /b 1
    )
    set "ANY_INSTALL=1"
  )
)

call :ensure_env_line "%REPO_ROOT%\backend\.env" "GEMINI_OCR_MODEL" "gemini-2.5-flash"
if errorlevel 1 exit /b 1
call :ensure_env_line "%REPO_ROOT%\backend\.env" "RAG_DATABASE_PATH" "%REPO_ROOT%\backend\data\rag_store.sqlite3"
if errorlevel 1 exit /b 1

set "ENV_SUMMARY=backend\\.env ready"

set "GEMINI_KEY_STATE="
for /f "usebackq delims=" %%I in (`powershell -NoProfile -ExecutionPolicy Bypass -Command "$path = '%REPO_ROOT%\backend\.env'; $line = Get-Content -Path $path | Where-Object { $_ -match '^GEMINI_API_KEY=' } | Select-Object -First 1; if ($null -eq $line -or $line -match '^GEMINI_API_KEY=\s*$' -or $line -match 'your_api_key_here') { 'missing' } else { 'configured' }"`) do if not defined GEMINI_KEY_STATE set "GEMINI_KEY_STATE=%%I"

set "GEMINI_MODEL_VALUE="
for /f "usebackq delims=" %%I in (`powershell -NoProfile -ExecutionPolicy Bypass -Command "$path = '%REPO_ROOT%\backend\.env'; $line = Get-Content -Path $path | Where-Object { $_ -match '^GEMINI_MODEL=' } | Select-Object -First 1; if ($null -eq $line) { '' } else { ($line -replace '^GEMINI_MODEL=', '').Trim() }"`) do if not defined GEMINI_MODEL_VALUE set "GEMINI_MODEL_VALUE=%%I"

if /i "%GEMINI_KEY_STATE%"=="configured" (
  if defined GEMINI_MODEL_VALUE (
    set "GEMINI_SUMMARY=Gemini API key configured in backend\\.env, model !GEMINI_MODEL_VALUE!"
  ) else (
    set "GEMINI_SUMMARY=Gemini API key configured in backend\\.env"
  )
) else (
  set "GEMINI_SUMMARY=Gemini API key is not configured in backend\\.env. Add it there or paste it in the app UI."
)
exit /b 0

:ensure_rag_store
set "VENV_PY=%REPO_ROOT%\.venv\Scripts\python.exe"
if not exist "%VENV_PY%" (
  echo [ERROR] Virtual environment is missing at %VENV_PY%.
  exit /b 1
)

set "RAG_DB_PATH="
for /f "usebackq delims=" %%I in (`powershell -NoProfile -ExecutionPolicy Bypass -Command "$path = '%REPO_ROOT%\backend\.env'; $line = Get-Content -Path $path | Where-Object { $_ -match '^RAG_DATABASE_PATH=' } | Select-Object -First 1; if ($null -eq $line) { Write-Output '%REPO_ROOT%\backend\data\rag_store.sqlite3' } else { ($line -replace '^RAG_DATABASE_PATH=', '').Trim() }"`) do if not defined RAG_DB_PATH set "RAG_DB_PATH=%%I"
if not defined RAG_DB_PATH (
  echo [ERROR] Could not resolve SQLite RAG database path.
  exit /b 1
)

if exist "!RAG_DB_PATH!" (
  echo [OK] SQLite RAG store is ready.
  set "RAG_SUMMARY=!RAG_DB_PATH!"
  exit /b 0
)

echo [SETUP] Initializing SQLite RAG store...
set "RAG_DATABASE_PATH=!RAG_DB_PATH!"
"%VENV_PY%" -c "from backend.app.rag_store import initialize_store; initialize_store()"
if errorlevel 1 (
  echo [ERROR] Failed to initialize SQLite RAG store.
  exit /b 1
)

if not exist "!RAG_DB_PATH!" (
  echo [ERROR] SQLite RAG store was initialized, but !RAG_DB_PATH! was not found.
  exit /b 1
)

set "ANY_INSTALL=1"
set "RAG_SUMMARY=!RAG_DB_PATH!"
exit /b 0

:ensure_env_line
set "ENV_FILE=%~1"
set "ENV_KEY=%~2"
set "ENV_VALUE=%~3"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$path = '%ENV_FILE%'; $key = '%ENV_KEY%'; $value = '%ENV_VALUE%'; if (-not (Select-String -Path $path -Pattern ('^' + [regex]::Escape($key) + '=') -Quiet)) { Add-Content -Path $path -Value ($key + '=' + $value); exit 10 } else { exit 0 }"
set "ENV_APPEND_EXIT=%ERRORLEVEL%"
if "%ENV_APPEND_EXIT%"=="10" (
  set "ANY_INSTALL=1"
  exit /b 0
)
if "%ENV_APPEND_EXIT%"=="0" exit /b 0
echo [ERROR] Failed to update %ENV_FILE% with %ENV_KEY%.
exit /b 1

:find_python
set "PYTHON_CMD="
set "PYTHON_ARGS="

for /f "delims=" %%I in ('where py 2^>nul') do if not defined PYTHON_CMD (
  set "PYTHON_CMD=%%~fI"
  set "PYTHON_ARGS=-3"
)
if defined PYTHON_CMD exit /b 0

for /f "delims=" %%I in ('where python 2^>nul') do if not defined PYTHON_CMD (
  set "PYTHON_CMD=%%~fI"
  set "PYTHON_ARGS="
)
if defined PYTHON_CMD exit /b 0

if exist "%LocalAppData%\Programs\Python" (
  for /f "delims=" %%I in ('where /r "%LocalAppData%\Programs\Python" python.exe 2^>nul') do if not defined PYTHON_CMD (
    set "PYTHON_CMD=%%~fI"
    set "PYTHON_ARGS="
  )
)
if defined PYTHON_CMD exit /b 0

if exist "%ProgramFiles%\Python" (
  for /f "delims=" %%I in ('where /r "%ProgramFiles%\Python" python.exe 2^>nul') do if not defined PYTHON_CMD (
    set "PYTHON_CMD=%%~fI"
    set "PYTHON_ARGS="
  )
)
if defined PYTHON_CMD exit /b 0
exit /b 1

:find_node_tools
set "NODE_CMD="
set "NPM_CMD="
for /f "delims=" %%I in ('where node 2^>nul') do if not defined NODE_CMD set "NODE_CMD=%%~fI"
for /f "delims=" %%I in ('where npm.cmd 2^>nul') do if not defined NPM_CMD set "NPM_CMD=%%~fI"
if not defined NPM_CMD for /f "delims=" %%I in ('where npm 2^>nul') do if not defined NPM_CMD set "NPM_CMD=%%~fI"
if defined NODE_CMD if defined NPM_CMD exit /b 0
exit /b 1

:install_with_winget
set "WINGET_ID=%~1"
set "DISPLAY_NAME=%~2"
where winget >nul 2>nul
if errorlevel 1 (
  echo [ERROR] winget is required to install %DISPLAY_NAME% automatically.
  exit /b 1
)

winget install --exact --id "%WINGET_ID%" --accept-package-agreements --accept-source-agreements
if errorlevel 1 (
  echo [ERROR] Failed to install %DISPLAY_NAME% with winget.
  exit /b 1
)
set "ANY_INSTALL=1"
exit /b 0

:error
echo [FAILED] Setup did not complete.
exit /b 1
