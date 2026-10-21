$ErrorActionPreference = "Stop"
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$AppDir = Join-Path $RepoRoot "zhongguan-assistant-gateway"
$EnvFile = if ($env:ENV_FILE) { $env:ENV_FILE } else { Join-Path $RepoRoot "deploy\gateway.env" }

if (-not (Test-Path $EnvFile)) {
    Write-Error "未找到 $EnvFile ，请先复制 deploy\env.example 为 deploy\gateway.env"
}

Get-Content $EnvFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -eq "" -or $line.StartsWith("#")) { return }
    $pair = $line.Split("=", 2)
    if ($pair.Length -eq 2 -and -not [string]::IsNullOrWhiteSpace($pair[0])) {
        Set-Item -Path "Env:$($pair[0].Trim())" -Value $pair[1].Trim()
    }
}

if (-not $env:SPRING_PROFILES_ACTIVE) { $env:SPRING_PROFILES_ACTIVE = "ums-test,edge" }
$Port = if ($env:SERVER_PORT) { $env:SERVER_PORT } else { "8080" }
$JarName = if ($env:JAR_NAME) { $env:JAR_NAME } else { "zhongguan-assistant-gateway-0.1.0-SNAPSHOT.jar" }
$Jar = Join-Path $AppDir "target\$JarName"
if (-not (Test-Path $Jar)) {
    Write-Error "找不到 $Jar ，请先运行 .\package.ps1"
}

if (-not $env:CHINAUMS_TEST_PRIVATE_KEY -and -not $env:CHINAUMS_ASSISTANT_PRIVATE_KEY) {
    Write-Warning "未配置银商私钥，check/query 会失败。"
}

New-Item -ItemType Directory -Force -Path (Join-Path $AppDir "logs"), (Join-Path $AppDir "data") | Out-Null
Set-Location $AppDir
Write-Host "启动: $Jar"
Write-Host "profile=$($env:SPRING_PROFILES_ACTIVE)  本机 http://127.0.0.1:$Port  对外 HTTPS 走 Nginx"
java -jar $Jar --server.port=$Port --spring.profiles.active=$env:SPRING_PROFILES_ACTIVE
