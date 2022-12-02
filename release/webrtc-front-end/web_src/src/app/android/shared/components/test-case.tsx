import { LeftOutlined } from '@ant-design/icons';
import { List } from 'antd';
import React, { useState, ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';

import { UserState } from '../../../core/redux/user/user-reducer';
import { RootStates } from '../../../core/shared/services/store';
import { TEST_LOG } from '../services/android-apis';
import { useTestImageListApi } from '../services/test-image-list';
import { useTestRequestApi } from '../services/test-request';
import { testCaseBackStyles, testCaseItemStyles } from '../styles/panel-styles';

import { Shell } from './shell';

export function TestCase(): ReactElement {
  const [content, setContent] = useState(<CaseList />);

  const caseClick = (caseV: string): void => {
    setContent(<CaseConsole caseV={caseV} />);
  };

  const goBack = (): void => {
    setContent(<CaseList />);
  };

  function CaseList(): ReactElement {
    const stateList = useTestImageListApi();

    return (
      <List
        size="small"
        bordered={true}
        dataSource={stateList.testList}
        renderItem={(item): ReactElement => (
          <List.Item onClick={(): void => caseClick(item.tag)}>
            <span style={testCaseItemStyles}>{item.tag}</span>
          </List.Item>
        )}
      />
    );
  }

  function CaseConsole(props: { caseV: string }): ReactElement {
    const { version } = useParams<{ version: string }>();
    const user = useSelector((state: RootStates): UserState => state.user);
    const nId = `${user.profile!.id}-${version}`;
    const trState = useTestRequestApi(nId, nId, props.caseV);

    return (
      <>
        <LeftOutlined title="Back" style={testCaseBackStyles} onClick={goBack} />
        <span>Status: running</span>
        {!trState.isLoading ? <Shell api={TEST_LOG} id={trState.data} tv={props.caseV} /> : null}
      </>
    );
  }

  return content;
}
