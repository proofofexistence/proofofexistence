import React from 'react'

const Jumbo = ({site}) => (
  <div class="row">
    <div class="col-lg-12">
      <div id="branding" class="">
          <img src="{site.logo}" alt="Main Logo" />
          <h1>
            {site.brand}
            <br />
            <small>{site.slogan}</small>
          </h1>

          <h4>{site.tagline}</h4>

          <div id="actions">
            <a class="btn" target="_blank" href="http://github.com/proofofexistence/proofofexistence">
              Fork on Github
            </a>
            <a class="btn btn-primary" target="_blank" href="http://proofofexistence.github.io">
              Read the docs
            </a>
          </div>
      </div>
    </div>
  </div>
)

export default Jumbo
