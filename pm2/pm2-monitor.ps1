$expectedApps = @(
    "BE-Clonos",
    "ML-Clonos",
    "Receiver"
)

$pm2 = "C:\Users\A365_A_RPMAYUR\AppData\Roaming\npm\pm2.cmd"

try {
    $output = & $pm2 jlist 2>$null | Out-String
    $processes = $output | ConvertFrom-Json

    $runningNames = @($processes | ForEach-Object { $_.name })

    $missingApps = @(
        $expectedApps | Where-Object {
            $runningNames -notcontains $_
        }
    )

    if ($missingApps.Count -gt 0) {

        $time = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

        Add-Content "C:\PM2\pm2-monitor.log" `
            "$time - Missing: $($missingApps -join ', '). Running pm2 resurrect..."

        & $pm2 resurrect

        Start-Sleep -Seconds 10

        Add-Content "C:\PM2\pm2-monitor.log" `
            "$time - pm2 resurrect completed."
    }
}
catch {

    $time = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

    Add-Content "C:\PM2\pm2-monitor.log" `
        "$time - ERROR: $($_.Exception.Message)"
}