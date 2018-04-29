import React from 'react'

import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'

const App = ({
  children,
  api,
  site,
  social,
  isTestnet,
  defaultNetwork,
  version
}) => (
  <div className='App'>
    <div className='header'>
      <Navbar
        brand={site.brand}
        logo={site.logo}
        isTestnet={isTestnet}
        defaultNetwork={defaultNetwork}
        />
    </div>
    <div className='container {{page.title}}' id='main'>
      {children}
    </div>
    <div className='footer'>
      <Footer
        twitter={social.twitter}
        github={social.github}
        facebook={social.facebook}
        email={social.email}
        year={site.year}
        version={version}
        />
    </div>
  </div>
)

export default App
