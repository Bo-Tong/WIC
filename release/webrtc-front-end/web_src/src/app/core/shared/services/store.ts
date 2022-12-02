import { applyMiddleware, combineReducers, createStore, Reducer } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/es/storage';
import { from, Observable } from 'rxjs';

import { userReducer, UserState } from '../../redux/user/user-reducer';

const rootReducers: { [P in keyof RootStates]: Reducer<RootStates[P], any> } = {
  user: userReducer
};

export interface RootStates {
  user: UserState;
}

const reducer = persistReducer(
  {
    key: 'root',
    storage
  },
  combineReducers(rootReducers)
);

export const store = createStore(reducer, applyMiddleware());
export const observableStore = from(store as any) as Observable<RootStates>;
