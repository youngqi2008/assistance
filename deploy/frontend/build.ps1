$ErrorActionPreference = "Stop"
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$FeDir = Join-Path $RepoRoot "assistance-mobile-auth"
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

$Origin = if ($env:PUBLIC_HTTPS_ORIGIN) { $env:PUBLIC_HTTPS_ORIGIN.TrimEnd("/") } else { "https://sdk.zgzytech.com" }
$BasePath = if ($env:PUBLIC_BASE_PATH) { $env:PUBLIC_BASE_PATH } else { "/sign-pay-pro/" }
if (-not $BasePath.StartsWith("/")) { $BasePath = "/$BasePath" }
if (-not $BasePath.EndsWith("/")) { $BasePath = "$BasePath/" }
$BaseUrl = "$Origin$BasePath"

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error "未找到 npm，请安装 Node.js 20+"
}

Set-Location $FeDir
if (-not (Test-Path "node_modules")) { npm ci }
Write-Host "构建 0.3.2  base-url=$BaseUrl"
npm run build:duodian-health032 -- --base-path $BasePath --base-url $BaseUrl
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "产物: $(Join-Path $FeDir 'dist-duodian-health032-temp')"
Write-Host "下一步：.\start.ps1 同步到 Nginx"
