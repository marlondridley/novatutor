# Stripe CLI Installer for Windows
# This script downloads and installs Stripe CLI

$ErrorActionPreference = "Stop"

Write-Host "🔧 Installing Stripe CLI..." -ForegroundColor Cyan

# Create installation directory
$installDir = "$env:LOCALAPPDATA\stripe-cli"
if (!(Test-Path $installDir)) {
    New-Item -ItemType Directory -Path $installDir | Out-Null
}

Write-Host "📥 Downloading Stripe CLI..." -ForegroundColor Yellow

# Download using specific version
$version = "1.21.8"  # Latest stable version
$downloadUrl = "https://github.com/stripe/stripe-cli/releases/download/v$version/stripe_${version}_windows_x86_64.zip"
$zipFile = "$env:TEMP\stripe-cli.zip"

try {
    Invoke-WebRequest -Uri $downloadUrl -OutFile $zipFile -UseBasicParsing
    Write-Host "✅ Download complete!" -ForegroundColor Green
} catch {
    Write-Host "❌ Download failed. Please download manually from:" -ForegroundColor Red
    Write-Host "   https://github.com/stripe/stripe-cli/releases" -ForegroundColor Yellow
    exit 1
}

# Extract
Write-Host "📦 Extracting..." -ForegroundColor Yellow
Expand-Archive -Path $zipFile -DestinationPath $installDir -Force

# Clean up
Remove-Item $zipFile

Write-Host "✅ Stripe CLI installed to: $installDir" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 To use Stripe CLI:" -ForegroundColor Cyan
Write-Host "   1. Run: cd $installDir" -ForegroundColor White
Write-Host "   2. Then: .\stripe.exe --version" -ForegroundColor White
Write-Host ""
Write-Host "💡 Or add to PATH for global access:" -ForegroundColor Yellow
Write-Host "   `$env:PATH += ';$installDir'" -ForegroundColor White
Write-Host ""

# Test installation
$stripePath = Join-Path $installDir "stripe.exe"
if (Test-Path $stripePath) {
    Write-Host "🧪 Testing installation..." -ForegroundColor Cyan
    & $stripePath --version
    Write-Host ""
    Write-Host "🎉 Installation successful!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Installation may have issues. Please verify." -ForegroundColor Yellow
}

