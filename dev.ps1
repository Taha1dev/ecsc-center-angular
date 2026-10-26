# Enable the workspace ng wrapper in this PowerShell session only.
# Run once in a new terminal: .\dev.ps1
$workspaceNgScript = Join-Path $PSScriptRoot 'scripts/ng.mjs'
if (-not (Test-Path -LiteralPath $workspaceNgScript -PathType Leaf)) {
    throw 'The workspace ng wrapper was not found.'
}
$workspaceNodeCommand = (Get-Command node -CommandType Application -ErrorAction Stop).Source
$workspaceNgFunction = {
    & $workspaceNodeCommand $workspaceNgScript @args
}.GetNewClosure()
Set-Item -Path Function:\global:ng -Value $workspaceNgFunction
Write-Host 'Workspace ng enabled for this terminal. Examples: ng g s customers-api / ng g c customer-card'
