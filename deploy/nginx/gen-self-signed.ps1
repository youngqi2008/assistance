$ErrorActionPreference = "Stop"
$SslDir = Join-Path $PSScriptRoot "ssl"
New-Item -ItemType Directory -Force -Path $SslDir | Out-Null
$Cn = if ($args.Count -ge 1) { $args[0] } else { "localhost" }
$Key = Join-Path $SslDir "server.key"
$Crt = Join-Path $SslDir "server.crt"
if (-not (Get-Command openssl -ErrorAction SilentlyContinue)) {
    Write-Error "未找到 openssl。可安装 Git for Windows 后使用其 openssl，或在 Linux 上运行 gen-self-signed.sh"
}
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout $Key -out $Crt -subj "/CN=$Cn"
Write-Host "自签证书: $Crt"
