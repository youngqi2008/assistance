$ErrorActionPreference = "Stop"
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$EnvFile = if ($env:ENV_FILE) { $env:ENV_FILE } else { Join-Path $RepoRoot "deploy\gateway.env" }
if (Test-Path $EnvFile) {
    Get-Content $EnvFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -eq "" -or $line.StartsWith("#")) { return }
        $pair = $line.Split("=", 2)
        if ($pair.Length -eq 2 -and -not [string]::IsNullOrWhiteSpace($pair[0])) {
            Set-Item -Path "Env:$($pair[0].Trim())" -Value $pair[1].Trim()
        }
    }
}
$SslDir = Join-Path $PSScriptRoot "ssl"
New-Item -ItemType Directory -Force -Path $SslDir | Out-Null
$Cn = if ($args.Count -ge 1) { $args[0] } elseif ($env:SERVER_NAME) { $env:SERVER_NAME } else { "sdk.zgzytech.com" }
$San = "DNS:$Cn"
if ($env:DEPLOY_HOST) { $San = "$San,IP:$($env:DEPLOY_HOST)" }
$Key = Join-Path $SslDir "server.key"
$Crt = Join-Path $SslDir "server.crt"
if (-not (Get-Command openssl -ErrorAction SilentlyContinue)) {
    Write-Error "未找到 openssl。可安装 Git for Windows 后使用其 openssl，或在 Linux 上运行 gen-self-signed.sh"
}
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout $Key -out $Crt -subj "/CN=$Cn" -addext "subjectAltName=$San"
Write-Host "自签证书: $Crt"
Write-Host "SAN: $San"
