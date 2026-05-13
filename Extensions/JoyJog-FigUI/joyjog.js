// ---------- FigUI bridge ----------
let msgId = 0;
const pending = {};

function call(method, params) {
    return new Promise((resolve, reject) => {
        const id = String(++msgId);
        pending[id] = { resolve, reject };
        window.parent.postMessage(
            { type: 'fluid-request', id, method, params: params ?? {} }, '*'
        );
    });
}

function debug(msg) {
    console.log("JoyJog: " + msg);
}

// ---------- State ----------
var maxXYFeedrate = 3000;
var maxZFeedrate = 1000;
var maxTravel = 10;
var xAccel = 200;
var yAccel = 200;
var zAccel = 80;
var plannerBlocks = 32;
var jogMode = "XY";
var currentStatus = "Hold";

function sendCommand(command) {
    debug("Send Command: " + command);
    return call('sendCommand', { command }).catch(err => debug("sendCommand failed: " + err.message));
}

function cancelJog() {
    // 0x85 = real-time jog cancel
    return call('sendCommand', { command: String.fromCharCode(0x85) })
        .catch(err => debug("cancelJog failed: " + err.message));
}

function jogXY(x, y, feedrate) { sendCommand('$J=G91 G21 X' + x + ' Y' + y + ' F' + feedrate); }
function jogX(x, feedrate)     { sendCommand('$J=G91 G21 X' + x + ' F' + feedrate); }
function jogY(y, feedrate)     { sendCommand('$J=G91 G21 Y' + y + ' F' + feedrate); }
function jogZ(z, feedrate)     { sendCommand('$J=G91 G21 Z' + z + ' F' + feedrate); }

function parseSettingLine(line) {
    // FluidNC returns lines like "$/axes/x/acceleration_mm_per_sec2=200.000"
    var parts = line.trim().split('=');
    if (parts.length !== 2) return;
    switch (parts[0]) {
        case '$/axes/x/acceleration_mm_per_sec2':
            xAccel = parseFloat(parts[1]); debug("X Accel: " + xAccel); break;
        case '$/axes/y/acceleration_mm_per_sec2':
            yAccel = parseFloat(parts[1]); debug("Y Accel: " + yAccel); break;
        case '$/axes/z/acceleration_mm_per_sec2':
            zAccel = parseFloat(parts[1]); debug("Z Accel: " + zAccel); break;
        case '$/planner_blocks':
            plannerBlocks = parseFloat(parts[1]); debug("Planner Blocks: " + plannerBlocks); break;
    }
}

async function querySetting(key) {
    try {
        const result = await call('sendQuery', { command: key });
        if (typeof result === 'string') {
            result.split(/\r?\n/).forEach(parseSettingLine);
        }
    } catch (err) {
        debug("Query failed for " + key + ": " + err.message);
    }
}

function processStatus(state) {
    if (currentStatus !== state) {
        debug("Status Change: " + currentStatus + " -> " + state);
        currentStatus = state;
        var tag = document.getElementById('stateTag');
        tag.textContent = state;
        tag.setAttribute('data-state', state);
        drawJoystick(0, 0);
    }
}

// ---------- Canvas / Joystick ----------
var canvas, maxDistance, centerX, centerY, context;
var primaryColor, lineColor, backgroundColor;
var pointerDown = false;
var activePointerId = null;
var knobRadius = 40;

var jogChangeTimeout;
var currJoyX = 0;
var currJoyY = 0;
var currJoyDistance = 0;

var parentDiv;

function initializeCanvas() {
    canvas = document.createElement("canvas");

    var size = Math.min(parentDiv.clientHeight, parentDiv.clientWidth || 300);
    if (!size) size = 300;
    canvas.width = size;
    canvas.height = size;

    parentDiv.replaceChildren(canvas);

    maxDistance = (canvas.width / 2) - knobRadius;

    centerX = canvas.width / 2;
    centerY = canvas.height / 2;

    context = canvas.getContext("2d");

    // Standard math coords centered
    context.translate(centerX, centerY);
    context.scale(1, -1);

    setColors();
}

function drawJoystick(currX, currY) {
    if (jogMode === "XY")            drawXYJoystick(currX, currY);
    else if (jogMode === "Y" || jogMode === "Z") drawYJoystick(currY);
    else if (jogMode === "X")        drawXJoystick(currX);
}

function drawXYJoystick(currX, currY) {
    if (!isJogAllowed()) { currX = 0; currY = 0; }

    context.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);

    context.beginPath();
    context.arc(0, 0, maxDistance, 0, 2 * Math.PI);
    context.fillStyle = backgroundColor;
    context.fill();
    context.lineWidth = 2;
    context.strokeStyle = lineColor;
    context.stroke();

    context.setLineDash([7, 7]);
    context.beginPath();
    context.moveTo(-canvas.width / 2, 0);
    context.lineTo(canvas.width, 0);
    context.lineWidth = 1;
    context.strokeStyle = lineColor;
    context.stroke();

    context.beginPath();
    context.moveTo(0, -canvas.height / 2);
    context.lineTo(0, canvas.height / 2);
    context.lineWidth = 1;
    context.strokeStyle = lineColor;
    context.stroke();
    context.setLineDash([]);

    context.save();
    context.scale(1, -1);
    context.font = "1em Arial";
    context.fillStyle = lineColor;
    context.fillText("Y+", 5, -canvas.height / 2 + 35);
    context.fillText("Y-", 5, canvas.height / 2 - 22);
    context.fillText("X-", -canvas.width / 2 + 10, -5);
    context.fillText("X+", canvas.width / 2 - 30, -5);
    context.restore();

    drawJoystickKnob(currX, currY);
}

function drawXJoystick(currX) {
    var currY = 0;
    if (!isJogAllowed()) currX = 0;

    context.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);

    context.beginPath();
    context.lineWidth = 3;
    context.strokeStyle = lineColor;
    context.arc(85, 0, knobRadius - 15, -Math.PI / 2, Math.PI / 2);
    context.arc(-85, 0, knobRadius - 15, Math.PI / 2, -Math.PI / 2);
    context.lineTo(85, -knobRadius + 15);
    context.stroke();
    context.fillStyle = backgroundColor;
    context.fill();

    context.beginPath();
    context.setLineDash([7, 7]);
    context.moveTo(-canvas.width / 2, 0);
    context.lineTo(canvas.width / 2, 0);
    context.lineWidth = 1;
    context.strokeStyle = lineColor;
    context.stroke();
    context.setLineDash([]);

    context.beginPath();
    context.moveTo(0, -(knobRadius + 15));
    context.lineTo(0, knobRadius + 15);
    context.lineWidth = 1;
    context.strokeStyle = lineColor;
    context.stroke();

    context.save();
    context.scale(1, -1);
    context.font = "1em Arial";
    context.fillStyle = lineColor;
    context.fillText("X-", -canvas.width / 2 + 10, -5);
    context.fillText("X+", canvas.width / 2 - 30, -5);
    context.restore();

    drawJoystickKnob(currX, currY);
}

function drawYJoystick(currY) {
    var currX = 0;
    if (!isJogAllowed()) currY = 0;

    context.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);

    context.beginPath();
    context.lineWidth = 3;
    context.strokeStyle = lineColor;
    context.arc(0, 85, knobRadius - 15, 0, Math.PI);
    context.arc(0, -85, knobRadius - 15, Math.PI, 2 * Math.PI);
    context.lineTo(knobRadius - 15, 85);
    context.stroke();
    context.fillStyle = backgroundColor;
    context.fill();

    context.beginPath();
    context.setLineDash([7, 7]);
    context.moveTo(0, -canvas.height / 2);
    context.lineTo(0, canvas.height / 2);
    context.lineWidth = 1;
    context.strokeStyle = lineColor;
    context.stroke();
    context.setLineDash([]);

    context.beginPath();
    context.moveTo(-(knobRadius + 15), 0);
    context.lineTo(knobRadius + 15, 0);
    context.lineWidth = 1;
    context.strokeStyle = lineColor;
    context.stroke();

    context.save();
    context.scale(1, -1);
    context.font = "1em Arial";
    context.fillStyle = lineColor;
    context.fillText(jogMode + "+", 5, -canvas.height / 2 + 35);
    context.fillText(jogMode + "-", 5, canvas.height / 2 - 22);
    context.restore();

    drawJoystickKnob(currX, currY);
}

function drawJoystickKnob(currX, currY) {
    context.beginPath();
    context.arc(currX, currY, knobRadius, 0, 2 * Math.PI, false);
    context.fillStyle = isJogAllowed() ? primaryColor : backgroundColor;
    context.fill();
    context.lineWidth = 2;
    context.strokeStyle = lineColor;
    context.stroke();

    context.beginPath();
    context.arc(currX, currY, 10, 0, 2 * Math.PI);
    context.fillStyle = lineColor;
    context.fill();
    context.lineWidth = 2;
    context.strokeStyle = lineColor;
    context.stroke();
}

function performXYJog() {
    if (!pointerDown) return;
    var feedrate = ((currJoyDistance / maxDistance) * maxXYFeedrate).toFixed();
    var jx = (currJoyX * (maxTravel / 100)).toFixed(3);
    var jy = (currJoyY * (maxTravel / 100)).toFixed(3);
    var jogDist = Math.sqrt(jx * jx + jy * jy).toFixed(3);

    if ((jx == 0 && jy == 0) || feedrate == 0) {
        jogChangeTimeout = setTimeout(performXYJog, 100);
        return;
    }
    jogXY(jx, jy, feedrate);
    jogChangeTimeout = setTimeout(performXYJog, calcJogTimeMs(feedrate, jogDist));
}

function performXJog() {
    if (!pointerDown) return;
    var feedrate = ((Math.abs(currJoyX) / maxDistance) * maxXYFeedrate).toFixed();
    var newJogX = ((currJoyX / maxDistance) * maxTravel).toFixed(3);
    if (newJogX == 0 || feedrate == 0) {
        jogChangeTimeout = setTimeout(performXJog, 100);
        return;
    }
    jogX(newJogX, feedrate);
    jogChangeTimeout = setTimeout(performXJog, calcJogTimeMs(feedrate, Math.abs(newJogX)));
}

function performYJog() {
    if (!pointerDown) return;
    var maxFeedrate = jogMode === "Y" ? maxXYFeedrate : maxZFeedrate;
    var feedrate = ((Math.abs(currJoyY) / maxDistance) * maxFeedrate).toFixed();
    var newJogY = ((currJoyY / maxDistance) * maxTravel).toFixed(3);
    if (newJogY == 0 || feedrate == 0) {
        jogChangeTimeout = setTimeout(performYJog, 100);
        return;
    }
    if (jogMode === "Y") jogY(newJogY, feedrate);
    else if (jogMode === "Z") jogZ(newJogY, feedrate);
    jogChangeTimeout = setTimeout(performYJog, calcJogTimeMs(feedrate, Math.abs(newJogY)));
}

function isJogAllowed() {
    return currentStatus === "Idle" || currentStatus === "Jog";
}

function getCanvasCoords(clientX, clientY) {
    var rect = canvas.getBoundingClientRect();
    var x = clientX - rect.left - rect.width / 2;
    var y = rect.height - (clientY - rect.top) - rect.height / 2;
    return { x, y };
}

function onPointerDown(event) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (!isJogAllowed()) {
        debug("Jog Disabled During " + currentStatus);
        return;
    }

    var p = getCanvasCoords(event.clientX, event.clientY);
    var tempDist = Math.sqrt(p.x * p.x + p.y * p.y);

    var performJog;
    if (jogMode === "XY") {
        if (tempDist > maxDistance) return;
        performJog = performXYJog;
    } else if (jogMode === "Y" || jogMode === "Z") {
        if (Math.abs(p.x) > knobRadius || Math.abs(p.y) > maxDistance) return;
        performJog = performYJog;
    } else if (jogMode === "X") {
        if (Math.abs(p.y) > knobRadius || Math.abs(p.x) > maxDistance) return;
        performJog = performXJog;
    } else {
        return;
    }

    event.preventDefault();
    pointerDown = true;
    activePointerId = event.pointerId;
    try { canvas.setPointerCapture(event.pointerId); } catch (e) {}
    jogChangeTimeout = setTimeout(performJog, 100);
}

function onPointerMove(event) {
    if (!pointerDown || event.pointerId !== activePointerId) return;

    var p = getCanvasCoords(event.clientX, event.clientY);
    var tempDist = Math.sqrt(p.x * p.x + p.y * p.y);

    if (jogMode === "X") {
        currJoyX = p.x;
        currJoyY = 0;
        currJoyDistance = Math.abs(p.x);
        if (currJoyDistance > maxDistance) currJoyX = p.x * (maxDistance / currJoyDistance);
        drawXJoystick(currJoyX);
    } else if (jogMode === "Y" || jogMode === "Z") {
        currJoyX = 0;
        currJoyY = p.y;
        currJoyDistance = Math.abs(p.y);
        if (currJoyDistance > maxDistance) currJoyY = p.y * (maxDistance / currJoyDistance);
        drawYJoystick(currJoyY);
    } else {
        if (tempDist <= maxDistance) {
            currJoyX = p.x; currJoyY = p.y; currJoyDistance = tempDist;
        } else {
            currJoyX = p.x * (maxDistance / tempDist);
            currJoyY = p.y * (maxDistance / tempDist);
            currJoyDistance = maxDistance;
        }
        drawXYJoystick(currJoyX, currJoyY);
    }
}

function onPointerEnd(event) {
    if (event.pointerId !== activePointerId && activePointerId !== null) return;
    pointerDown = false;
    activePointerId = null;
    currJoyX = 0; currJoyY = 0; currJoyDistance = 0;
    clearTimeout(jogChangeTimeout);
    cancelJog();
    drawJoystick(0, 0);
}

function setupPointerEvents() {
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerEnd);
    canvas.addEventListener("pointercancel", onPointerEnd);
    canvas.addEventListener("pointerleave", function (e) {
        if (pointerDown && e.pointerId === activePointerId) onPointerEnd(e);
    });
}

function setColors() {
    // Pull theme variables from FigUI's injected :root vars.
    // Use --text-muted for lines/labels so they stay legible against
    // the dark surface — --border-strong is too dim in dark modes.
    var rs = getComputedStyle(document.documentElement);
    primaryColor    = rs.getPropertyValue('--accent').trim()       || '#f0a030';
    lineColor       = rs.getPropertyValue('--text-muted').trim()   || '#a0a8bc';
    backgroundColor = rs.getPropertyValue('--elevated').trim()     || rs.getPropertyValue('--surface').trim() || '#1b2030';
    drawJoystick(0, 0);
}

// ---------- Mode buttons ----------
function setMode(mode) {
    cancelJog();
    jogMode = mode;
    document.querySelectorAll('.mode-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.mode === mode);
    });
    drawJoystick(0, 0);
}

// ---------- Settings persistence ----------
async function loadSettings() {
    try {
        var s = await call('getSettings');
        if (s && typeof s === 'object') {
            if (s.maxXYFeedrate) maxXYFeedrate = parseFloat(s.maxXYFeedrate);
            if (s.maxZFeedrate)  maxZFeedrate  = parseFloat(s.maxZFeedrate);
        }
    } catch (e) {
        debug("loadSettings failed: " + e.message);
    }
    document.getElementById('setXYFeed').value = maxXYFeedrate;
    document.getElementById('setZFeed').value  = maxZFeedrate;
}

async function saveSettings() {
    var xy = parseFloat(document.getElementById('setXYFeed').value);
    var z  = parseFloat(document.getElementById('setZFeed').value);
    if (xy > 0) maxXYFeedrate = xy;
    if (z > 0)  maxZFeedrate  = z;
    try {
        await call('saveSettings', { data: { maxXYFeedrate, maxZFeedrate } });
        debug("Settings saved");
        closeSettings();
    } catch (e) {
        debug("saveSettings failed: " + e.message);
    }
}

// ---------- Settings modal ----------
function openSettings() {
    // Reset inputs to current values each time, so Cancel discards edits.
    document.getElementById('setXYFeed').value = maxXYFeedrate;
    document.getElementById('setZFeed').value  = maxZFeedrate;
    document.getElementById('settingsModal').hidden = false;
}

function closeSettings() {
    document.getElementById('settingsModal').hidden = true;
}

// ---------- Message wiring ----------
function processMessage(e) {
    if (!e.data) return;
    if (e.data.type === 'fluid-response') {
        var p = pending[e.data.id];
        if (p) {
            delete pending[e.data.id];
            e.data.error ? p.reject(new Error(e.data.error)) : p.resolve(e.data.result);
        }
    } else if (e.data.type === 'fluid-event' && e.data.event === 'status') {
        if (e.data.data && e.data.data.state) processStatus(e.data.data.state);
    }
}

async function init() {
    parentDiv = document.getElementById("joyJogDiv");

    window.addEventListener('message', processMessage, false);

    document.querySelectorAll('.mode-btn').forEach(b => {
        b.addEventListener('click', () => setMode(b.dataset.mode));
    });
    document.getElementById('cancelBtn').addEventListener('click', cancelJog);
    document.getElementById('homeX').addEventListener('click', () => { cancelJog(); sendCommand('$HX'); });
    document.getElementById('homeY').addEventListener('click', () => { cancelJog(); sendCommand('$HY'); });
    document.getElementById('homeZ').addEventListener('click', () => { cancelJog(); sendCommand('$HZ'); });
    document.getElementById('homeAll').addEventListener('click', () => { cancelJog(); sendCommand('$H'); });

    document.getElementById('settingsBtn').addEventListener('click', openSettings);
    document.getElementById('settingsCloseBtn').addEventListener('click', closeSettings);
    document.getElementById('settingsCancelBtn').addEventListener('click', closeSettings);
    document.getElementById('saveBtn').addEventListener('click', saveSettings);
    document.getElementById('settingsModal').addEventListener('click', (e) => {
        if (e.target.id === 'settingsModal') closeSettings();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !document.getElementById('settingsModal').hidden) closeSettings();
    });

    initializeCanvas();
    setupPointerEvents();

    // React to theme switches that re-inject :root vars.
    var themeObserver = new MutationObserver(setColors);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'class'] });

    // Re-fit canvas if container resizes.
    if (window.ResizeObserver) {
        new ResizeObserver(() => {
            initializeCanvas();
            setupPointerEvents();
        }).observe(parentDiv);
    }

    await loadSettings();

    // Subscribe to live status, then prime current state.
    try {
        await call('subscribe', { event: 'status' });
        var s = await call('getStatus');
        if (s && s.state) processStatus(s.state);
    } catch (e) {
        debug("status subscribe/getStatus failed: " + e.message);
    }

    // Pull FluidNC tuning info needed for jog timing.
    querySetting('$/axes/x/acceleration_mm_per_sec2');
    querySetting('$/axes/y/acceleration_mm_per_sec2');
    querySetting('$/axes/z/acceleration_mm_per_sec2');
    querySetting('$/planner_blocks');
}

window.addEventListener('load', () => setTimeout(init, 50));

// https://github.com/gnea/grbl/wiki/Grbl-v1.1-Jogging#joystick-implementation
function calcJogTimeMs(feedrate_mm_min, distance) {
    var a = Math.min(xAccel, yAccel);
    if (jogMode === "Z") a = zAccel;
    else if (jogMode === "X") a = xAccel;
    else if (jogMode === "Y") a = yAccel;

    var s = distance;
    var v = feedrate_mm_min / 60;
    var dt = s / v;
    var N = plannerBlocks;
    var ms = dt * 1000;

    var minMs = Math.pow(v, 2) / (2 * a * (N - 1));
    if (ms < minMs) ms = minMs;
    if (ms < 10) ms = 10;

    return dt * 1000;
}
