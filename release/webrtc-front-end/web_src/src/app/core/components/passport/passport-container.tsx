import React, { useEffect, useState, ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router';

import { UserState } from '../../redux/user/user-reducer';
import { RootStates } from '../../shared/services/store';

import { Passport } from './passport';

export function PassportContainer(): ReactElement {
  const [content, setContent] = useState(<></>);
  const history = useHistory();
  const user = useSelector((state: RootStates): UserState => state.user);

  useEffect((): void | (() => void | undefined) => {
    if (user.profile) {
      history.push('/android');
    } else {
      setContent(<Passport {...user} />);
    }
  }, [history, user]);

  return content;
}
