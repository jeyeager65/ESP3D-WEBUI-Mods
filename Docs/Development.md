# Developing Themes and Extensions

## Overview
This is based on what I've learned creating themes and extensions.  Some of this is based off existing documentation and examples.  Other parts are based on personal opinions and experience.  

## Getting Started

### Pre-Requisites
- Some basic knowledge of Git, HTML, CSS, and JavaScript.
- A code editor.  I recommend VS Code: https://code.visualstudio.com/

### ESP3D Simulator
Whether creating a theme or extension, it is helpful to use the WebUI simulator.  This provides a useful, but limited, environment for development.

#### Setup
1. Get the ESP3D-WEBUI project by cloning the 3.0-FluidNCDev branch in this repository: https://github.com/michmela44/ESP3D-WEBUI/tree/3.0-FluidNCDev
2. Open the project in a code editor.
3. Setup Development Tools (from https://github.com/michmela44/ESP3D-WEBUI/tree/3.0-FluidNCDev?tab=readme-ov-file#setup-development-tools)
   - Install current NodeJS LTS (https://nodejs.org/)
   - Download project dependencies: ``` npm install ```
4. Start the Development Server with FluidNC configuration: ``` npm run dev-cnc-FluidNC```
5. Access the WebUI at http://localhost:8088/

#### File Access
The Flash and SD files are stored in a directory within the project. For themes and extensions, you will want to put your files in the Flash directory.
- Flash - \server\CNC\FluidNC\Flash
- SD - \server\CNC\FluidNC\SD

#### Uploading Files to SD
To be able to upload files to the SD folder from the WebUI, you will need to change this line (currently 238) in \config\server.js:

From: ``` app.all("/sdfiles", function (req, res) { ```

To: ``` app.all("/upload", function (req, res) { ```

## Themes
Themes are just CSS files that override the existing styles.  

The official documentation covers the basics well:
https://esp3d.io/ESP3D-WebUI/Version_3.X/documentation/themes/

### Modifying My Themes
Currently, I have 2 themes and the only difference between them is the top section which defines colors and images.  If that's all you want to change (and still want a dark theme), you can pretty easily just modify the top section.

``` css
/***** COLORS *****/
:root {
    --primary: #5c0000;       /* Primary Color - Header Background */
    --secondary: #7c1006;     /* Secondary Color - Panel Header */
    --bkgd: #090909;          /* Page Body Background Color */
    --panelbkgd: #212121;     /* Panel Body Background Color */
    --buttonbkgd: #3b3b3b;    /* Button Background Color */
    --highlight: #ff0000;     /* Selected/Active Color */
    --logo: url("logo.png");         /* Logo on Flash - 30px height, max 250px width */
    --logosmall: url("logo-sm.png"); /* Small Logo on Flash - 30px height */
}
```

#### Building
My themes have a build.ps1 PowerShell script in each folder.  This does the following:
1. Uses an API to minify the CSS.
2. Gzips the CSS file.
3. Zips all theme files (gzipped CSS and images) into a single ZIP file.

When developing, I add the following to PowerShell script prior to removing the Gzip file.  You will need to update your path and URL as appropriate.  This allows you to upload for simulator or real testing without extra manual steps.
``` PowerShell
# Copy to local WebUI folder for testing
Copy-Item -Path "$BuildCssPath.gz" -Destination "C:\Dev\FluidNC\michmela44\ESP3D-WEBUI\server\CNC\FluidNC\Flash"

# Upload to machine for testing
curl -F file=@"$BuildCssPath.gz" http://192.168.0.240/files
```

#### Copying
If you want to copy one of my themes as a starting point, I would copy/paste the whole folder and rename as appropriate.  Rename the CSS file (it must start with "theme-").  Then update the build.ps1 file to set the "ThemeName" variable to the name of your theme without the CSS extension.
``` PowerShell
$ThemeName = 'theme-V1E (Dark)'
```

## Extensions

### Resources
- ESP3D Documentation: https://esp3d.io/ESP3D-WebUI/Version_3.X/documentation/
  - Extension Overview: https://esp3d.io/ESP3D-WebUI/Version_3.X/documentation/extensions/
    - This provides a basic overview of themes and how to install them.
  - Extension API: https://esp3d.io/ESP3D-WebUI/Version_3.X/documentation/api/extensions/
    - This shows examples and capabilities of the extension API.
- FluidNC Wiki: http://wiki.fluidnc.com/
  - Commands and Settings: http://wiki.fluidnc.com/en/features/commands_and_settings
 
### Getting Started
While I may create an extension template in the future, my Hold Monitor extension is a good starting point.  Just rename the extensionName variable and the name in the debug function in the JavaScript.
``` javascript
var extensionName = "holdmonitor";
...
function debug(msg) {
    console.log("Hold Monitor: " + msg);
}
```

## Notes

### File Size
Since themes and extensions are stored in Flash memory, space is at a premium.  This is why files are compressed and minified where possible.  FluidNC has built in support for Gzip so if a theme/extension has any size to it, you should at least do this.

On a standard 4MB ESP32, there is only 192KB of Flash memory.  A good chunk of that is used by the WebUI itself.
On a V1E 8MB ESP32, if you compile it specially to take advantage of that space, there is 1.77MB.  Don't assume users of your themes/extensions have that kind of space to work with.
