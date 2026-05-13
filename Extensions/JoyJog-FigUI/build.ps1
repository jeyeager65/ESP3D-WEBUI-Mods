# Package the FigUI plugin as a zip for distribution.
$ErrorActionPreference = 'Stop'

$pluginDir = $PSScriptRoot
$pluginName = Split-Path $pluginDir -Leaf
$outZip = Join-Path $pluginDir "$pluginName.zip"

if (Test-Path $outZip) { Remove-Item $outZip -Force }

# Files included per plugin.json "files" list.
$files = @('plugin.json', 'index.html', 'style.css', 'joyjog.js', 'icon.png', 'README.md')
$toAdd = $files | ForEach-Object { Join-Path $pluginDir $_ } | Where-Object { Test-Path $_ }

Compress-Archive -Path $toAdd -DestinationPath $outZip -Force
Write-Host "Created $outZip"
