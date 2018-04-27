import React, { Component } from 'react';

import Navbar from './components/Navbar.jsx';
import Jumbo from './components/Jumbo.jsx';
import Footer from './components/Footer.jsx';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      config : {
        site : {},
        social : {},
        isTestnet: true,
        defaultNetwork: "testnet",
        version: null
      }
    }
  }

  componentDidMount() {
    this.props.api.getConfig( config => {
      this.setState({ config })
    })
  }

  render() {
    const {config} = this.state

    const {
      site,
      social,
      isTestnet,
      defaultNetwork,
      version
    } = config

    return (
      <div className="App">
        <Navbar
          brand={site.brand}
          logo={site.logo}
          isTestnet={isTestnet}
          defaultNetwork={defaultNetwork}
          />
        <Jumbo
          logo={site.logo}
          brand={site.brand}
          slogan={site.slogan}
          tagline={site.tagline}
          />
        <Footer
          twitter={social.twitter}
          github={social.github}
          facebook={social.facebook}
          email={social.email}
          year={site.year}
          version={version}
          />
      </div>
    );
  }
}

export default App;
