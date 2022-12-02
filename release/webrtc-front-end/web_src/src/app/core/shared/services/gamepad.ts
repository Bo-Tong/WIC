import { sysMsg } from '../models/msg';

const BUTTONS_RATIO = 255;
const AXES_RATIO = 127;
const AXES_THRESHOLD = AXES_RATIO * 0.04;
const requestAnimationFrame = window.requestAnimationFrame;
const gamepads: Gamepad[] = [];
const buttonsMap: any = new Map();
const axesMap: any = new Map();

export const gamepadTool = (dataChannel: RTCDataChannel, id: string): void => {
  const sendMsg = (message?: string, gpId?: number): void => {
    const msg: { isGamepad: boolean; data?: string; gpID?: number } = { isGamepad: true, data: undefined, gpID: undefined };
    msg.gpID = gpId;
    msg.data = message;
    dataChannel.send(JSON.stringify({ id, data: JSON.stringify(msg) }));
    if (message !== 'gpEnable' && message !== 'gpDisable') {
      message = 'c\n';
      msg.data = message;
      dataChannel.send(JSON.stringify({ id, data: JSON.stringify(msg) }));
    }
  };

  const resolveButton = (buttonId: number, pressed: boolean, value: number, gpId: number): void => {
    let message;
    const buttons = buttonsMap.get(gpId);
    switch (buttonId) {
      case 0:
      case 1:
      case 2:
      case 3:
        message = 'm 4 0\n';
        sendMsg(message, gpId);
    }
    switch (buttonId) {
      case 0: // BTN_A
        message = pressed ? 'k 304 1\n' : 'k 304 0\n';
        break;
      case 1: // BTN_B
        message = pressed ? 'k 305 1\n' : 'k 305 0\n';
        break;
      case 2: // BTN_X
        message = pressed ? 'k 307 1\n' : 'k 307 0\n';
        break;
      case 3: // BTN_Y
        message = pressed ? 'k 308 1\n' : 'k 308 0\n';
        break;
      case 4: // BTN_L1
        message = pressed ? 'k 310 1\n' : 'k 310 0\n';
        break;
      case 6: // BTN_L2 with value
        if (pressed) {
          if (buttons[6] === 0) {
            message = 'k 312 1\n';
            sendMsg(message, gpId);
            message = 'a 62 0\n';
            sendMsg(message, gpId);
          }
          message = `a 62 ${value}\n`;
        } else {
          message = 'a 62 0\n';
          sendMsg(message, gpId);
          message = 'k 312 0\n';
        }
        break;
      case 5: // BTN_R1
        message = pressed ? 'k 311 1\n' : 'k 311 0\n';
        break;
      case 7: // BTN_R2 with value
        if (pressed) {
          if (buttons[7] === 0) {
            message = 'k 313 1\n';
            sendMsg(message, gpId);
            message = 'a 63 0\n';
            sendMsg(message, gpId);
          }
          message = `a 63 ${value}\n`;
        } else {
          message = 'a 63 0\n';
          sendMsg(message, gpId);
          message = 'k 313 0\n';
        }
        break;
      case 8: // SHARE
        message = pressed ? 'k 314 1\n' : 'k 314 0\n';
        break;
      case 9: // OPTIONS
        message = pressed ? 'k 315 1\n' : 'k 315 0\n';
        break;
      case 10: // BTN_THUMBL
        message = pressed ? 'k 317 1\n' : 'k 317 0\n';
        break;
      case 11: // BTN_THUMBR
        message = pressed ? 'k 318 1\n' : 'k 318 0\n';
        break;
      case 12: // TOP
        message = pressed ? 'a 17 -1\n' : 'a 17 0\n';
        break;
      case 13: // Bottom
        message = pressed ? 'a 17 1\n' : 'a 17 0\n';
        break;
      case 14: // Left
        message = pressed ? 'a 16 -1\n' : 'a 16 0\n';
        break;
      case 15: // Right
        message = pressed ? 'a 16 1\n' : 'a 16 0\n';
        break;
      case 16: // PS
        message = pressed ? 'k 316 1\n' : 'k 316 0\n';
        break;
      case 17: // controller
        message = pressed ? 'k 288 1\n' : 'k 288 0\n';
        break;
      default:
        console.log('Button id is: ' + buttonId);
    }
    sendMsg(message, gpId);
  };

  const resolveAxes = (axesID: number, axesVal: string, gpId: number): void => {
    let message;
    switch (axesID) {
      case 0: // Left Stick East/West
        message = `a 0 ${axesVal}\n`;
        break;
      case 1: // Left Stick North/South
        message = `a 1 ${axesVal}\n`;
        break;
      case 2: // Right Stick East/West
        message = `a 2 ${axesVal}\n`;
        break;
      case 3: // Right Stick North/South
        message = `a 5 ${axesVal}\n`;
        break;
      default:
        console.log(`axe id is: ${axesID} axesVal = ${axesVal}`);
    }
    if (message) {
      sendMsg(message, gpId);
    }
  };

  const scanGamepads = (): void => {
    const gamepadsUpdated = navigator.getGamepads() ?? [];
    if (gamepadsUpdated && gamepadsUpdated.length) {
      for (let i = 0; i < gamepadsUpdated.length; i++) {
        if (gamepadsUpdated[i] && gamepadsUpdated[i]!.index in gamepads) {
          gamepads[gamepadsUpdated[i]!.index] = gamepadsUpdated[i]!;
        }
      }
    }
  };

  const updateGpData = (): void => {
    scanGamepads();
    gamepads.forEach((item): void => {
      const gp = item;
      for (let i = 0; i < gp.buttons.length; i++) {
        const button = gp.buttons[i];
        if (typeof button === 'object') {
          const pressed = button.pressed;
          const value = (button.value * BUTTONS_RATIO).toFixed(0);
          if (!buttonsMap.has(gp.index)) {
            return;
          }
          const buttons = buttonsMap.get(gp.index);
          if (+value !== buttons[i]) {
            resolveButton(i, pressed, +value, gp.index);
            pressed ? (buttons[i] = +value) : (buttons[i] = 0);
            buttonsMap.set(gp.index, buttons);
          }
        }
      }

      for (let i = 0; i < gp.axes.length; i++) {
        const value = (gp.axes[i] * AXES_RATIO).toFixed(0);
        if (!axesMap.has(gp.index)) {
          return;
        }
        const axes = axesMap.get(gp.index);
        if (axes[i] !== value && Math.abs(axes[i] - +value) > AXES_THRESHOLD) {
          resolveAxes(i, value, gp.index);
          axes[i] = +value;
          axesMap.set(gp.index, axes);
        }
      }
    });
    requestAnimationFrame(updateGpData);
  };

  const connectHandler = (e: GamepadEvent): void => {
    const gp = navigator.getGamepads()[e.gamepad.index];
    console.log(`Gamepad connected at index ${gp?.index}: ${gp?.id}. It has ${gp?.buttons.length} buttons and ${gp?.axes.length} axes.`);
    if (gp?.mapping === 'standard') {
      console.log(sysMsg.gamepadMsg.Standard);
    } else {
      console.log(sysMsg.gamepadMsg.NoStandard);
      return;
    }
    const buttons = new Array(gp.buttons.length);
    const axes = new Array(gp.axes.length);
    for (let i = 0; i < gp.buttons.length; i++) {
      buttons[i] = 0;
    }
    buttonsMap.set(gp.index, buttons);
    for (let i = 0; i < gp.axes.length; i++) {
      axes[i] = (gp.axes[i] * AXES_RATIO).toFixed(0);
    }
    axesMap.set(gp.index, axes);
    gamepads[gp.index] = gp;
    sendMsg('gpEnable', gp.index);
    requestAnimationFrame(updateGpData);
  };

  const disconnectHandler = (e: GamepadEvent): void => {
    const gp = e.gamepad;
    console.log(`Gamepad disconnected at index ${gp?.index}: ${gp?.id}. It has ${gp?.buttons.length} buttons and ${gp?.axes.length} axes.`);
    delete gamepads[gp.index];
    delete buttonsMap[gp.index];
    delete axesMap[gp.index];
    sendMsg('gpDisable', gp.index);
  };

  if ('GamepadEvent' in window) {
    window.addEventListener('gamepadconnected', connectHandler as EventListener);
    window.addEventListener('gamepaddisconnected', disconnectHandler as EventListener);
  } else {
    console.log(sysMsg.gamepadMsg.NoGamepad);
    setInterval(scanGamepads, 500);
  }
};
