import React from 'react'
import moment from 'moment'

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
          { checked
            ? <th />
            : null
          }
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
            <td style={{ whiteSpace: 'nowrap' }}>
              {moment(row.timestamp).fromNow()}
            </td>
            { checked
                ? <td>
                  '✔'
                </td>
              : null
            }
          </tr>
        ))
      }
      </tbody>
    </table>
  </div>
)

export default HashList
