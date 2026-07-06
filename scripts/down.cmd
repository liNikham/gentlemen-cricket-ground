@echo off
setlocal
pushd "%~dp0.." || exit /b 1
docker compose -f compose.dev.yml down
set "status=%errorlevel%"
popd
exit /b %status%
