import { sysMsg } from '../models/msg';
import { rtcConfig, DataChannelMsgType, SignalingType } from '../models/rtc-socket-config';
import { isFirefox } from '../utils/browser';
import { createUuid } from '../utils/create-uid';
import { reorderCodecs } from '../utils/for-webrtc';

import { publishLocalStream, stopPublication } from './publication';
import { remote } from './remote';
import { send } from './socket.io';

let remoteId = '';
export let isNegotiationNeeded = false;
export let addedTrackIds: any[] = [];
const pendingStreams: any[] = [];
export const remoteIceCandidates: any[] = [];
const remoteStreams: any[] = [];
const publishingStreams: any[] = [];
const pendingUnpublishStreams: any[] = [];
const remoteStreamInfo: any = new Map();
const publishedStreams = new Map();
const remoteTrackSourceInfo = new Map();
const publishPromises: any = new Map();
const unpublishPromises: any = new Map();
const publishingStreamTracks = new Map();
const publishedStreamTracks = new Map();
export const dataChannels: any = new Map();
export let pc: RTCPeerConnection;
export const pendingMessages: any[] = [];
export const sendDataPromises: any = new Map();

function unpublish(stream: any): Promise<void> {
  if (!publishedStreams.has(stream)) {
    return Promise.reject('Illegal argument.');
  }
  pendingUnpublishStreams.push(stream);
  return new Promise((resolve, reject): void => {
    unpublishPromises.set(stream.mediaStream.id, {
      resolve,
      reject
    });
    drainPendingStreams();
  });
}

export function setCodecOrder(sdp?: string): string | undefined {
  const audioCodecNames = Array.from([]);
  sdp = reorderCodecs(sdp, 'audio', audioCodecNames);
  const videoCodecNames = Array.from([]);
  sdp = reorderCodecs(sdp, 'video', videoCodecNames);
  return sdp;
}

function setRtpReceiverOption(sdp?: string): string | undefined {
  sdp = setCodecOrder(sdp);
  return sdp;
}

function createAndSendOffer(): void {
  if (!pc) {
    return;
  }

  isNegotiationNeeded = false;
  let localDesc: RTCSessionDescriptionInit;

  pc.createOffer()
    .then((desc): Promise<void> | undefined => {
      desc.sdp = setRtpReceiverOption(desc.sdp);
      localDesc = desc;
      if (pc.signalingState === 'stable') {
        return pc.setLocalDescription(desc).then(
          (): Promise<void> => {
            return send(remoteId, { type: SignalingType.Sdp, data: localDesc });
          }
        );
      }
    })
    .catch((e): void => {
      // stop(e, true);
    });
}

function createAndSendAnswer(): void {
  drainPendingStreams();
  isNegotiationNeeded = false;

  let localDesc: RTCSessionDescriptionInit;
  pc.createAnswer()
    .then((desc): Promise<void> | undefined => {
      desc.sdp = setRtpReceiverOption(desc.sdp);
      localDesc = desc;

      console.log('Current description: ' + JSON.stringify(pc.currentLocalDescription));
      console.log('Pending description: ' + JSON.stringify(pc.pendingLocalDescription));
      return pc.setLocalDescription(desc);
    })
    .then(
      (): Promise<void> => {
        return send(remoteId, { type: SignalingType.Sdp, data: localDesc });
      }
    )
    .catch((e): void => {
      // stop(e, true);
    });
}

export function onNegotiationNeeded(): void {
  if (pc.signalingState === 'stable') {
    createAndSendOffer();
  } else {
    isNegotiationNeeded = true;
  }
}

export function bindEventsToDataChannel(dc: RTCDataChannel): void {
  dc.onmessage = (event): void => {
    // For debugger;
    console.log(JSON.parse(event.data).data);
    const jsonObj = JSON.parse(JSON.parse(event.data).data);
    let curPkg;
    let newPkg;

    if (jsonObj) {
      switch (jsonObj.key) {
        case DataChannelMsgType.ASN:
          curPkg = jsonObj.cur.pkg;
          newPkg = jsonObj.new.pkg;

          if (curPkg !== newPkg) {
            if (newPkg.includes('sensor')) {
              console.log(sysMsg.dcMsg.SensorLaunch);
              dc.send(JSON.stringify({ remoteId, data: 'start-sensor-feed' }));
            } else if (curPkg.includes('sensor')) {
              console.log(sysMsg.dcMsg.SensorExit);
              dc.send(JSON.stringify({ remoteId, data: 'start-sensor-feed' }));
            }
          }
          break;
        case DataChannelMsgType.StartAudio:
          console.log(sysMsg.dcMsg.StartAudio);
          publishLocalStream(remoteId, 'mic', undefined);
          break;
        case DataChannelMsgType.StartVideo:
          console.log(sysMsg.dcMsg.StartVideo);
          publishLocalStream(remoteId, undefined, 'camera');
          break;
        case DataChannelMsgType.StopAudio:
          stopPublication();
          console.log(sysMsg.dcMsg.StopAudio);
          break;
        case DataChannelMsgType.StopVideo:
          stopPublication();
          console.log(sysMsg.dcMsg.StopVideo);
      }
    }
  };
  dc.onopen = (): void => {
    setTimeout((): void => {
      dc.send(JSON.stringify({ id: remoteId, data: 'start' }));
      setTimeout((): void => {
        const video = document.getElementsByTagName('video')[0];
        if (dc && video) {
          remote(remoteId, video, dc);
        }
      }, 1000);
    }, 10);
  };
  dc.onclose = (): void => {
    console.log(sysMsg.dcMsg.Close);
  };
  dc.onerror = (error): void => {
    console.log(sysMsg.dcMsg.Error + JSON.stringify(error));
  };
}

// Make sure |_pc| is available before calling this method.
export function createDataChannel(label: string): void {
  if (dataChannels.has(label)) {
    console.log(`Data channel labeled ${label} already exists.`);
    return;
  }
  if (!pc) {
    console.log('PeerConnection is not available before creating DataChannel.');
    return;
  }
  console.log('Create data channel.');
  const dc = pc.createDataChannel(label);
  bindEventsToDataChannel(dc);
  dataChannels.set('message', dc);
  onNegotiationNeeded();
}

export function drainPendingMessages(): void {
  console.log('Draining pending messages.');
  const dc = dataChannels.get('message');
  if (pc && !dc) {
    createDataChannel('message');
  }
}

export function drainPendingStreams(): void {
  let negotiationNeeded = false;
  console.log('Draining pending streams.');
  if (pc && pc.signalingState === 'stable') {
    console.log('Peer connection is ready for draining pending streams.');
    for (let i = 0; i < pendingStreams.length; i++) {
      const stream = pendingStreams[i];
      // OnNegotiationNeeded event will be triggered immediately after adding stream to PeerConnection in Firefox.
      // And OnNegotiationNeeded handler will execute drainPendingStreams. To avoid add the same stream multiple times,
      // shift it from pending stream list before adding it to PeerConnection.
      pendingStreams.shift();
      if (!stream.mediaStream) {
        continue;
      }
      for (const track of stream.mediaStream.getTracks()) {
        pc.addTrack(track, stream.mediaStream);
        negotiationNeeded = true;
      }
      console.log('Added stream to peer connection.');
      publishingStreams.push(stream);
    }
    pendingStreams.length = 0;
    for (let j = 0; j < pendingUnpublishStreams.length; j++) {
      if (!pendingUnpublishStreams[j].mediaStream) {
        continue;
      }
      pc.removeTrack(pendingUnpublishStreams[j].mediaStream);
      negotiationNeeded = true;
      unpublishPromises.get(pendingUnpublishStreams[j].mediaStream.id).resolve();
      publishedStreams.delete(pendingUnpublishStreams[j]);
      console.log('Remove stream.');
    }
    pendingUnpublishStreams.length = 0;
  }
  if (negotiationNeeded) {
    onNegotiationNeeded();
  }
}

function doMaxBitrate(sdp: any, options: any): any {
  if (typeof options.audioEncodings === 'object') {
  }
  if (typeof options.videoEncodings === 'object') {
  }
  return sdp;
}

function setRtpSenderOptions(sdp: any, options: any): any {
  sdp = doMaxBitrate(sdp, options);
  return sdp;
}

function onOffer(sdp: RTCSessionDescriptionInit): void {
  console.log('About to set remote description. Signaling state: ' + pc.signalingState);
  sdp.sdp = setRtpSenderOptions(sdp.sdp, rtcConfig);
  // Firefox only has one codec in answer, which does not truly reflect its
  // decoding capability. So we set codec preference to remote offer, and let
  // Firefox choose its preferred codec.
  // Reference: https://bugzilla.mozilla.org/show_bug.cgi?id=814227.
  if (isFirefox()) {
    sdp.sdp = setCodecOrder(sdp.sdp);
  }
  const sessionDescription = new RTCSessionDescription(sdp);
  pc.setRemoteDescription(sessionDescription).then(
    (): void => {
      createAndSendAnswer();
    },
    (error): void => {
      console.log('Set remote description failed. Message: ' + error.message);
      // stop(error, true);
    }
  );
}

function onAnswer(sdp: any): void {
  console.log('About to set remote description. Signaling state: ' + pc.signalingState);
  sdp.sdp = setRtpSenderOptions(sdp.sdp, rtcConfig);
  const sessionDescription = new RTCSessionDescription(sdp);
  pc.setRemoteDescription(new RTCSessionDescription(sessionDescription)).then(
    (): void => {
      console.log('Set remote description successfully.');
      drainPendingMessages();
    },
    (error): void => {
      console.log('Set remote description failed. Message: ' + error.message);
      // stop(error, true);
    }
  );
}

function onRemoteIceCandidate(candidateInfo: any): void {
  const candidate = new RTCIceCandidate({
    candidate: candidateInfo.candidate,
    sdpMid: candidateInfo.sdpMid,
    sdpMLineIndex: candidateInfo.sdpMLineIndex
  });
  if (pc.remoteDescription && pc.remoteDescription.sdp !== '') {
    console.log('Add remote ice candidates.');
    pc.addIceCandidate(candidate).catch((error): void => {
      console.log('Error processing ICE candidate: ' + error);
    });
  } else {
    console.log('Cache remote ice candidates.');
    remoteIceCandidates.push(candidate);
  }
}

function sdpHandler(sdp: any): void {
  switch (sdp.type) {
    case 'offer':
      onOffer(sdp);
      break;
    case 'answer':
      onAnswer(sdp);
      break;
    case 'candidates':
      onRemoteIceCandidate(sdp);
  }
}

async function doGetStats(mediaStreamTrack: MediaStreamTrack, reportsResult: RTCStatsReport[]): Promise<void> {
  const statsReport = await pc.getStats(mediaStreamTrack);
  reportsResult.push(statsReport);
}

async function getStats(mediaStream: MediaStream): Promise<RTCStatsReport | RTCStatsReport[]> {
  if (pc) {
    if (mediaStream === undefined) {
      return pc.getStats();
    } else {
      const tracksStatsReports: RTCStatsReport[] = [];
      await Promise.all([
        mediaStream.getTracks().forEach((track: MediaStreamTrack): void => {
          doGetStats(track, tracksStatsReports);
        })
      ]);
      return new Promise((resolve, reject): void => {
        resolve(tracksStatsReports);
        reject();
      });
    }
  } else {
    return Promise.reject('Invalid peer state.');
  }
}

function trackSourcesHandler(data: any): void {
  for (const info of data) {
    remoteTrackSourceInfo.set(info.id, info.source);
  }
}

function streamInfoHandler(data: any): void {
  if (!data) {
    console.log('Unexpected stream info.');
    return;
  }
  remoteStreamInfo.set(data.id, {
    source: data.source,
    attributes: data.attributes,
    stream: null,
    mediaStream: null,
    trackIds: data.tracks
  });
}

function tracksAddedHandler(ids: string): void {
  // Currently, |ids| contains all track IDs of a MediaStream. Following algorithm also handles |ids| is a part of a MediaStream's tracks.
  for (const id of ids) {
    // It could be a problem if there is a track published with different MediaStreams.
    publishingStreamTracks.forEach((mediaTrackIds, mediaStreamId): Promise<void> | undefined => {
      for (let i = 0; i < mediaTrackIds.length; i++) {
        if (mediaTrackIds[i] === id) {
          // Move this track from publishing tracks to published tracks.
          if (!publishedStreamTracks.has(mediaStreamId)) {
            publishedStreamTracks.set(mediaStreamId, []);
          }
          publishedStreamTracks.get(mediaStreamId).push(mediaTrackIds[i]);
          mediaTrackIds.splice(i, 1);
        }
        // Resolving certain publish promise when remote endpoint received all tracks of a MediaStream.
        if (mediaTrackIds.length === 0) {
          if (!publishPromises.has(mediaStreamId)) {
            console.log('Cannot find the promise for publishing ' + mediaStreamId);
            continue;
          }
          const targetStreamIndex = publishingStreams.findIndex((element): boolean => element.mediaStream.id === mediaStreamId);
          const targetStream = publishingStreams[targetStreamIndex];
          if (!targetStream || !targetStream.mediaStream) {
            return Promise.reject('Publication is not available.');
          }
          const state = getStats(targetStream.mediaStream);
          publishingStreams.splice(targetStreamIndex, 1);
          const publication = { id: id ? id : createUuid(), getStats: state, stop: unpublish(targetStream) };
          publishedStreams.set(targetStream, publication);
          publishPromises.get(mediaStreamId).resolve(publication);
          publishPromises.delete(mediaStreamId);
        }
      }
    });
  }
}

function tracksRemovedHandler(ids: string): void {
  // Currently, |ids| contains all track IDs of a MediaStream. Following algorithm also handles |ids| is a part of a MediaStream's tracks.
  for (const id of ids) {
    // It could be a problem if there is a track published with different MediaStreams.
    publishedStreamTracks.forEach((mediaTrackIds, mediaStreamId): void => {
      for (let i = 0; i < mediaTrackIds.length; i++) {
        if (mediaTrackIds[i] === id) {
          mediaTrackIds.splice(i, 1);
        }
      }
    });
  }
}

export function messageHandler(message: { data: string; type: string }): void {
  const messageObj = JSON.parse(message.data);
  switch (messageObj.type) {
    case SignalingType.Sdp:
      sdpHandler(messageObj.data);
      // For Debugger.
      console.log(sysMsg.socketMsg.ReceivedMsg + JSON.stringify(messageObj));
      break;
    case SignalingType.UA:
      // Should do anything else ?
      break;
    case SignalingType.TrackSources:
      trackSourcesHandler(messageObj.data);
      break;
    case SignalingType.StreamInfo:
      streamInfoHandler(messageObj.data);
      break;
    case SignalingType.TracksAdded:
      tracksAddedHandler(messageObj.data);
      break;
    case SignalingType.TracksRemoved:
      tracksRemovedHandler(messageObj.data);
      break;
    case SignalingType.Closed:
      // For Debugger.
      console.log(sysMsg.socketMsg.ReceivedMsg + JSON.stringify(messageObj));
      // Should do anything else ?
      break;
    case SignalingType.DataReceived:
      // For Debugger.
      // console.log(sysMsg.socketMsg.ReceivedMsg + JSON.stringify(messageObj));
      break;
    default:
      console.log(sysMsg.socketMsg.WrongMsg + messageObj.type);
  }
}

function setStreamToRemoteStreamInfo(mediaStream: MediaStream): void {
  const info = remoteStreamInfo.get(mediaStream.id);
  const attributes = info.attributes;
  const sourceInfo = { audio: remoteStreamInfo.get(mediaStream.id).source.audio, video: remoteStreamInfo.get(mediaStream.id).source.video };
  info.stream = {
    origin: remoteId,
    id: createUuid(),
    mediaStream,
    source: sourceInfo,
    attributes
  };
  info.mediaStream = mediaStream;
  const stream = info.stream;
  if (stream) {
    remoteStreams.push(stream);
  } else {
    console.log('Failed to create RemoteStream.');
  }
}

function streamRemoved(stream: any): void {
  if (!remoteStreamInfo.has(stream.mediaStream.id)) {
    console.log('Cannot find stream info.');
  }
  send(remoteId, { type: SignalingType.TracksRemoved, data: remoteStreamInfo.get(stream.mediaStream.id).trackIds });
}

function areAllTracksEnded(mediaStream: MediaStream): boolean {
  for (const track of mediaStream.getTracks()) {
    if (track.readyState === 'live') {
      return false;
    }
  }
  return true;
}

function onRemoteStreamRemoved(event: { stream: MediaStream }): void {
  console.log('Remote stream removed.');
  const i = remoteStreams.findIndex((s): boolean => {
    return s.mediaStream.id === event.stream.id;
  });
  if (i !== -1) {
    const stream = remoteStreams[i];
    streamRemoved(stream);
    remoteStreams.splice(i, 1);
  }
}

function getStreamByTrack(mediaStreamTrack: EventTarget | null): MediaStream[] {
  const streams = [];
  for (const [, /* id */ info] of remoteStreamInfo) {
    if (!info.stream || !info.stream.mediaStream) {
      continue;
    }
    for (const track of info.stream.mediaStream.getTracks()) {
      if (mediaStreamTrack === track) {
        streams.push(info.stream.mediaStream);
      }
    }
  }
  return streams;
}

export function checkIceConnectionStateAndFireEvent(): void {
  if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
    for (const [, /* id */ info] of remoteStreamInfo) {
      if (info.mediaStream) {
        for (const track of info.mediaStream.getTracks()) {
          track.addEventListener('ended', (event: Event): void => {
            const mediaStreams = getStreamByTrack(event.target);
            for (const mediaStream of mediaStreams) {
              if (areAllTracksEnded(mediaStream)) {
                onRemoteStreamRemoved({ stream: mediaStream });
              }
            }
          });
        }
        send(remoteId, { type: SignalingType.TracksAdded, data: info.trackIds });
        remoteStreamInfo.get(info.mediaStream.id).mediaStream = null;
      }
    }
  }
}

export function createPeerConnection(id: string, v: string, l: Function, e: Function): void {
  remoteId = id;
  pc = new RTCPeerConnection(rtcConfig);

  pc.ontrack = (event): void => {
    console.log('Remote track added.');
    for (const stream of event.streams) {
      if (!remoteStreamInfo.has(stream.id)) {
        console.log('Missing stream info.');
        return;
      }
      if (!remoteStreamInfo.get(stream.id).stream) {
        setStreamToRemoteStreamInfo(stream);
      }
    }
    if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
      checkIceConnectionStateAndFireEvent();
    } else {
      addedTrackIds.concat(event.track.id);
    }
    const video = document.getElementsByTagName('video')[0];
    if (video) {
      video.srcObject = event.streams[0];
      l(false);
    }
  };

  pc.onicecandidate = (event): void => {
    if (event.candidate) {
      send(remoteId, {
        type: SignalingType.Sdp,
        data: event.candidate
      }).catch((): void => {
        console.log('Failed to send candidate.');
      });
    } else {
      console.log('Empty candidate.');
    }
  };

  pc.onsignalingstatechange = (): void => {
    console.log('Signaling state changed: ' + pc.signalingState);
    if (pc.signalingState === 'have-remote-offer' || pc.signalingState === 'stable') {
      for (let i = 0; i < remoteIceCandidates.length; i++) {
        console.log('Add candidate');
        pc.addIceCandidate(remoteIceCandidates[i]).catch((error): void => {
          console.log('Error processing ICE candidate: ' + error);
        });
      }
      remoteIceCandidates.length = 0;
    }
    if (pc.signalingState === 'stable') {
      if (isNegotiationNeeded) {
        onNegotiationNeeded();
      } else {
        drainPendingStreams();
        drainPendingMessages();
      }
    }
  };

  pc.ondatachannel = (event): void => {
    console.log('On data channel.');
    // Save remote created data channel.
    if (!dataChannels.has(event.channel.label)) {
      dataChannels.set(event.channel.label, event.channel);
      console.log('Save remote created data channel.');
    }
    bindEventsToDataChannel(event.channel);
  };

  pc.oniceconnectionstatechange = (): void => {
    switch (pc.iceConnectionState) {
      case 'closed':
      case 'failed':
        send(remoteId, { type: SignalingType.Closed }).catch((err): void => {});
        break;
      case 'connected':
      case 'completed':
        send(remoteId, { type: SignalingType.TracksAdded, data: addedTrackIds });
        addedTrackIds = [];
        checkIceConnectionStateAndFireEvent();
    }
  };

  pc.onconnectionstatechange = (): void => {
    switch (pc.connectionState) {
      case 'connected':
      case 'connecting':
      case 'closed':
      case 'disconnected':
      case 'new':
        // Do Something.
        break;
      case 'failed':
        e('WebRTC State: ' + pc.connectionState);
    }
    console.log('WebRTC State: ' + pc.connectionState);
  };
}
