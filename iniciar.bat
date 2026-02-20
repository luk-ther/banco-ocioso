@echo off
cd /d "%~dp0"
set "NODE_EXE=node"
set "NPM_CMD=npm"

where node >nul 2>&1
if errorlevel 1 (
  if exist "C:\Program Files\nodejs\node.exe" (
    set "NODE_EXE=C:\Program Files\nodejs\node.exe"
    set "NPM_CMD=C:\Program Files\nodejs\npm.cmd"
  ) else (
    echo Node.js nao encontrado. Instale em https://nodejs.org/ e tente novamente.
    pause
    exit /b 1
  )
)

if not exist node_modules (
  echo Instalando dependencias...
  call "%NPM_CMD%" install
  if errorlevel 1 (
    echo Falha ao instalar dependencias.
    pause
    exit /b 1
  )
)

echo Iniciando Banco Ocioso...
call "%NODE_EXE%" server.js
pause
