
import React from 'react'

const Navbar = ({isTestnet, defaultNetwork}) => (
  <div id="navbar" class="navbar navbar-light">
    <div class="container">

      <a class="navbar-brand" name="{{site.brand}}" href="/">
        <img src="{{site.logo}}" alt=""> {{site.brand}}
      </a>


      <ul class="nav navbar-nav ml-auto">
        <li class="nav-item">
          {
            isTestnet ?
              <a  href="#"
                data-toggle="tooltip"
                data-placement="top"
                title="This site and API use tesnet coins."
                >
                  <span class="badge badge-pill badge-warning">
                    { defaultNetwork }
                  </span>
              </a>
              :
              null
          }
        </li>
      </ul>
    </div>
  </div>
)

export default Navbar
