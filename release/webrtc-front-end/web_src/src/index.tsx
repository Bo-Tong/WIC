import './polyfills'; // Polyfills must be on top of imports.
import { ConfigProvider } from 'antd'; // tslint:disable-line:ordered-imports
import enUS from 'antd/es/locale/en_US';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';

import { App } from './app/app';
import { store } from './app/core/shared/services/store';
import './index.scss';

const persistor = persistStore(store);

ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <HashRouter>
        <ConfigProvider locale={enUS}>
          <App />
        </ConfigProvider>
      </HashRouter>
    </PersistGate>
  </Provider>,
  document.getElementById('root')
);
