import React, { Component } from 'react';

import Navbar from './components/Navbar.jsx';
import Jumbo from './components/Jumbo.jsx';
import UploadFile from './components/UploadFile.jsx';
import Search from './components/Search.jsx';
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
      },
      showSearch: false
    }
  }

  componentDidMount() {
    this.props.api.getConfig( config => {
      this.setState({ config })
    })
  }

  handleToggleSearch(e) {
    e.preventDefault()
    this.setState({ showSearch : !this.state.showSearch })
  }


  render() {
    const {
      config,
      showSearch
    } = this.state

    const {
      site,
      social,
      isTestnet,
      defaultNetwork,
      version
    } = config

    return (
      <div className="App container">
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
        <UploadFile
          handleToggleSearch={ (e) =>this.handleToggleSearch(e)}
          />
        {
          showSearch ?
            <Search />
            :
            null
        }
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
