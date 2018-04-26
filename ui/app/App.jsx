import React, { Component } from 'react';

import Navbar from './components/Navbar.jsx';
import Jumbo from './components/Jumbo.jsx';
import Footer from './components/Footer.jsx';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      config : {}
    }
  }

  componentDidMount() {
    this.props.api.getConfig( config => {
      this.setState({ config })
    })
  }
  render() {
    const {config} = this.state
    console.log(config);
    const {site, social} = config
    return (
      <div className="App">
        <Navbar site={site ? site : {}} social={social}/>
        <Jumbo site={site ? site : {}} social={social}/>
        <Footer />
      </div>
    );
  }
}

export default App;
