import React from 'react'

const Footer = ({
  social,
  twitter,
  github,
  facebook,
  telegram,
  email,
  year,
  version
}) => (
  <footer className='footer'>
    <div className='container'>
      <nav className='pull-left'>
        <ul>
          { twitter
            ? <li className='social'>
              <a className='twitter'
                href={`https://twitter.com/${twitter}`}
                title='Twitter'
                >
                Twitter
              </a>
            </li>
            : null
          }
          { github
            ? <li className='social'>
              <a className='github'
                href={`https://github.com/${github}`}
                title='Github'
                >
                GitHub
              </a>
            </li>
            : null
          }
          { telegram
            ? <li className='social'>
              <a className='telegram'
                href={`https://t.me/joinchat/${telegram}`}
                title='Telegram'
                >
                Telegram
              </a>
            </li>
            : null
          }
          { facebook
            ? <li className='social'>
              <a className='facebook'
                href={`https://facebook.com/${facebook}`}
                title='Facebook'
                >
                Facebook
              </a>
            </li>
            : null
          }
          { email
            ? <li>
              <a href={`mailto:${email}`}>For questions, email { email }</a>
            </li>

            : null
          }
          <li>
            <a href='https://en.wikipedia.org/wiki/Proof_of_Existence'>
              History
            </a>
          </li>
          <li>
            <a href='https://docs.proofofexistence.com'>
              Read the docs
            </a>
          </li>
          {
            version
              ? <li>
                <a href={`https://github.com/proofofexistence/proofofexistence/releases/tag/${version}`}>
                  v{version}
                </a>
              </li>
            : null
          }
        </ul>
      </nav>
      <div className='copyright pull-right'> Written forever by <a href='http://proofofexistence.com'>Proof of Existence</a>
        {
          year
            ? `- &copy; ${year}`
          : null
        }
      </div>
    </div>
  </footer>
)
export default Footer
