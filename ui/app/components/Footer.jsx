import React from 'react'

const Footer = ({
  social,
  twitter,
  github,
  facebook,
  email,
  year
}) => (
  <footer class="footer">
    <div class="container">
      <nav class="pull-left">
        <ul>
          { twitter ?
            <li class="social">
              <a class="twitter" href={`https://twitter.com/${ twitter }`}>
                Twitter
              </a>
            </li>
            :
            null
          }
          { github ?
            <li class="social">
              <a class="github" href={`https://github.com/${ github }`}>
                GitHub
              </a>
            </li>
            :
            null
          }
          { facebook ?
            <li class="social">
              <a class="facebook" href={`https://facebook.com/${ facebook }`}>
                Facebook
              </a>
            </li>
            :
            null
          }
          { email ?
            <li>
              <a href={`mailto:${email}`}>For questions, email { email }</a>
            </li>

            :
            null
          }
          <li>
            <a href="https://en.wikipedia.org/wiki/Proof_of_Existence">
              History
            </a>
          </li>
          <li>
            <a href="https://proofofexistence.github.io">
              Read the docs
            </a>
          </li>
        </ul>
      </nav>
      <div class="copyright pull-right"> Written forever by <a href="http://proofofexistence.com">Proof of Existence</a>
        {
          year ?
            `- &copy; ${ year }`
          :
            null
        }
      </div>
    </div>
  </footer>
)
export default Footer
