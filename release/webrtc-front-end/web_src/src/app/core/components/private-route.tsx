import { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { Redirect, Route, RouteProps } from 'react-router';

import { UserState } from '../redux/user/user-reducer';
import { RootStates } from '../shared/services/store';

const renderRedirect = (): ReactElement => {
  return <Redirect to="/" />;
};

interface PrivateRouteProps extends RouteProps {
  component: any;
}

export function PrivateRoute(props: PrivateRouteProps): ReactElement {
  // tslint:disable-next-line: variable-name
  const { component: Component, ...rest } = props;
  const user = useSelector((state: RootStates): UserState => state.user);

  return <Route {...rest} render={(routeProps): ReactElement => (!!user.profile ? <Component {...routeProps} /> : renderRedirect())} />;
}
