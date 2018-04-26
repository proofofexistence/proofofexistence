<footer class="footer">
  <div class="container">
    <nav class="pull-left">
      <ul>
        {{# if social.twitter }}
        <li class="social">
          <a class="twitter" href="https://twitter.com/{{ social.twitter }}">
            Twitter
          </a>
        </li>
        {{/if}}
        {{# if social.github }}
        <li class="social">
          <a class="github" href="https://github.com/{{ social.github }}">
            GitHub
          </a>
        </li>
        {{/if}}
        {{# if social.facebook }}
        <li class="social">
          <a class="facebook" href="https://facebook.com/{{ social.facebook }}">
            Facebook
          </a>
        </li>
        {{/if}}

        {{# if site.email }}

        <li>
          <a href="mailto:{{ site.email }}">For questions, email {{ site.email }}</a>
        </li>

        {{/if}}
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
    <div class="copyright pull-right"> Written forever by <a href="http://proofofexistence.com">Proof of Existence</a> - &copy; {{ year }}
    </div>
  </div>
</footer>
