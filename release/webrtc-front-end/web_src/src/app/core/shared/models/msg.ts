export const sysMsg = {
  baseMsg: {
    NoMatch: 'No match (404)',
    ServiceError: 'Network error!',
    Unexpected: 'Unexpected Error!',
    Loading: 'Loading...'
  },
  userMsg: {
    NoMatchUser: 'Incorrect username or password!',
    Invalid: 'Invalid field!',
    PwdNotMatch: 'Password not match!',
    PwdRegText: 'At least 8 characters including one letter and one number!',
    DuplicateUsername: 'Username exist!'
  },
  panelMsg: {
    Uploading: 'Uploading...',
    UploadSuccess: 'Upload success!',
    UploadFail: 'Upload fail!',
    UploadIntro: 'Click or drag file to this area to upload or install',
    UploadSubIntro: `File will be uploaded to '/data/local/tmp'`,
    FileTypeApk: 'Must be APK file!',
    FileLimit1G: 'File size can not larger than 1G!',
    FileNameErr: 'Invalid filename!',
    TerminalClose: 'Terminal closed.'
  },
  socketMsg: {
    StartConnect: 'Start connecting to Websocket',
    Connect: 'Websocket server connected.',
    Error: 'Socket.IO error: ',
    ConnectFail: 'Fail to connect with websocket server, error: ',
    Disconnect: 'Disconnect with the websocket server.',
    ServerDisconnect: 'Server disconnected.',
    ServerAuthenticated: 'Server authenticated',
    OwtMsg: 'owt-message:',
    Close: 'Websocket closed',
    DisconnectInstance: 'Instance Disconnected',
    ReceivedMsg: 'Channel received message: ',
    WrongMsg: 'Invalid signaling message received. Type: '
  },
  p2pMsg: {
    Building: 'Establishing P2P connection',
    Connect: 'P2P connected',
    Error: 'Connection error',
    NoExist: 'Instance does not exist!',
    Occupied: 'Instance has been occupied!',
    Disconnect: 'P2P disconnect'
  },
  dcMsg: {
    Open: 'The Data Channel is Opened',
    Error: 'Data Channel Error:',
    Close: 'The Data Channel is Closed',
    SensorLaunch: 'Sensor app is launched..',
    SensorExit: 'Sensor app exit..',
    StartAudio: 'Start audio stream is requested.',
    StartVideo: 'Start video stream is requested.',
    StopAudio: 'Stop stream is requested.',
    StopVideo: 'Stop video stream is requested.',
    Invalid: 'Invalid constrains',
    NoVideo: 'Cannot share screen without video.',
    WrongSrc: 'Cannot capture video from screen cast while capture audio from other source.',
    NoStream: 'At least one of audio and video must be requested.',
    Illegal: 'Illegal argument.',
    StopPublicationId: 'stopPublication: Track id: ',
    StopPublicationKind: 'stopPublication: Track kind: ',
    StopPublicationLabel: 'stopPublication: Track label: '
  },
  gamepadMsg: {
    Standard: 'Controller has standard mapping.',
    NoStandard: 'Controller does not have standard mapping.',
    NoGamepad: 'There is no gamepad event in window right now. Begin scan.'
  }
};
