import { Subject } from 'rxjs';
import io from 'socket.io-client';

import { sysMsg } from '../models/msg';
import { checkMessageSize, msgPayload, socketConfig, SocketEvent } from '../models/rtc-socket-config';

import { messageHandler } from './peer-connection';

let isConnected = 0;
let connectPromise: any | null = null;
export let wsServer: SocketIOClient.Socket;
export let offer: RTCSessionDescription;
export const candidates: RTCIceCandidate[] = [];
export const buildConnectSubject = new Subject<number>();
export const answer = new Subject<RTCSessionDescription>();

export const connect = (token: string): Promise<void> => {
  const parameters: string[] = [];
  parameters.push(`clientType=${socketConfig.clientType}`);
  parameters.push(`clientVersion=${socketConfig.clientVersion}`);
  parameters.push(`isClient=${socketConfig.isClient}`);
  parameters.push(`token=${encodeURIComponent(token)}`);

  const opts = {
    query: parameters.join('&'),
    reconnection: false,
    forceNew: true,
    reconnectionAttempts: 10
  };

  wsServer = io(socketConfig.url, opts);

  wsServer.on(SocketEvent.Connect, function(): void {
    console.log(sysMsg.socketMsg.Connect);
  });

  wsServer.on(SocketEvent.ServerAuthenticated, function(data: { uid: string }): void {
    console.log(`Authentication passed. User ID: ${data.uid}`);
    if (checkMessageSize(data)) {
      if (connectPromise) {
        connectPromise.resolve(data.uid);
      }
      connectPromise = null;
    }
  });

  wsServer.on(SocketEvent.Error, function(err: string): void {
    console.error(sysMsg.socketMsg.Error + err);
    if (connectPromise) {
      connectPromise.reject(err);
    }
    connectPromise = null;
  });

  wsServer.on(SocketEvent.ConnectFail, function(errorCode: string): void {
    console.error(sysMsg.socketMsg.ConnectFail + errorCode);
    if (connectPromise) {
      connectPromise.reject(parseInt(errorCode, undefined));
    }
    connectPromise = null;
  });

  wsServer.on(SocketEvent.Disconnect, function(reason: string): void {
    console.log(sysMsg.socketMsg.Disconnect + reason);
  });

  wsServer.on(SocketEvent.ServerDisconnect, function(): void {
    console.log(sysMsg.socketMsg.ServerDisconnect);
  });

  wsServer.on(SocketEvent.OwtMsg, function(message: { data: string; type: string }): void {
    messageHandler(message);
  });

  return new Promise((resolve, reject): void => {
    connectPromise = {
      resolve,
      reject
    };
  });
};

export const send = function(targetId: string, message: Object): Promise<void> {
  return new Promise((resolve, reject): void => {
    wsServer.emit(SocketEvent.OwtMsg, msgPayload(targetId, message), function(err: Error): void {
      err ? reject(err) : resolve();
    });
  });
};

export const disconnect = (targetId: string): Promise<void> => {
  return new Promise((resolve, reject): void => {
    if (wsServer && isConnected === 1) {
      isConnected = 0;
      wsServer.emit(SocketEvent.DisconnectInstance, { to: targetId }, function(err: Error): void {
        err ? reject(err) : resolve();
      });
      console.log(sysMsg.socketMsg.DisconnectInstance);
    }
  });
};
