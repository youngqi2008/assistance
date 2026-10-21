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

$ServerName = if ($env:SERVER_NAME) { $env:SERVER_NAME } else { "localhost" }
$SslCert = if ($env:SSL_CERT) { $env:SSL_CERT } else { Join-Path $PSScriptRoot "ssl\server.crt" }
$SslKey = if ($env:SSL_KEY) { $env:SSL_KEY } else { Join-Path $PSScriptRoot "ssl\server.key" }
$Html = if ($env:NGINX_HTML) { $env:NGINX_HTML } else { Join-Path $PSScriptRoot "html" }
$Port = if ($env:SERVER_PORT) { $env:SERVER_PORT } else { "8080" }
$Upstream = if ($env:API_UPSTREAM) { $env:API_UPSTREAM } else { "127.0.0.1:$Port" }

if (-not (Test-Path $SslCert) -or -not (Test-Path $SslKey)) {
    Write-Error "证书不存在，先运行 .\gen-self-signed.ps1 $ServerName"
}

$Template = Join-Path $PSScriptRoot "conf\assistant-https.conf.template"
$Out = Join-Path $PSScriptRoot "conf\assistant-https.conf"
$Content = Get-Content $Template -Raw
$Content = $Content.Replace("__SERVER_NAME__", $ServerName)
$Content = $Content.Replace("__SSL_CERT__", ($SslCert -replace "\\", "/"))
$Content = $Content.Replace("__SSL_KEY__", ($SslKey -replace "\\", "/"))
$Content = $Content.Replace("__NGINX_HTML__", ($Html -replace "\\", "/"))
$Content = $Content.Replace("__API_UPSTREAM__", $Upstream)
if ($env:NGINX_LISTEN_HTTP -eq "0") {
    $Content = [regex]::Replace($Content, "(?s)# __BEGIN_HTTP_REDIRECT__.*?# __END_HTTP_REDIRECT__\r?\n?", "")
}
Set-Content -Path $Out -Value $Content -Encoding utf8
Write-Host "已生成 $Out"
