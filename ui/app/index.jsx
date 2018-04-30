import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import App from './App.jsx'
import Home from './pages/Home.jsx'
import Detail from './pages/Detail.jsx'
import Error404 from './pages/Error404.jsx'

import registerServiceWorker from './registerServiceWorker'

import APIClient from '../../client'

const api = new APIClient()

// get config as starter
api.getConfig(config => {
  // config and global props to pass down to children
  const generalProps = { api, ...config }

  ReactDOM.render(
    <Router>
      <App {...generalProps}>
        <Switch>
          <Route exact path='/' component={props =>
            <Home {...generalProps} {...props} />
            } />
          <Route path='/detail/:hash' component={props =>
            <Detail {...generalProps} {...props} />
            } />
          <Route component={Error404} />
        </Switch>
      </App>
    </Router>
    ,
    document.getElementById('root')
  )
})

registerServiceWorker()
