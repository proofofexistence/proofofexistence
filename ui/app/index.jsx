import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.jsx';
import registerServiceWorker from './registerServiceWorker';

import APIClient from '../../client'

const api = new APIClient()

ReactDOM.render(
  <App api={api}/>,
  document.getElementById('root')
);
registerServiceWorker();
