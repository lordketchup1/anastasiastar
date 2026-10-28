param([int]$Port = 5173)

# Ждём, пока dev-сервер поднимется
$ready = $false
for ($i = 0; $i -lt 60; $i++) {
  if (Test-NetConnection -ComputerName 127.0.0.1 -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue) { $ready = $true; break }
  Start-Sleep -Milliseconds 500
}
if (-not $ready) { Write-Host 'Сервер не запустился'; exit 1 }

# IP компьютера в домашней сети. VPN-адаптеры (Hamachi/Radmin 25.x-26.x и т.п.) телефону недоступны,
# поэтому берём только частные диапазоны, 192.168.x.x в приоритете.
$ips = Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object { $_.IPAddress -match '^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)' -and $_.InterfaceAlias -notmatch 'vEthernet|VirtualBox|VMware|Loopback|Hamachi|Radmin|VPN|tun|tap|Surfshark' } |
  Sort-Object @{ Expression = { if ($_.IPAddress -like '192.168.*') { 0 } else { 1 } } }
$ip = ($ips | Select-Object -First 1).IPAddress
if (-not $ip) { $ip = '<IP-компьютера>' }
$url = "http://${ip}:$Port/"
$others = ($ips | Select-Object -Skip 1 | ForEach-Object { "    http://$($_.IPAddress):$Port/" }) -join "`n"
if ($others) { $others = "`nЕсли первый адрес не подошёл, попробуйте:`n$others`n" }

# 1) Окно размером с телефон прямо на ПК
$edge = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
$chrome = "$env:ProgramFiles\Google\Chrome\Application\chrome.exe"
$browser = @($edge, $chrome) | Where-Object { Test-Path $_ } | Select-Object -First 1
if ($browser) {
  Start-Process $browser -ArgumentList "--app=http://127.0.0.1:$Port/", '--window-size=395,860', '--user-data-dir=' + (Join-Path $env:TEMP 'starshinova-phone-view')
} else {
  Start-Process "http://127.0.0.1:$Port/"
}

# 2) Адрес и QR-код для телефона
$msg = @"
Откройте на телефоне (он должен быть в той же Wi-Fi сети, что и компьютер):

    $url
$others
Если страница не открывается: разрешите Node.js в брандмауэре Windows
(окно «Разрешить доступ» при первом запуске, галочка «Частные сети»).
"@
Start-Process powershell -ArgumentList '-NoProfile', '-NoExit', '-Command', "[Console]::OutputEncoding=[Text.Encoding]::UTF8; Write-Host @'`n$msg`n'@; try { npx --yes qrcode-terminal $url } catch {}"
