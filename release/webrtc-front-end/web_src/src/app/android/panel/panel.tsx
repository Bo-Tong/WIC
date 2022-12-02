import axios from 'axios';
import React, { useEffect, useState, ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { UserState } from '../../core/redux/user/user-reducer';
import { SignalingType } from '../../core/shared/models/rtc-socket-config';
import { createDataChannel, createPeerConnection, dataChannels, pc } from '../../core/shared/services/peer-connection';
import { connect, disconnect, send, wsServer } from '../../core/shared/services/socket.io';
import { RootStates } from '../../core/shared/services/store';
import { ErrorPage } from '../../shared/components/error';
import { socket } from '../shared/components/shell';
import { P2P_STATUS, SOCKET_CLOSE } from '../shared/services/android-apis';
import { useRequestUrlApi } from '../shared/services/request-url';
import { useStatusApi } from '../shared/services/status';
import { PanelContainer } from '../shared/styles/panel-styles';

import { ControlSection } from './control-section';
import { VideoSection } from './video-section';

export function AndroidPanel(): ReactElement {
  const { version } = useParams<{ version: string }>();
  const user = useSelector((state: RootStates): UserState => state.user);
  const [targetId] = useState(`android-${user.profile!.id}-${version}`);
  const [isLoading, setIsLoading] = useState(true);
  const [errMsg, setErrMsg] = useState('');

  useStatusApi(`${user.profile!.id}-${version}`, version);
  const rState = useRequestUrlApi(user.profile!.id, version);

  useEffect((): void | (() => void | undefined) => {
    let connectTimer: NodeJS.Timeout;

    const unmount = (): void => {
      const video = document.getElementsByTagName('video')[0];
      if (video && video.srcObject) {
        video.srcObject = null;
      }
      if (pc && pc.connectionState !== 'closed') {
        pc.close();
        disconnect(targetId);
        send(targetId, { type: SignalingType.Closed }).catch((err): void => {});
        console.log('Chat closed');
        axios(P2P_STATUS, { params: { id: `${user.profile!.id}-${version}`, version, status: 'idle' } });
      }
      if (wsServer) {
        wsServer.close();
      }
      if (socket) {
        axios(SOCKET_CLOSE, { params: { id: user.profile!.id, version } });
      }
      if (dataChannels.has('message')) {
        dataChannels.clear();
      }
    };

    window.addEventListener('beforeunload', unmount);

    if (!rState.isLoading) {
      connect(rState.data);
      connectTimer = setTimeout((): void => {
        createPeerConnection(targetId, version, setIsLoading, setErrMsg);
        createDataChannel('message');
      }, 5000);
    }

    return (): void => {
      window.removeEventListener('beforeunload', unmount);
      clearTimeout(connectTimer);
      unmount();
    };
  }, [rState.data, rState.isLoading, targetId, user.profile, version]);

  return (
    <>
      {errMsg ? <ErrorPage err={errMsg} /> : null}
      <PanelContainer hidden={!!errMsg}>
        <VideoSection version={version} isLoading={isLoading} />
        <ControlSection pending={!isLoading} />
      </PanelContainer>
    </>
  );
}
