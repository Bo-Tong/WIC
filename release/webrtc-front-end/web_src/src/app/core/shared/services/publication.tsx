import { sysMsg } from '../models/msg';
import { AudioConstraints, LocalStream, StreamConstraints, VideoConstraints } from '../models/publication';
import { SignalingType } from '../models/rtc-socket-config';
import { isEdge } from '../utils/browser';
import { createUuid } from '../utils/create-uid';

import { pc } from './peer-connection';
import { send } from './socket.io';

let localAudioStream: LocalStream;
let localVideoStream: LocalStream;
let localStream: LocalStream;

const isVideoConstrainsForScreenCast = (constraints: StreamConstraints): boolean => {
  return typeof constraints.video === 'object' && constraints.video.source === 'screen-cast';
};

const createMediaStream = (constraints: StreamConstraints): Promise<MediaStream> => {
  if (typeof constraints !== 'object' || (!constraints.audio && !constraints.video)) {
    return Promise.reject(new TypeError(sysMsg.dcMsg.Invalid));
  }
  if (!isVideoConstrainsForScreenCast(constraints) && typeof constraints.audio === 'object' && constraints.audio.source === 'screen-cast') {
    return Promise.reject(new TypeError(sysMsg.dcMsg.NoVideo));
  }
  if (isVideoConstrainsForScreenCast(constraints) && typeof constraints.audio === 'object' && constraints.audio.source !== 'screen-cast') {
    return Promise.reject(new TypeError(sysMsg.dcMsg.WrongSrc));
  }
  if (!constraints.audio && !constraints.video) {
    return Promise.reject(new TypeError(sysMsg.dcMsg.NoStream));
  }

  const mediaConstraints = Object.create({});
  if (typeof constraints.audio === 'object' && constraints.audio.source === 'mic') {
    mediaConstraints.audio = Object.create({
      /*Add something*/
    });
    if (isEdge()) {
      mediaConstraints.audio.deviceId = constraints.audio.deviceId;
    } else {
      mediaConstraints.audio.deviceId = {
        exact: constraints.audio.deviceId
      };
    }
  } else {
    if (typeof constraints.audio === 'object' && constraints.audio.source === 'screen-cast') {
      mediaConstraints.audio = true;
    } else {
      mediaConstraints.audio = constraints.audio;
    }
  }
  if (typeof constraints.video === 'object') {
    mediaConstraints.video = Object.create({
      /*Add something*/
    });
    if (typeof constraints.video.frameRate === 'number') {
      mediaConstraints.video.frameRate = constraints.video.frameRate;
    }
    if (constraints.video.resolution && constraints.video.resolution.width && constraints.video.resolution.height) {
      if (constraints.video.source === 'screen-cast') {
        mediaConstraints.video.width = constraints.video.resolution.width;
        mediaConstraints.video.height = constraints.video.resolution.height;
      } else {
        mediaConstraints.video.width = Object.create({
          /*Add something*/
        });
        mediaConstraints.video.width.exact = constraints.video.resolution.width;
        mediaConstraints.video.height = Object.create({
          /*Add something*/
        });
        mediaConstraints.video.height.exact = constraints.video.resolution.height;
      }
    }
    if (typeof constraints.video.deviceId === 'string') {
      mediaConstraints.video.deviceId = { exact: constraints.video.deviceId };
    }
  } else {
    mediaConstraints.video = constraints.video;
  }

  if (isVideoConstrainsForScreenCast(constraints)) {
    // Here is a bug of typescript, Prop getDisplayMedia is missing.
    // @ts-ignore
    return navigator.mediaDevices.getDisplayMedia(mediaConstraints);
  } else {
    return navigator.mediaDevices.getUserMedia(mediaConstraints);
  }
};

const sendStreamInfo = (stream: any, id: string): Promise<[void, void]> => {
  if (!stream || !stream.mediaStream) {
    return Promise.reject(sysMsg.dcMsg.Illegal);
  }
  const info: { id: string; source: { audio?: string; video?: string; id: string; attributes: undefined } }[] = [];
  stream.mediaStream.getTracks().map((track: MediaStreamTrack): number => {
    return info.push({
      id: track.id,
      source: stream.source[track.kind]
    });
  });
  return Promise.all([
    send(id, { type: SignalingType.TrackSources, data: info }).catch((err): void => {}),
    send(id, {
      type: SignalingType.StreamInfo,
      data: {
        id: stream.mediaStream.id,
        attributes: stream.source!.attributes,
        tracks: Array.from(info, (item): string => item.id),
        source: stream.source
      }
    }).catch((err): void => {})
  ]);
};

export const publishLocalStream = (id: string, audioSource?: string, videoSource?: string): void => {
  let audioConstraintsForMic: AudioConstraints;
  let videoConstraintsForCamera: VideoConstraints;
  let mediaStream: MediaStream;

  if (audioSource === 'mic') {
    audioConstraintsForMic = { source: audioSource, deviceId: undefined };
  }
  if (videoSource === 'camera') {
    videoConstraintsForCamera = { source: videoSource, deviceId: undefined, resolution: { width: 640, height: 480 }, frameRate: 30 };
  }

  console.log(`${publishLocalStream.name}: audioSource: ${audioSource}, videoSource: ${videoSource}`);

  const constraints = (): StreamConstraints => {
    return {
      audio: audioConstraintsForMic,
      video: videoConstraintsForCamera
    } as StreamConstraints;
  };

  createMediaStream(constraints()).then(
    (stream): void => {
      mediaStream = stream;
      if (audioSource === undefined) {
        localVideoStream = { mediaStream, source: { audio: audioSource, video: videoSource, id: createUuid(), attributes: undefined } };
        localStream = localVideoStream;
      } else if (videoSource === undefined) {
        localAudioStream = { mediaStream, source: { audio: audioSource, video: videoSource, id: createUuid(), attributes: undefined } };
        localStream = localAudioStream;
      }

      console.log(`${publishLocalStream.name}: Local media stream created. Id: ${localStream.mediaStream!.id}`);

      sendStreamInfo(localStream, id).then(
        (): Promise<void> => {
          return new Promise(
            async (): Promise<void> => {
              // Replace |addStream| with PeerConnection.addTrack when all browsers are ready.
              for (const track of stream.getTracks()) {
                pc.addTrack(track, stream);
              }
              await pc.setLocalDescription(await pc.createOffer());
              send(id, { type: SignalingType.Sdp, data: pc.localDescription }).catch((err): void => {});
            }
          );
        }
      );
    },
    (err: Error): void => console.log(`${publishLocalStream.name}: Failed to create media stream, error: ${err}`)
  );
  console.log(`${publishLocalStream.name}: out`);
};

export const stopPublication = (): void => {
  if (localStream && localStream.mediaStream) {
    for (const track of localStream.mediaStream!.getTracks()) {
      console.log(sysMsg.dcMsg.StopPublicationId + track.id);
      console.log(sysMsg.dcMsg.StopPublicationKind + track.kind);
      console.log(sysMsg.dcMsg.StopPublicationLabel + track.label);
      track.stop();
    }
    localStream.mediaStream = undefined;
  }
};
