import React, { ReactElement } from 'react';

import { TabDataModel } from '../models/shared-data';
import { CustomTab } from '../styles/panel-styles';

export function RenderTab(t: TabDataModel): ReactElement {
  return (
    <CustomTab>
      {t.icon}
      {t.text}
    </CustomTab>
  );
}
