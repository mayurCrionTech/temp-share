$expectedApps = @(
    "BE-Clonos",
    "ML-Clonos",
    "Receiver"
)

$pm2 = "C:\Users\A365_A_RPMAYUR\AppData\Roaming\npm\pm2.cmd"
$logFile = "C:\PM2\pm2-monitor.log"

foreach ($app in $expectedApps) {

    try {

        $result = & $pm2 pid $app 2>$null
        $processId = $result | Select-Object -First 1

        if ([string]::IsNullOrWhiteSpace($processId) -or $processId -eq "0") {

            $time = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

            Add-Content $logFile "$time - $app is missing. Running pm2 resurrect."

            & $pm2 resurrect

            Start-Sleep -Seconds 10

            $check = & $pm2 pid $app 2>$null
            $checkProcessId = $check | Select-Object -First 1

            if ([string]::IsNullOrWhiteSpace($checkProcessId) -or $checkProcessId -eq "0") {

                Add-Content $logFile "$time - FAILED: $app was not restored."

            }
            else {

                Add-Content $logFile "$time - SUCCESS: $app restored. PID: $checkProcessId"

            }
        }
    }
    catch {

        $time = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

        Add-Content $logFile "$time - ERROR checking $app : $($_.Exception.Message)"
    }
}