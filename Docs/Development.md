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
