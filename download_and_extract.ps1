$ExtensionId = "lankjdlpcafockikacbnbdngppglhjim"
$DownloadUrl = "https://clients2.google.com/service/update2/crx?response=redirect&prodversion=9999.0.0.0&os=win&arch=x86-64&nacl_arch=x86-64&acceptformat=crx2,crx3&x=id%3D$ExtensionId%26installsource%3Dondemand%26uc"

$CurrentDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $CurrentDir) { $CurrentDir = Get-Location }

$CrxPath = Join-Path $CurrentDir "sortlens.crx"
$ZipPath = Join-Path $CurrentDir "sortlens.zip"
$ExtractPath = Join-Path $CurrentDir "sortlens_extension"

Write-Host "[*] Downloading SortLens CRX from Google Chrome Web Store..." -ForegroundColor Cyan
try {
    $wc = New-Object System.Net.WebClient
    $wc.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
    $wc.DownloadFile($DownloadUrl, $CrxPath)
    Write-Host "[+] Download complete: $CrxPath" -ForegroundColor Green
} catch {
    Write-Host "[!] Download failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host "[*] Reading CRX3 binary header..." -ForegroundColor Cyan
$bytes = [System.IO.File]::ReadAllBytes($CrxPath)

# Check magic: "Cr24" (0x43, 0x72, 0x32, 0x34)
$magic = [System.Text.Encoding]::ASCII.GetString($bytes[0..3])
if ($magic -ne "Cr24") {
    Write-Host "[!] Not a valid CRX file (magic was '$magic')." -ForegroundColor Red
    exit 1
}

$version = [System.BitConverter]::ToUInt32($bytes, 4)
Write-Host "[*] CRX Version: $version" -ForegroundColor Cyan

if ($version -eq 3) {
    $headerLen = [System.BitConverter]::ToUInt32($bytes, 8)
    $zipOffset = 12 + $headerLen
} elseif ($version -eq 2) {
    $keyLen = [System.BitConverter]::ToUInt32($bytes, 8)
    $sigLen = [System.BitConverter]::ToUInt32($bytes, 12)
    $zipOffset = 16 + $keyLen + $sigLen
} else {
    Write-Host "[!] Unsupported CRX version: $version" -ForegroundColor Red
    exit 1
}

Write-Host "[*] Extracting ZIP payload at offset $zipOffset..." -ForegroundColor Cyan
$fs = [System.IO.File]::OpenWrite($ZipPath)
$fs.Write($bytes, $zipOffset, $bytes.Length - $zipOffset)
$fs.Close()

Write-Host "[*] Unpacking zip to '$ExtractPath'..." -ForegroundColor Cyan
if (Test-Path $ExtractPath) { Remove-Item -Path $ExtractPath -Recurse -Force }
Expand-Archive -Path $ZipPath -DestinationPath $ExtractPath -Force

Write-Host "`n[SUCCESS] Extension extracted successfully to:" -ForegroundColor Green
Write-Host "$ExtractPath" -ForegroundColor Yellow

Write-Host "`nHow to install in Chrome:" -ForegroundColor Cyan
Write-Host "1. Open Google Chrome and go to: chrome://extensions/"
Write-Host "2. Turn ON 'Developer mode' in top right corner."
Write-Host "3. Click 'Load unpacked' and select: $ExtractPath"

