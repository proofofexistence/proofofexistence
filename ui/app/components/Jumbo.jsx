import React from 'react'

const Jumbo = ({
  logo,
  brand,
  slogan,
  tagline
}) => (
  <div class='row'>
    <div class='col-lg-12'>
      <div id='branding' class=''>
        <img src={logo} alt='Main Logo' />
        <h1>
          {brand}
          <br />
          <small>{slogan}</small>
        </h1>

        {
          // <h4>{tagline}</h4>
        }

        <div id='actions'>
          <a class='btn'
            target='_blank'
            href='http://github.com/proofofexistence/proofofexistence'
            style={{ marginRight: '.5em' }}
            >
              Fork on Github
          </a>
          <a class='btn btn-primary'
            target='_blank'
            href='http://docs.proofofexistence.com'
            style={{ marginLeft: '.5em' }}
            >
              Read the docs
          </a>
        </div>
      </div>
    </div>
  </div>
)

export default Jumbo
