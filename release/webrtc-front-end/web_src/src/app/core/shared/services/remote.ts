import { touchInfo } from '../models/rtc-socket-config';

import { gamepadTool } from './gamepad';

export const remote = (id: string, remoteVideo: HTMLVideoElement, dataChannel: RTCDataChannel): void => {
  const remoteVideoLeft = remoteVideo.getBoundingClientRect().left;
  const remoteVideoTop = remoteVideo.getBoundingClientRect().top;

  gamepadTool(dataChannel, id);

  remoteVideo.addEventListener('touchstart', function(e: TouchEvent): void {
    e.preventDefault();
    const parameters = {
      // Must pass more than 3 params.
      // tslint:disable-next-line: deprecation
      which: e.which,
      x: ((e.changedTouches[0].clientX - remoteVideoLeft) * touchInfo.max_x) / remoteVideo.clientWidth,
      y: ((e.changedTouches[0].clientY - remoteVideoTop) * touchInfo.max_y) / remoteVideo.clientHeight
    };
    dataChannel.send(
      JSON.stringify({
        id,
        data: JSON.stringify({
          type: 'control',
          data: { event: 'mousedown', parameters }
        })
      })
    );
  });

  remoteVideo.addEventListener('touchmove', function(e: TouchEvent): void {
    e.preventDefault();
    const parameters = {
      // Must pass more than 3 params.
      // tslint:disable-next-line: deprecation
      which: e.which,
      x: ((e.changedTouches[0].clientX - remoteVideoLeft) * touchInfo.max_x) / remoteVideo.clientWidth,
      y: ((e.changedTouches[0].clientY - remoteVideoTop) * touchInfo.max_y) / remoteVideo.clientHeight
    };
    dataChannel.send(
      JSON.stringify({
        id,
        data: JSON.stringify({
          type: 'control',
          data: { event: 'mousemove', parameters }
        })
      })
    );
  });

  remoteVideo.addEventListener('touchend', function(e: TouchEvent): void {
    e.preventDefault();
    const parameters = {
      // Must pass more than 3 params.
      // tslint:disable-next-line: deprecation
      which: e.which,
      x: ((e.changedTouches[0].clientX - remoteVideoLeft) * touchInfo.max_x) / remoteVideo.clientWidth,
      y: ((e.changedTouches[0].clientY - remoteVideoTop) * touchInfo.max_y) / remoteVideo.clientHeight
    };
    dataChannel.send(
      JSON.stringify({
        id,
        data: JSON.stringify({
          type: 'control',
          data: { event: 'mouseup', parameters }
        })
      })
    );
  });

  remoteVideo.onmousedown = function(e: MouseEvent): void {
    e.preventDefault();
    const parameters = {
      // Must pass more than 3 params.
      // tslint:disable-next-line: deprecation
      which: e.which,
      x: (e.offsetX * touchInfo.max_x) / remoteVideo.clientWidth,
      y: (e.offsetY * touchInfo.max_y) / remoteVideo.clientHeight
    };
    dataChannel.send(
      JSON.stringify({
        id,
        data: JSON.stringify({
          type: 'control',
          data: { event: 'mousedown', parameters }
        })
      })
    );
  };

  remoteVideo.onmouseup = function(e: MouseEvent): void {
    e.preventDefault();
    const parameters = {
      // Must pass more than 3 params.
      // tslint:disable-next-line: deprecation
      which: e.which,
      x: (e.offsetX * touchInfo.max_x) / remoteVideo.clientWidth,
      y: (e.offsetY * touchInfo.max_y) / remoteVideo.clientHeight
    };
    dataChannel.send(
      JSON.stringify({
        id,
        data: JSON.stringify({
          type: 'control',
          data: { event: 'mouseup', parameters }
        })
      })
    );
  };

  remoteVideo.onmousemove = function(e: MouseEvent): void {
    e.preventDefault();
    if (touchInfo && e.buttons === 1) {
      const mouseX = (e.offsetX * touchInfo.max_x) / remoteVideo.clientWidth;
      const mouseY = (e.offsetY * touchInfo.max_y) / remoteVideo.clientHeight;
      const parameters: any = {};
      parameters.x = mouseX;
      parameters.y = mouseY;
      parameters.movementX = e.movementX;
      parameters.movementY = e.movementY;
      // Must pass more than 3 params.
      // tslint:disable-next-line: deprecation
      parameters.which = e.which;
      dataChannel.send(
        JSON.stringify({
          id,
          data: JSON.stringify({
            type: 'control',
            data: { event: 'mousemove', parameters }
          })
        })
      );
    }
  };
};
