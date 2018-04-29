import React from 'react'

const Navbar = ({
  isTestnet,
  defaultNetwork,
  brand,
  logo
}) => (
  <div id='navbar' className='navbar navbar-light'>
    <div className='container'>

      <a className='navbar-brand' name={brand} href='/'>
        <img src={logo} alt='' /> {brand}
      </a>

      <ul className='nav navbar-nav ml-auto'>
        <li className='nav-item'>
          {
            isTestnet
              ? <a href='#'
                title='This site and API use tesnet coins.'
                >
                <span className='badge badge-pill badge-warning'>
                  { defaultNetwork }
                </span>
              </a>
              : null
          }
        </li>
      </ul>
    </div>
  </div>
)

export default Navbar
