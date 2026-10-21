$ErrorActionPreference = "SilentlyContinue"
Get-CimInstance Win32_Process |
    Where-Object { $_.CommandLine -match "zhongguan-assistant-gateway-.*\.jar" } |
    ForEach-Object {
        Write-Host "停止 pid=$($_.ProcessId)"
        Stop-Process -Id $_.ProcessId -Force
    }
Write-Host "完成"
