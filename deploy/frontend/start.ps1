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

$Src = Join-Path $FeDir "dist-duodian-health032-temp"
if (-not (Test-Path $Src)) {
    Write-Error "未找到构建产物，先运行 .\build.ps1"
}

$Html = if ($env:NGINX_HTML) { $env:NGINX_HTML } else { Join-Path $RepoRoot "deploy\nginx\html" }
$BasePath = if ($env:PUBLIC_BASE_PATH) { $env:PUBLIC_BASE_PATH.Trim("/") } else { "sign-pay-pro" }
$Dest = Join-Path $Html $BasePath
New-Item -ItemType Directory -Force -Path $Dest | Out-Null
Copy-Item -Path (Join-Path $Src "*") -Destination $Dest -Recurse -Force
Write-Host "已同步到 $Dest"
Write-Host "生产前端无 Node 进程，请再运行 ..\nginx\start.ps1 以 HTTPS 对外。"
