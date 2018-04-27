
import React from 'react'

const Navbar = ({
  isTestnet,
  defaultNetwork,
  brand,
  logo
}) => (
  <div id="navbar" class="navbar navbar-light">
    <div class="container">

      <a class="navbar-brand" name={brand} href="/">
        <img src={logo} alt="" /> {brand}
      </a>

      <ul class="nav navbar-nav ml-auto">
        <li class="nav-item">
          {
            isTestnet ?
              <a href="#"
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
