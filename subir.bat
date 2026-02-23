@echo off
setlocal

if "%~1"=="" (
  echo Uso: subir "Mensagem do commit"
  exit /b 1
)

set "MSG=%~1"

git add .
if errorlevel 1 (
  echo Falha no git add .
  exit /b 1
)

git commit -m "%MSG%"
if errorlevel 1 (
  echo Falha no git commit.
  exit /b 1
)

git push
if errorlevel 1 (
  echo Falha no git push.
  exit /b 1
)

echo Publicacao concluida com sucesso.
endlocal
