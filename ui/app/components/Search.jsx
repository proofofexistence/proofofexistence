import React from 'react'

const Search = ({
  handleSearch
}) => (
  <div id='search'>
    <div>
      <div class='card no-border'>
        <div class='card-header'>
          <h3 class='card-title'>
            Search an existing reference
          </h3>
          <p class='card-category'>
            Input the <em>hash</em> representing your document to be directed to the proof of its previous existence.
          </p>
        </div>
        <div class='card-body'>
          <form class='' onSubmit={handleSearch}>
            <input class='form-control mr-sm-2'
              placeholder='Input a hash'
              aria-label='Search'
              type='search'
              name='hash'
              />
          </form>
        </div>
      </div>
    </div>
  </div>
)
export default Search
