import { Tabs } from 'antd';
import React, { useState, ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';

import { UserState } from '../../core/redux/user/user-reducer';
import { RootStates } from '../../core/shared/services/store';
import { RenderTab } from '../shared/components/custom-tab';
import { defaultTabData, TabDataModel } from '../shared/models/shared-data';
import { useInitADB } from '../shared/services/init';
import { controlSectionStyles, controlTabPanelStyles, CustomControlSection } from '../shared/styles/panel-styles';

const { TabPane } = Tabs;

export function ControlSection(props: { pending: boolean }): ReactElement {
  const { version } = useParams<{ version: string }>();
  const user = useSelector((state: RootStates): UserState => state.user);
  const [tData, setTData] = useState<TabDataModel[]>(defaultTabData);
  useInitADB(user.profile!.id, version, setTData, props.pending);

  return (
    <CustomControlSection>
      <Tabs style={controlSectionStyles} animated={false}>
        {tData.map(
          (item): ReactElement => (
            <TabPane
              tab={RenderTab(item)}
              key={item.key}
              style={item.key.includes('shell') ? controlTabPanelStyles : { ...controlTabPanelStyles, overflow: 'auto' }}
            >
              {item.render}
            </TabPane>
          )
        )}
      </Tabs>
    </CustomControlSection>
  );
}
