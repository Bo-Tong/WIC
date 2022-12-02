import { ControlOutlined, ExpandOutlined, MobileFilled, PoweroffOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { Resizable } from 're-resizable';
import { useEffect, useState, ReactElement } from 'react';
import { useHistory } from 'react-router';

import {
  bg,
  containerStyle,
  resizeStream,
  ButtonGroupContainer,
  LoadingMsg,
  SectionHeader,
  SectionTitle,
  VideoContainer
} from '../shared/styles/panel-styles';

export function VideoSection(props: { version: string; isLoading: boolean }): ReactElement {
  const [height, setHeight] = useState(document.body.clientHeight - 50);
  const history = useHistory();

  const fullScreen = (): void => {
    const video = document.getElementsByTagName('video')[0];
    video.requestFullscreen();
  };

  const stopUsing = (): void => {
    history.push('/android');
  };

  const showPanel = (): void => {
    height === document.body.clientHeight - 50 ? setHeight(document.body.clientHeight * 0.58) : setHeight(document.body.clientHeight - 50);
  };

  useEffect((): void | (() => void | undefined) => {
    window.onresize = (): void => {
      setHeight(document.body.clientHeight - 50);
    };

    return (): void => {
      window.onresize = null;
    };
  }, []);

  return (
    <Resizable
      style={props.isLoading ? { ...containerStyle, ...bg } : containerStyle}
      size={{ width: 'auto', height }}
      enable={resizeStream}
      maxHeight={document.body.clientHeight - 50}
      onResizeStop={(e, direction, ref, d): void => {
        setHeight(height + d.height >= document.body.clientHeight * 0.98 - 50 ? document.body.clientHeight - 50 : height + d.height);
      }}
    >
      <SectionHeader>
        <SectionTitle>
          <MobileFilled />
          {props.version}
        </SectionTitle>
        <ButtonGroupContainer>
          <Button title="Show control panel" icon={<ControlOutlined />} size="small" onClick={showPanel} />
          <Button title="Fullscreen" icon={<ExpandOutlined />} size="small" onClick={fullScreen} />
          <Button title="Stop using" icon={<PoweroffOutlined />} size="small" onClick={stopUsing} />
        </ButtonGroupContainer>
      </SectionHeader>
      <LoadingMsg hidden={!props.isLoading}>Loading...</LoadingMsg>
      <VideoContainer hidden={props.isLoading}>
        <video playsInline={true} autoPlay={true} />
      </VideoContainer>
    </Resizable>
  );
}
