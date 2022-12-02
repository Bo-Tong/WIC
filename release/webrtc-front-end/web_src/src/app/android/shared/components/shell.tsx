import React, { useEffect, ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { Terminal } from 'xterm';
import { AttachAddon } from 'xterm-addon-attach';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

import { UserState } from '../../../core/redux/user/user-reducer';
import { sysMsg } from '../../../core/shared/models/msg';
import { RootStates } from '../../../core/shared/services/store';
import { terminalOptions } from '../models/shell';
import { ShellContainer } from '../styles/panel-styles';

export let socket: WebSocket;

export function Shell(props: { api: string; id?: string; tv?: string }): ReactElement {
  const { version } = useParams<{ version: string }>();
  const user = useSelector((state: RootStates): UserState => state.user);
  const isTestCase = props.api.includes('testlog') ? true : false;
  const socketUrl = `${props.api}?id=${!isTestCase ? user.profile!.id : props.id}&version=${props.tv ? props.tv : version}`;

  useEffect((): void | (() => void | undefined) => {
    socket = new WebSocket(socketUrl);
    const term = new Terminal(terminalOptions);
    const termDom = document.getElementById(`shell_${props.api.split('/')[3]}`);
    const fitAddon = new FitAddon();
    const attachAddon = new AttachAddon(socket);
    const initialHeight = document.getElementsByClassName('ant-tabs-tabpane-active')[0].clientHeight;
    let checkTimer: NodeJS.Timeout;
    let storeHeight = initialHeight;

    if (termDom) {
      term.loadAddon(attachAddon);
      term.loadAddon(fitAddon);
      term.open(termDom);
      fitAddon.fit();
      term.resize(term.cols, Math.ceil(initialHeight / 19));
    }

    // window.onresize = (): void => {
    //   if (termDom) {
    //     fitAddon.fit();
    //   }
    // };

    checkTimer = setInterval((): void => {
      const newHeight = document.getElementsByClassName('ant-tabs-tabpane-active')[0].clientHeight;
      if (storeHeight !== newHeight) {
        storeHeight = newHeight;
        term.resize(term.cols, Math.ceil(storeHeight / 19));
      }
    }, 10);

    socket.onclose = (): void => {
      if (props.api.includes('shell')) {
        term.writeln(sysMsg.panelMsg.TerminalClose);
      }
    };

    return (): void => {
      clearTimeout(checkTimer);
    };
  }, [props.api, socketUrl, user.profile, version]);

  return <ShellContainer id={`shell_${props.api.split('/')[3]}`} />;
}
