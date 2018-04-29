import React from 'react'

const HashList = ({
  records,
  checked
}) => (
  <div class='card-body table-responsive table-full-width'>
    <table class='table table-striped' id='latest'>
      <thead>
        <tr>
          <th />
          <th>Document Digest</th>
          <th>Timestamp</th>
        </tr>
      </thead>
      <tbody>
        {
        records.map(row => (
          <tr key={row.digest}>
            <td>
              {
                checked
                  ? <span class='label label-success'>✔</span>
                  : null
              }
            </td>
            <td>
              <a href={`/detail/${row.digest}`}>
                {row.digest}
              </a>
            </td>
            <td>{row.timestamp}</td>
          </tr>
        ))
      }
      </tbody>
    </table>
  </div>
)

export default HashList
