# Hold Monitor Extension

This is a panel extension that monitors for hold and displays the last message in a modal popup for resuming.  If a hold is in place prior to opening the WebUI, it will still show a popup but with a message of "Unknown".

![image](https://github.com/user-attachments/assets/cb62d480-69f0-4671-8695-af3582910ad6) 
![image](https://github.com/user-attachments/assets/111a8c3d-6b44-4d00-8c37-a4f7bdfe4afd)

## Setup
- Upload holdmonitor.html.gz to Flash
- Add Extension
  - Settings -> ESP3D Interface -> Extra content -> Add content
  - Recommended settings
    - Name: Hold Monitor
    - Icon: ![image](https://github.com/user-attachments/assets/bfdad35e-0dbb-4047-9b21-f51d4c1187ee)
    - Output: Panel
    - URL address: holdmonitor.html
    - Type: Extension
    - Refresh time: 0
  - Save
