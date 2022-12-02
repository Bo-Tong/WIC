import { CloudUploadOutlined } from '@ant-design/icons';
import { message, Switch, Upload } from 'antd';
import { RcFile } from 'antd/lib/upload';
import React, { useState, ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';

import { UserState } from '../../../core/redux/user/user-reducer';
import { sysMsg } from '../../../core/shared/models/msg';
import { RootStates } from '../../../core/shared/services/store';
import { fileNameReg } from '../../../core/shared/utils/validates';
import { percentSub, uploadProps } from '../models/upload';
import { APP_INSTALL, APP_UPLOAD } from '../services/android-apis';
import { uploadSubStyles, uploadSwitchStyles } from '../styles/panel-styles';

import { CustomProgress } from './progress';

const { Dragger } = Upload;

export function CustomUpload(): ReactElement {
  const user = useSelector((state: RootStates): UserState => state.user);
  const [isInstall, setIsInstall] = useState(false);
  const [isDisable, setIsDisable] = useState(false);
  const { version } = useParams<{ version: string }>();
  const n = `${APP_UPLOAD}?id=${user.profile!.id}&version=${version}`;
  const y = `${APP_INSTALL}?id=${user.profile!.id}&version=${version}`;

  const beforeUpload = (file: RcFile): boolean => {
    const isAPK = file.type === 'application/vnd.android.package-archive';
    const nameCheck = new RegExp(fileNameReg).test(file.name);

    if (isInstall) {
      if (!isAPK) {
        message.error(sysMsg.panelMsg.FileTypeApk);
      }
    }
    if (!nameCheck) {
      message.error(sysMsg.panelMsg.FileNameErr);
    }
    return (isInstall ? isAPK : true) && nameCheck;
  };

  // tslint:disable-next-line: deprecation
  percentSub.subscribe({
    next: (v): void => {
      v ? setIsDisable(true) : setIsDisable(false);
    },
    error: (e): void => console.log(e),
    complete: (): void => {}
  });

  return (
    <>
      <Switch
        style={uploadSwitchStyles}
        checkedChildren="Install"
        unCheckedChildren="Upload"
        defaultChecked={false}
        onChange={setIsInstall}
        disabled={isDisable}
      />
      <Dragger {...uploadProps} action={isInstall ? y : n} beforeUpload={beforeUpload}>
        <p className="ant-upload-drag-icon">
          <CloudUploadOutlined />
        </p>
        <p className="ant-upload-text">{sysMsg.panelMsg.UploadIntro}</p>
        {!isInstall ? <span style={uploadSubStyles}>{sysMsg.panelMsg.UploadSubIntro}</span> : null}
      </Dragger>
      <CustomProgress isInstall={isInstall} />
    </>
  );
}
