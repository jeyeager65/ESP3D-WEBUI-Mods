$ThemePath = $PSScriptRoot
$ThemeName = 'theme-FluidDark'
$SourceCssPath = "$ThemePath\$ThemeName.css"
$BuildCssPath = "$ThemePath\$ThemeName"
$CssMinifyApiUrl = "https://www.toptal.com/developers/cssminifier/api/raw"

# Minify CSS
$CssContent = Get-Content $SourceCssPath -Raw
$Body = @{
    input = $CssContent
}
$CssContent = Invoke-RestMethod -Method "POST" -Uri $CssMinifyApiUrl -Body $Body
$CssContent | Out-File -FilePath $BuildCssPath

# Compress CSS File to gzip
gzip -f $BuildCssPath

# Create Zip Bundle with Theme and Images
$Compress = @{
  Path = "$BuildCssPath.gz", "$ThemePath\fluidnc.png"
  DestinationPath = "$BuildCssPath.zip"
}
Compress-Archive @Compress -Force

# Cleanup
Remove-Item "$BuildCssPath.gz"
