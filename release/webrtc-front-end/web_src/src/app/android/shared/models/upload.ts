import { message } from 'antd';
import { UploadChangeParam, UploadProps } from 'antd/lib/upload';
import { Subject } from 'rxjs';

import { sysMsg } from '../../../core/shared/models/msg';

export const percentSub = new Subject<number>();

export const uploadProps: UploadProps = {
  showUploadList: false,
  onChange(info: UploadChangeParam): void {
    const { status } = info.file;
    percentSub.next(info.event?.percent);

    switch (status) {
      case 'uploading':
        break;
      case 'done':
        message.success(`${info.file.name} ${sysMsg.panelMsg.UploadSuccess}`);
        break;
      case 'error':
        message.error(`${info.file.name} ${sysMsg.panelMsg.UploadFail}`);
        break;
      default:
    }
  }
};
