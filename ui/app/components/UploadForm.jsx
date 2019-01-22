import React from 'react'
import Dropzone from 'react-dropzone'

const style = {
  dropZone: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderStyle: 'dashed',
    borderRadius: 4,
    padding: 30,
    width: '100%',
    height: '20vh',
    transition: 'all 0.5s',
    cursor: 'pointer'
  },
  errors: {
    color: 'red',
    fontSize: '.8em'
  }
}

class UploadForm extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      errors: []
    }
  }

  sizeMotoBytes (fileSize) {
    return fileSize * 1048576
  }

  onDrop (files, rejectedFiles) {
    if (rejectedFiles.length) {
      const errors = []
      // check file size
      const { maxFileSize } = this.props
      rejectedFiles.forEach(f =>
        f.size > this.sizeMotoBytes(maxFileSize)
          ? errors.push(`${f.name} is too big and can not be added. You may want to generate the hash on your machine and input it directly here.`)
          : null
      )
      this.setState({errors})
    } else {
      this.props.handleAddFile(files)
    }
  }

  handleRemoveFile (file) {
    this.setState({errors: []})

    const newFiles = this.props.files
      .filter(f => f.name !== file.name)

    this.props.handleAddFiles(newFiles)
  }

  render () {
    const { files, maxFileSize } = this.props

    const filesItems = files.map(file =>
      <span key={file.name}>
        {file.name}
      </span>
    )

    return (
      <div>
        {
          !files.length
            ? <Dropzone
              onDrop={this.onDrop.bind(this)}
              style={style.dropZone}
              maxSize={this.sizeMotoBytes(maxFileSize)}
              >
              <div>
                <h4>
                  Drag and drop your document here.
                  <br />
                  <small class='card-category'>
                    The file will <strong>not</strong> be uploaded.
                  </small>
                </h4>
              </div>
            </Dropzone>
          : <div>
            <p class='card-category'>
                File added :
                <br />
              {filesItems}.
              </p>
          </div>
        }
        {
          this.state.errors.length
            ? <ul style={{listStyle: 'none'}}>
              {
                this.state.errors.map(err => (
                  <li key={err} style={style.errors}>{err}</li>
                ))
              }
            </ul>
          : null
        }

      </div>
    )
  }
}

export default UploadForm
