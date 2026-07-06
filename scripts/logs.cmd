@echo off
setlocal
pushd "%~dp0.." || exit /b 1
docker compose -f compose.dev.yml logs -f
set "status=%errorlevel%"
popd
exit /b %status%
