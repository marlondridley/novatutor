# PowerShell script to run basic checks + concurrency tests on Windows
# Run from repository root: .\tests\run-checks.ps1

param(
  [switch]$SkipInstall
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "========================"
Write-Host "1) Install dependencies (skip if already installed)"
Write-Host "========================"
if (-not $SkipInstall) {
  npm ci
} else {
  Write-Host "Skipping npm ci (SkipInstall passed)"
}
Write-Host ""

Write-Host "========================"
Write-Host "2) Show top-level installed packages"
Write-Host "========================"
npm ls --depth=0 | Out-Host
Write-Host ""

Write-Host "========================"
Write-Host "3) Depcheck (missing/unused deps)"
Write-Host "========================"
Write-Host "If depcheck is not installed, npx will download and run it."
try {
  npx depcheck
} catch {
  Write-Warning "depcheck failed or returned non-zero exit code. Install depcheck or inspect output above."
}
Write-Host ""

Write-Host "========================"
Write-Host "4) Type check (TS compile, no emit)"
Write-Host "========================"
try {
  npm run typecheck
} catch {
  Write-Error "Typecheck failed — review errors above."
  exit 1
}
Write-Host ""

Write-Host "========================"
Write-Host "5) Lint"
Write-Host "========================"
try {
  npm run lint
} catch {
  Write-Warning "Lint reported issues (non-fatal here)."
}
Write-Host ""

Write-Host "========================"
Write-Host "6) Run concurrency tests (requires ts-node + tsconfig-paths if path aliases used)"
Write-Host "========================"
# Prefer using ts-node with tsconfig-paths if tsconfig has path aliases
$useTsConfigPaths = $true
if ($useTsConfigPaths) {
  Write-Host "Running tests with ts-node + tsconfig-paths..."
  npx ts-node -r tsconfig-paths/register tests/quick-concurrency-test.ts
} else {
  npx ts-node tests/quick-concurrency-test.ts
}
Write-Host ""

Write-Host "All steps completed."