import React from 'react'

const Navbar = ({
  isTestnet,
  defaultChain,
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
          <span className='badge badge-pill badge-info badge-chain'>
            { defaultChain }
          </span>
          {
            isTestnet
              ? <span
                title='This site and API use testnet coins.'
                className='badge badge-pill badge-warning badge-network'>
                { defaultNetwork }
              </span>
              : null
          }
        </li>
      </ul>
    </div>
  </div>
)

export default Navbar
