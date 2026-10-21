$ErrorActionPreference = "Stop"
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$AppDir = Join-Path $RepoRoot "zhongguan-assistant-gateway"

if (-not (Get-Command mvn -ErrorAction SilentlyContinue)) {
    Write-Error "未找到 mvn，请先安装 Maven 3.9+ 与 JDK 17+"
}

Set-Location $AppDir
Write-Host "Maven package: $AppDir"
mvn clean package -DskipTests
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
$Jar = Get-ChildItem (Join-Path $AppDir "target\zhongguan-assistant-gateway-*.jar") |
    Where-Object { $_.Name -notlike "*-sources.jar" -and $_.Name -notlike "original-*" } |
    Select-Object -First 1
Write-Host "已生成: $($Jar.FullName)"
Write-Host "下一步：本机运行 .\start.ps1 ，或拷到 Linux 后用 start.sh"
