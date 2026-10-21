$ErrorActionPreference = "Stop"
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
& (Join-Path $PSScriptRoot "render-conf.ps1")

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

$NginxHome = $env:NGINX_HOME
$NginxBin = if ($env:NGINX_BIN) { $env:NGINX_BIN } else { "nginx" }
$Conf = Join-Path $PSScriptRoot "conf\assistant-https.conf"

if (-not $NginxHome) {
    Write-Host "未设置 NGINX_HOME。已生成 $Conf"
    Write-Host "请把该文件 include 进 Nginx，或在 Linux 上运行 start.sh"
    Write-Host "Windows 示例: 设置 NGINX_HOME=C:\nginx 后重跑本脚本"
    exit 0
}

Copy-Item $Conf (Join-Path $NginxHome "conf\assistant-https.conf") -Force
$Main = Join-Path $NginxHome "conf\nginx.conf"
$MainText = Get-Content $Main -Raw
if ($MainText -notmatch "assistant-https.conf") {
    Write-Warning "请在 $Main 的 http { } 内增加: include assistant-https.conf;"
}

Set-Location $NginxHome
& $NginxBin -t
$running = Get-Process nginx -ErrorAction SilentlyContinue
if ($running) {
    & $NginxBin -s reload
    Write-Host "Nginx 已 reload"
} else {
    Start-Process $NginxBin
    Write-Host "Nginx 已启动"
}
$Server = if ($env:SERVER_NAME) { $env:SERVER_NAME } else { "localhost" }
Write-Host "https://$Server/  前端与 /v1 均由本 Nginx 提供 HTTPS"
