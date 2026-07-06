@echo off
setlocal
pushd "%~dp0.." || exit /b 1
docker compose -f compose.dev.yml up
set "status=%errorlevel%"
popd
exit /b %status%
