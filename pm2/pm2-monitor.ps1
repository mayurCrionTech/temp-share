$expectedApps = @(
    "BE-Clonos",
    "ML-Clonos",
    "Receiver"
)

$pm2 = "C:\Users\A365_A_RPMAYUR\AppData\Roaming\npm\pm2.cmd"
$logFile = "C:\PM2\pm2-monitor.log"

foreach ($app in $expectedApps) {

    $result = & $pm2 pid $app 2>$null
    $pid = $result | Select-Object -First 1

    if ([string]::IsNullOrWhiteSpace($pid) -or $pid -eq "0") {

        $time = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

        Add-Content $logFile "$time - $app is missing. Running pm2 resurrect."

        & $pm2 resurrect

        Start-Sleep -Seconds 10

        $check = & $pm2 pid $app 2>$null
        $checkPid = $check | Select-Object -First 1

        if ([string]::IsNullOrWhiteSpace($checkPid) -or $checkPid -eq "0") {
            Add-Content $logFile "$time - FAILED: $app was not restored."
        }
        else {
            Add-Content $logFile "$time - SUCCESS: $app restored. PID: $checkPid"
        }
    }
}