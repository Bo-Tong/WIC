'use strict';
var isVideo = 1;
var connected = false;
var isUrlCorrect = 0;
var isTest = false;
var serverAddress = 'http://MASTER_NODE_IP:SIGNAL_PORT'; // Please change example.com to signaling server's address.
var query = window.location.search.substring(1);
const MAX_URL_SIZE = 1024;
const appList = [
  { param: 'launcher', value: 'com.android.launcher3' },
  { param: 'settings', value: 'com.android.settings' },
  { param: 'subwaysurf', value: 'com.kiloo.subwaysurf' },
]

if (query.length > MAX_URL_SIZE) {
  console.error("ERROR: The URL message size " + query.length + " is too long.");
} else {
  var sId = resolveUrl(query, 'sId').toString();
  var p = resolveUrl(query, 'p').toString();
  var app = resolveUrl(query, 'app').toString();

  if (app == 'false') {
    app = 'launcher';
  }

  if (sId == 'false') {
    console.log('Wrong configs');
  } else {
    isUrlCorrect = 1;
  }

  if (p == 'manual') {
    isTest = true;
  } 

  const signaling = new SignalingChannel();
  let mouseX;
  let mouseY;
  let touch_info = {
      max_x: 32767,
      max_y: 32767
  };
  var p2p = new Owt.P2P.P2PClient({
    audioEncodings: true,
    videoEncodings: [{
      codec: {
        name: 'h264'
      }
    }, {
      codec: {
        name: 'vp9'
      }
    }, {
      codec: {
        name: 'vp8'
      }
    }],
    rtcConfiguration: {
      iceServers: [{
        urls: "stun:MASTER_NODE_IP:3478",
        credential: "password",
        username: "username"
      }, {
        urls: [
          "turn:MASTER_NODE_IP:3478?transport=udp",
          "turn:MASTER_NODE_IP:3478?transport=tcp"
        ],
        credential: "password",
        username: "username"
      }]
    },
  }, signaling);

  var localStream;
  var localScreen;
  
  var getTargetId = function () {
    return 's' + sId;
  };

  const sendData = function (type, event, parameters) {
    let sendMsg = {};
    switch (type) {
      case 'ctrl':
        const ctrl = {
          type: 'control',
          data: {
            event: event,
            parameters: parameters
          }
        }
        sendMsg = ctrl;
        break;
      case 'icr':
        const icr_params = {};
        icr_params[event] = parameters;
        sendMsg = {icr_params};
        console.log(JSON.stringify(sendMsg))
        break;
      case 'cmd':
        const cmd_channel_params = {};
        cmd_channel_params[event] = parameters;
        sendMsg = {cmd_channel_params};
        console.log(JSON.stringify(sendMsg))
        break;
      default:
        console.log('Wrong message type');
    }
    if (connected)
      p2p.send(getTargetId(), JSON.stringify(sendMsg)).catch((error) => {
        console.log("Catch " + error.name + ": " + error.message);
      });
  }
	
  console.log('new server ip address is ' + serverAddress);

  p2p.allowedRemoteIds = [getTargetId()];

  if (isUrlCorrect == 1) {
    p2p.connect({
      host: serverAddress,
      token: 'c' + sId
    }).then(() => {
      const pkgVal = appList.some(item => item.param == app) ? appList.find(item => item.param == app).value : app;
      p2p.send(getTargetId(), JSON.stringify({'cmd_channel_params': {'pkg': pkgVal}})).then(() => p2p.send(getTargetId(), 'start'));
      new gamepadTool(p2p, getTargetId());
      if (isTest) {
        testMode();
      }
    }, error => {
      console.log('Failed to connect to the signaling server.');
    }); // Connect to signaling server.
  };

  function testMode() {
    const testStyle = {
      'max-width': '100vw',
      'max-height': '100vh',
      'object-fit': 'contain'
    }
    $('#test-body ').css('display', 'block');
    $('#remoteVideo').css(testStyle);

    const resOpts = [
      { text: '1024 x 600', value: '1024x600'},
      { text: '1024 x 800', value: '1024x800'},
      { text: '1280 x 720', value: '1280x720'},
      { text: '1280 x 800', value: '1024x800'},
      { text: '1920 x 1080', value: '1920x1080'}
    ]

    const bitSelect = document.getElementById('bit-select');
    const icrSelect = document.getElementById('icr-select');
    const fpsSelect = document.getElementById('fps-select');
    const resSelect = document.getElementById('res-select');
    const modeSelect = document.getElementById('mode-select');

    if (bitSelect) {
      for (let i = 0; i < 40; i++) {
        bitSelect.add(new Option((i + 1) * 100 + ' kbps', (i + 1) * 100));
      }
    }
    if (resSelect) {
      for (let i = 0; i < resOpts.length; i++) {
        resSelect.add(new Option(resOpts[i].text, resOpts[i].value));
      }
    }

    icrSelect.onchange = () => {
      icrSelect.options[icrSelect.selectedIndex].value != '' ?  $('#send-icr').prop('disabled', false) : $('#send-icr').prop('disabled', true);
    }
    bitSelect.onchange = () => {
      bitSelect.options[bitSelect.selectedIndex].value != '' ?  $('#send-bit').prop('disabled', false) : $('#send-bit').prop('disabled', true);
    }
    resSelect.onchange = () => {
      resSelect.options[resSelect.selectedIndex].value != '' ?  $('#send-res').prop('disabled', false) : $('#send-res').prop('disabled', true);
    }
    fpsSelect.onchange = () => {
      fpsSelect.options[fpsSelect.selectedIndex].value != '' ?  $('#send-fps').prop('disabled', false) : $('#send-fps').prop('disabled', true);
    }
    modeSelect.onchange = () => {
      modeSelect.options[modeSelect.selectedIndex].value != '' ?  $('#send-mode').prop('disabled', false) : $('#send-mode').prop('disabled', true);
    }
    
    $('#send-icr').click(function() {
      sendData('icr', 'run', icrSelect.options[icrSelect.selectedIndex].value);
    })
    $('#send-bit').click(function() {
      sendData('icr', 'bitrate', bitSelect.options[bitSelect.selectedIndex].value);
    })
    $('#send-res').click(function() {
      sendData('icr', 'resolution', resSelect.options[resSelect.selectedIndex].value);
    })
    $('#send-fps').click(function() {
      sendData('icr', 'fps', fpsSelect.options[fpsSelect.selectedIndex].value);
    })
    $('#send-mode').click(function() {
      sendData('icr', 'manual_mode', modeSelect.options[modeSelect.selectedIndex].value);
    })
    $('#cmd-back').click(function() {
      sendData('cmd', 'cmd', 'input keyevent 4');
    })
  }

  p2p.addEventListener('streamadded', function (e) { // A remote stream is available.
    connected = true;
    console.log('Stream is added connected = true');
    e.stream.addEventListener('ended', () => {
      remoteVideo.srcObject = undefined;
      console.log('Stream is removed.');
    });
    if (e.stream.source.audio || e.stream.source.video) {
      remoteVideo.srcObject = e.stream.mediaStream;
    }
  });

  p2p.addEventListener('messagereceived', function (e) {
    console.log('Channel received message: ' + e.message);
    var jsonObj = JSON.parse(e.message);
    var curPkg;
    var newPkg;

    if (jsonObj != null) {
      switch (jsonObj.key) {
        case 'ASN':
          curPkg = jsonObj.cur.pkg;
          newPkg = jsonObj.new.pkg;

          if (curPkg != newPkg) {
              //onDisconnectInstance(getTargetId());
              if (newPkg.includes('sensor')) {
                  console.log('Sensor app is launched..');
                  p2p.send(getTargetId(), "start-sensor-feed");
              } else if (curPkg.includes('sensor')) {
                  console.log('Sensor app exit..');
                  p2p.send(getTargetId(), "stop-sensor-feed");
              }
          }
          break;
        case 'start-audio':
          // Audio stream is requested.
          // We now start streaming local audio to peer.
          console.log("Start audio stream is requested.");
          // start audio-only stream
          publishLocalStream('mic', undefined);
          break;
        case 'start-camera-preview':
          // Start camera preview
          console.log("Start video stream is requested.");
          publishLocalStream(undefined, 'camera');
          break;
        case 'stop-audio':
          // Stop audio stream is requested.
          // Stop publishing local stream now.
          console.log("Stop stream is requested.");
          stopPublication(localAudioStream);
          break;
        case 'stop-camera-preview':
          console.log("Stop video stream is requested.");
          stopPublication(localVideoStream);
          break;
        default:
          console.log('No match key');
      }
    }
  });

  remoteVideo.addEventListener("mousemove", event => {
    event.preventDefault();
    if(event.buttons == 1) {
      mouseX = event.offsetX * touch_info.max_x / remoteVideo.clientWidth;
      mouseY = event.offsetY * touch_info.max_y / remoteVideo.clientHeight;
      const parameters = {};
      parameters.x = mouseX;
      parameters.y = mouseY;
      parameters.movementX = event.movementX;
      parameters.movementY = event.movementY;
      sendData('ctrl', 'mousemove', parameters);
    }
  });
  
  remoteVideo.addEventListener("touchstart", e => {
      e.preventDefault();
      let remoteVideoLeft = remoteVideo.getBoundingClientRect().left;
      let remoteVideoTop = remoteVideo.getBoundingClientRect().top;
      sendData('ctrl', 'mousedown', {
        which: e.which,
        x: (e.changedTouches[0].clientX - remoteVideoLeft)* touch_info.max_x / remoteVideo.clientWidth,
        y: (e.changedTouches[0].clientY - remoteVideoTop)* touch_info.max_y / remoteVideo.clientHeight
      });
  })
  
  remoteVideo.addEventListener("touchend", e => {
      e.preventDefault();
      let remoteVideoLeft = remoteVideo.getBoundingClientRect().left;
      let remoteVideoTop = remoteVideo.getBoundingClientRect().top;
      sendData('ctrl', 'mouseup', {
        which: e.which,
        x: (e.changedTouches[0].clientX - remoteVideoLeft)* touch_info.max_x / remoteVideo.clientWidth,
        y: (e.changedTouches[0].clientY - remoteVideoTop)* touch_info.max_y / remoteVideo.clientHeight
      });
  });

  remoteVideo.addEventListener("touchmove", e => {
      e.preventDefault();
      let remoteVideoLeft = remoteVideo.getBoundingClientRect().left;
      let remoteVideoTop = remoteVideo.getBoundingClientRect().top;
      sendData('ctrl', 'mousemove', {
        which: e.which,
        x: (e.changedTouches[0].clientX - remoteVideoLeft)* touch_info.max_x / remoteVideo.clientWidth,
        y: (e.changedTouches[0].clientY - remoteVideoTop)* touch_info.max_y / remoteVideo.clientHeight
      });
  });
  
  remoteVideo.onmouseup = function (e) {
    e.preventDefault();
    sendData('ctrl', 'mouseup', {
      which: e.which,
      x: e.offsetX * touch_info.max_x / remoteVideo.clientWidth,
      y: e.offsetY * touch_info.max_y / remoteVideo.clientHeight
    });
  }
  
  remoteVideo.onmousedown = function (e) {
    e.preventDefault();
    sendData('ctrl', 'mousedown', {
      which: e.which,
      x: e.offsetX * touch_info.max_x / remoteVideo.clientWidth,
      y: e.offsetY * touch_info.max_y / remoteVideo.clientHeight
    });
  };
  
  function resolveUrl(query, variable) {
    var vars = query.split(',');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (pair[0] == variable) {
            return pair.slice(1, pair.length).join('=');
        }
    }
    return (false);
  }

  let localAudioStream;
  let localVideoStream;
  let publicationForAudio; // audio-only
  let publicationForVideo; // video-only

  function stopPublication(localStream) {
    // FIXME: Stop publication is not working.
    // May be because publication was never returned success.
    // However, if we stop all the tracks of the local stream,
    // publication ends anyway.
    for (const track of localStream.mediaStream.getTracks()) {
        console.log("stopPublication: Track id: " + track.id);
        console.log("stopPublication: Track kind: " + track.kind);
        console.log("stopPublication: Track label: " + track.label);
        track.stop();
    }
    localStream.mediaStream = undefined;
  }

  function publishLocalStream(audioSource, videoSource) {
    let audioConstraintsForMic;
    let videoConstraintsForCamera;
    let localStream;

    if (audioSource == 'mic') {
        audioConstraintsForMic = new Owt.Base.AudioTrackConstraints(Owt.Base.AudioSourceInfo.MIC);
    }

    if (videoSource == 'camera') {
        videoConstraintsForCamera = new Owt.Base.VideoTrackConstraints(Owt.Base.VideoSourceInfo.CAMERA);
        videoConstraintsForCamera.resolution = {
            width: 640,
            height: 480
        };
        videoConstraintsForCamera.frameRate = 30;
    }

    let mediaStream;

    console.log(publishLocalStream.name + ": audioSource: " + audioSource + ", videoSource: " + videoSource);

    Owt.Base.MediaStreamFactory.createMediaStream(new Owt.Base.StreamConstraints(audioConstraintsForMic, videoConstraintsForCamera))
        .then(stream => {
            mediaStream = stream;
            if (audioSource == undefined) { // video-only
                localVideoStream = new Owt.Base.LocalStream(mediaStream,
                    new Owt.Base.StreamSourceInfo(audioSource, videoSource));
                localStream = localVideoStream;
            } else if (videoSource == undefined) { // audio-only
                localAudioStream = new Owt.Base.LocalStream(mediaStream,
                    new Owt.Base.StreamSourceInfo(audioSource, videoSource));
                localStream = localAudioStream;
            }

            console.log(publishLocalStream.name + ": Local media stream created. Id: " + localStream.mediaStream.id);

            // may be useful for debugging
            // $(`#localAudio`).get(0).srcObject = localStream.mediaStream;
            // $(`#localVideo`).get(0).srcObject = localStream.mediaStream;

            p2p.publish(getTargetId(), localStream)
                .then(publication => {
                    if (audioSource == undefined)
                        publicationForVideo = publication;
                    else if (videoSource == undefined)
                        publicationForAudio = publication;

                    console.log(publishLocalStream.name + ": Local stream is published.");
                }, error => {
                    console.log(publishLocalStream.name + ": Failed to publish local stream, error:" + error);
                });
        }, err => {
            console.error(publishLocalStream.name + ": Failed to create media stream, error: " + err);
        });
        console.log(publishLocalStream.name + ": out");
  }

  window.onbeforeunload = function () {
    p2p.stop('s' + sId);
    p2p.allowedRemoteIds = null;
    p2p.disconnect();
    connected = false;
  };
}
