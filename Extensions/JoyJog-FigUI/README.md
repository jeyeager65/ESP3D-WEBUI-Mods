# JoyJog (FigUI)

A FigUI plugin that provides a virtual joystick for jogging, ported from the
ESP3D-WebUI [JoyJog extension](../JoyJog/README.md).

> [!WARNING]
> This does **not** check machine limits and will allow jogging outside the
> bounds of the machine. Depending on latency, jogging may not stop instantly.

## Features

- Embeds in FigUI's **controls** layout slot — replaces the built-in DRO and
  jog pad in the left column, leaving the G-code viewer and file manager
  visible. Falls back to **full** layout on mobile.
- Virtual XY / X / Y / Z joystick with mouse + touch (Pointer Events)
- Distance from center controls feedrate (proportional)
- Cancel button issues a real-time jog cancel (`0x85`)
- Home X / Y / Z / All
- Per-plugin persistent settings for max XY / Z feedrate
  (stored via FigUI `getSettings` / `saveSettings`)
- Reads `$/axes/{x,y,z}/acceleration_mm_per_sec2` and `$/planner_blocks`
  from FluidNC to size jog command intervals
- Theme-aware: panels, buttons, inputs, and the live status tag mirror
  FigUI's `.panel` / `.btn` / `.input-field` / `.tag` design system using
  the injected CSS theme variables, and react to live theme switches

## Install

### From a folder

1. In FigUI, open the **Plugins** tab → **Add** → choose storage location →
   select this `JoyJog-FigUI/` folder.
2. FigUI uploads `plugin.json`, `index.html`, and `icon.png` automatically.

### Directly on the device

Copy the folder contents into `/plugins/joyjog/` on internal storage (or
`/sd/plugins/joyjog/` on SD card), then hit refresh in the Plugins tab.

## Configuration

Open the plugin and use the **Settings** row to set:

- **Max XY F** — maximum XY (and Y-axis-only / X-axis-only) feedrate in mm/min
- **Max Z F**  — maximum Z feedrate in mm/min

Click **Save** to persist. Settings are stored at
`/plugins/<plugin-id>/settings.json` on the device and removed when the
plugin is uninstalled.

## Notes vs. the ESP3D-WebUI version

- Uses the FigUI `postMessage` API (`fluid-request` / `fluid-response`,
  `fluid-event`) instead of the ESP3D-WebUI extension bridge.
- Uses `subscribe('status')` for live state instead of polling `?`.
- Uses `sendQuery` for the FluidNC `$/...` settings reads.
- Replaces ESP3D-WebUI's `preferences.json` feedrate lookup with per-plugin
  settings, since FigUI does not have an equivalent global jog-panel preference.
- Replaces the bespoke mouse + touch handlers with unified Pointer Events.

## Icon

`icon.png` should be a 48×48 PNG. Drop one alongside `plugin.json` and
`index.html` before publishing — the FigUI store rejects PRs without it.
