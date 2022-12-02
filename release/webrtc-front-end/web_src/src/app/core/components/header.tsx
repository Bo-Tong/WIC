import React, { ReactElement } from 'react';
import { useDispatch } from 'react-redux';

import { HeaderProps } from '../shared/models/shared-data';
import { HeaderRight, HeaderWrap } from '../shared/styles/header.styles';

export function Header(props: HeaderProps): ReactElement {
  const dispatch = useDispatch();

  const logout = (): void => {
    dispatch({ type: 'USER_LOGOUT' });
    document.cookie = '';
  };

  // TODO: Update in future if need.
  return (
    <HeaderWrap>
      Android Cloud
      <HeaderRight>
        <span>
          Current user: <b>{props.username}</b>
        </span>
        <span onClick={logout}>Sign out</span>
      </HeaderRight>
    </HeaderWrap>
  );
}
