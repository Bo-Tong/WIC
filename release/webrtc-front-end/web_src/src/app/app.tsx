import React, { useEffect, useState, ReactElement } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Switch } from 'react-router';

import { AndroidList } from './android/list/list';
import { AndroidPanel } from './android/panel/panel';
import { Enroll } from './core/components/enroll';
import { Header } from './core/components/header';
import { PassportContainer } from './core/components/passport/passport-container';
import { PrivateRoute } from './core/components/private-route';
import { UserState } from './core/redux/user/user-reducer';
import { sysMsg } from './core/shared/models/msg';
import { RootStates } from './core/shared/services/store';
import { ErrorPage } from './shared/components/error';

export function App(): ReactElement {
  const user = useSelector((state: RootStates): UserState => state.user);
  const [showContent, setShowContent] = useState(false);
  const dispatch = useDispatch();

  useEffect((): void | (() => void | undefined) => {
    if (!document.cookie.includes('username' && 'storeTime')) {
      dispatch({ type: 'USER_LOGOUT' });
    }
    setShowContent(true);
  }, [dispatch]);

  return (
    <>
      {showContent ? (
        <>
          {user.profile ? <Header username={user.profile.username} /> : null}
          <Switch>
            <Route exact={true} path="/" component={PassportContainer} />
            <Route exact={true} path="/enroll" component={Enroll} />
            <PrivateRoute exact={true} path="/android" component={AndroidList} />
            <PrivateRoute exact={true} path="/android/:version" component={AndroidPanel} />
            <Route path="*" children={<ErrorPage err={sysMsg.baseMsg.NoMatch} />} />
          </Switch>
        </>
      ) : null}
    </>
  );
}
