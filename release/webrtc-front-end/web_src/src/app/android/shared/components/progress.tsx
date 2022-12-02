import { Progress } from 'antd';
import { useState, ReactElement } from 'react';

import { progressProps } from '../models/shared-data';
import { percentSub } from '../models/upload';
import { progressStyles } from '../styles/panel-styles';

export function CustomProgress(props: { isInstall: boolean }): ReactElement | null {
  const [percent, setPercent] = useState<number | undefined>();

  // tslint:disable-next-line: deprecation
  percentSub.subscribe({ next: setPercent, error: (e): void => console.log(e), complete: (): void => {} });

  return percent ? (
    <>
      <Progress {...progressProps} percent={percent} />
      <span style={progressStyles}>
        ({props.isInstall ? 'Installing' : 'Uploading'}... {percent?.toFixed(0)} %)
      </span>
    </>
  ) : null;
}
