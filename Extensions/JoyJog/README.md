# JoyJog Extension

This is a panel extension that provides a virtual joystick for jogging.

![image](https://github.com/user-attachments/assets/1a377592-966b-475c-ac4b-908a4668ad20)
![image](https://github.com/user-attachments/assets/f71a51b2-56e9-46bc-bcb5-d16a806d8d9a)

## Usage
> [!WARNING]
> This does *not* check machine limits and will allow for jogging outside the bounds of the machine.  Depending on latency, the jogging may not stop immediately.

- Joystick
  - Mouse - Click and drag the center circle.  The machine will move at the specified direction at a feedrate proportional to the distance from the center.  Releasing the mouse click will cancel the current jog.
  - Touch - Similar to mouse.  Touch and drag the center circle.  Lifting the finger will cancel the current jog.
- Jog XY Button
  - Click to display XY jog.  This is the default.
- Jog Z Button
  - Click to display Z jog.
- Cancel Jog Button
  - If the jog is not cancelling as expected, this can be clicked to cancel the current jog.  Typically this is not needed but in some circumstances it can be helpful.

## Setup
- Upload joyjog.html.gz to Flash
- Add Extension
  - Settings -> ESP3D Interface -> Extra content -> Add content
  - Recommended settings
    - Name: Joystick Jog
    - Icon: ![image](https://github.com/user-attachments/assets/f764a341-d54c-4ccb-8726-be5e70a2824e)
    - Output: Panel
    - URL address: joyjog.html
    - Type: Extension
    - Refresh time: 0
  - Save

## Configuration
- Max Feedrate - This uses the XY Feedrate specified for the default Jogging panel.  This is the maximum feedrate when the joystick is at the limit.
  - Settings -> ESP3D Interface -> Jog panel

![image](https://github.com/user-attachments/assets/cb8df6a8-2209-42a7-8809-570b6fab0aa6)

## Theming
- To provide theme support with the joystick being rendered as a canvas, it uses specific computed styles of other elements:
  - Lines - Button border color (.btn - border-color)
  - Circle Background - Button background color (.btn - background-color)
  - Primary Center Color - Panel header background color (.panel .navbar - background-color)
