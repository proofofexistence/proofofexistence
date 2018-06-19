import React from 'react'

const HashList = ({
  records,
  checked
}) => (
  <div class='card-body table-responsive table-full-width'>
    <table class='table' id='latest'>
      <thead>
        <tr>
          <th>Document Digest</th>
          <th>Timestamp</th>
          <th />
        </tr>
      </thead>
      <tbody className={checked ? 'text-success' : 'text-warning'} >
        {
        records.map(row => (
          <tr key={row.digest}>
            <td>
              <a href={`/detail/${row.digest}`}>
                {row.digest}
              </a>
            </td>
            <td>{row.timestamp}</td>
            <td>
              { checked ? '✔' : '…' }
            </td>
          </tr>
        ))
      }
      </tbody>
    </table>
  </div>
)

export default HashList
