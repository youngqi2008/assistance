$ErrorActionPreference = "SilentlyContinue"
$NginxBin = if ($env:NGINX_BIN) { $env:NGINX_BIN } else { "nginx" }
if ($env:NGINX_HOME) { Set-Location $env:NGINX_HOME }
& $NginxBin -s quit
Write-Host "已请求 Nginx 退出"
