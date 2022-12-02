interface MsgPayloadProps {
  data: string;
  to: string;
}

export interface SocketConfig {
  url: string;
  clientType?: string;
  clientVersion?: string;
  isClient?: boolean;
}

export const socketConfig: SocketConfig = {
  url: `http://${process.env.REACT_APP_BACKEND_HOST}:30000`,
  clientType: 'Web',
  clientVersion: '4.2',
  isClient: true
};

export enum SocketEvent {
  Connect = 'connect',
  Error = 'error',
  ConnectFail = 'connect_fail',
  Disconnect = 'disconnect',
  ServerDisconnect = 'server-disconnect',
  ServerAuthenticated = 'server-authenticated',
  OwtMsg = 'owt-message',
  BuildP2PConnect = 'build-p2p-connect',
  DisconnectInstance = 'disconnect-instance'
}

export enum RTCSdpTypes {
  Offer = 'offer',
  Candidates = 'candidates',
  Answer = 'answer'
}

export enum BuildP2PType {
  Connect = 1,
  Error = -1,
  NoExist = 0,
  Occupied = 2
}

export enum SignalingType {
  Started = 'chat-started',
  Denied = 'chat-denied',
  Closed = 'chat-closed',
  NegotiationNeeded = 'chat-negotiation-needed',
  TrackSources = 'chat-track-sources',
  StreamInfo = 'chat-stream-info',
  Sdp = 'chat-signal',
  TracksAdded = 'chat-tracks-added',
  TracksRemoved = 'chat-tracks-removed',
  DataReceived = 'chat-data-received',
  UA = 'chat-ua'
}

export enum DataChannelMsgType {
  ASN = 'ASN',
  StartAudio = 'start-audio',
  StartVideo = 'start-camera-preview',
  StopAudio = 'stop-audio',
  StopVideo = 'stop-camera-preview'
}

export const rtcConfig: RTCConfiguration = {
  iceServers: [
    {
      urls: `stun:${process.env.REACT_APP_BACKEND_HOST}:3478`,
      credential: 'password',
      username: 'username'
    },
    {
      urls: [
        `turn:${process.env.REACT_APP_BACKEND_HOST}:3478?transport=tcp`,
        `turn:${process.env.REACT_APP_BACKEND_HOST}:3478?transport=udp`
      ],
      credential: 'password',
      username: 'username'
    }
  ]
};

export const msgPayload = (id: string, msg: any): MsgPayloadProps => {
  return {
    data: typeof msg === 'string' ? msg : JSON.stringify(msg),
    to: id
  };
};

export const checkMessageSize = function(data: any): boolean {
  const MAX_MESSAGE_SIZE = 1073741824;
  if (JSON.stringify(data).length > MAX_MESSAGE_SIZE) {
    console.error(`ERROR: The received message size ${JSON.stringify(data).length} is too large.`);
    return false;
  }
  return true;
};

export const touchInfo = {
  max_x: 32767,
  max_y: 32767
};
