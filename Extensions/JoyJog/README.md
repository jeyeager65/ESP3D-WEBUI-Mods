# JoyJog Extension

This is a panel extension that provides a virtual joystick for jogging.

![image](https://github.com/user-attachments/assets/2ed07bad-e9b6-47df-82da-f5be51389343)
![image](https://github.com/user-attachments/assets/617c3af0-5529-4dad-a828-7d1aeda9f267)
![image](https://github.com/user-attachments/assets/d5965d30-1d0b-42aa-aa7e-70a67f7a32a7)
![image](https://github.com/user-attachments/assets/5e122390-6036-45e8-867d-c8c411b65ce4)

## Usage
> [!WARNING]
> This does *not* check machine limits and will allow for jogging outside the bounds of the machine.  Depending on latency, the jogging may not stop immediately.

- Joystick
  - Mouse - Click and drag the center circle.  The machine will move at the specified direction at a feedrate proportional to the distance from the center.  Releasing the mouse click will cancel the current jog.
  - Touch - Similar to mouse.  Touch and drag the center circle.  Lifting the finger will cancel the current jog.
- Jog Mode
  - XY - Click to display XY jog.  This is the default.
  - X - Click to display X jog only.
  - Y - Click to display Y jog only.
  - Z - Click to display Z jog only.
  - Cancel Jog Button - If the jog is not cancelling as expected, this can be clicked to cancel the current jog.  Typically this is not needed but in some circumstances it can be helpful.
- Home
  - X - Home X
  - Y - Home Y
  - Z - Home Z
  - All - Home All

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
