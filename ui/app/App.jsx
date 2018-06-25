import React from 'react'

import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'

import '@poexio/light-bootstrap-dashboard/dist/assets/css/bootstrap.min.css'
import '@poexio/light-bootstrap-dashboard/dist/assets/css/light-bootstrap-dashboard.css'

import '../scss/main.css'
import '../public/theme/style.css'

const App = ({
  children,
  brand,
  logo,
  slogan,
  tagline,
  social,
  email,
  year,
  isTestnet,
  defaultChain,
  defaultNetwork,
  docproofPrice,
  version
}) => (
  <div className='App'>
    <div className='header'>
      <Navbar
        brand={brand}
        logo={logo}
        isTestnet={isTestnet}
        defaultChain={defaultChain}
        defaultNetwork={defaultNetwork}
        />
    </div>
    <div className='container' id='main'>
      {children}
    </div>
    <div className='footer'>
      <Footer
        twitter={social.twitter}
        github={social.github}
        facebook={social.facebook}
        telegram={social.telegram}
        email={email}
        year={year}
        version={version}
        />
    </div>
  </div>
)

export default App
