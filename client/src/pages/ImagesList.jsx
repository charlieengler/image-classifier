import React, { Component } from 'react'
import api from '../api'

import '../style/style.css'

import styled from 'styled-components'

const Wrapper = styled.div`
    padding: 0 40px 40px 40px;
`

const Video = styled.div`
    color: #0080ff;
    cursor: pointer;
`

const Update = styled.div`
    color: #ef9b0f;
    cursor: pointer;
`

const Delete = styled.div`
    color: #ff0000;
    cursor: pointer;
`

const Popup = styled.div`
    cursor: pointer;
    position: absolute;
    margin-left: -850px;
    margin-top: -100px;
    z-index: 2;
    box-shadow: 0px 0px 100px 10px #111111;
`

const ImageButton = styled.div`
    cursor: pointer;
    position: absolute;
    width: 100px;
    height: 77px;
    clip: rect(0px, 100px, 77px, 0px);
    z-index: 1;
`

const SearchBar = styled.input.attrs({
    className:'form-control',
})`
    cursor: text;
    border: 1px solid black;
`

const SearchReload = styled.input.attrs({
    className:'form-control',
})`
    cursor: pointer;
    background-color: #cdcdcd;
    color: #000000;
`

const SearchSubmit = styled.input.attrs({
    className:'form-control',
})`
    cursor: pointer;
    background-color: #6cd649;
    color: #000000;
`

class Search extends Component {
    constructor(props){
        super(props)
        this.state = {
            term: ''
        }
    }

    handleChangeInputSearch = async event => {
        const term = event.target.value
        this.setState({ term })

        if(term.length > 0){
            this.props.go(term)
        } 
        else{
            this.props.reloadTable()
        }
    }

    render(){
        const term = this.state.term

        let isTerm = false
        if(term.length > 0)
            isTerm = true

        return <div>
            <SearchBar
                type="text"
                value={term}
                onChange={this.handleChangeInputSearch}
            />
            {isTerm && (
                <SearchSubmit
                    type="submit"
                    value="Search"
                    onClick={() => this.props.go(term)}
                />
            )}
            {/*🗘*/}
            <SearchReload
                type="submit"
                value="Reload Table"
                onClick={this.props.reloadTable}
            />
        </div>
    }
}

class Table extends Component {
    render() {
        return <table className="table">
            <thead>
                <tr>
                    {this.props.columns.map(columns => (
                        <th key={columns.Header}>{columns.Header}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {this.props.data.map(data => {
                    let lastIndex = data.filename.lastIndexOf('.') + 1
                    let fileType = data.filename.substr(lastIndex)

                    let isImage = false

                    switch(fileType){
                        case "jpg":
                            isImage = true
                            break

                        case "png":
                            isImage = true
                            break

                        case "jpeg":
                            isImage = true
                            break

                        case "gif":
                            isImage = true
                            break

                        case "mp4":
                            isImage = false
                            break

                        case "webm":
                            isImage = false
                            break

                        case "ogg":
                            isImage = false
                            break

                        default:
                            isImage = false
                            break
                    }

                    return <tr key={data._id}>
                        <td>
                            {data._id}
                        </td>
                        <td>
                            {data.name}
                        </td>
                        <td>
                            {data.description}
                        </td>
                        <td>
                            {data.filename}
                        </td>
                        <td width="120px">
                            {isImage ? <ImageHandler filename={data.filename} file={data.image} /> :
                                <FileLink name={data.name} fileType={fileType} />
                            }
                        </td>
                        <td>
                            {<DeleteImage id={data._id} name={data.name} />}
                        </td>
                        <td>
                            {<UpdateImage id={data._id} />}
                        </td>
                    </tr>
                })}
            </tbody>
        </table>
    }
}

class FileLink extends Component {
    updateUser = event => {
        event.preventDefault()

        window.location.href = `/images/file/${this.props.name}/${this.props.fileType}`
    }

    render() {
        return <Video onClick={this.updateUser}>Open File <br/> ({this.props.fileType})</Video>
    }
}

class UpdateImage extends Component {
    updateUser = event => {
        event.preventDefault()

        window.location.href = `/images/update/${this.props.id}`
    }

    render() {
        return <Update onClick={this.updateUser}>Update</Update>
    }
}

class DeleteImage extends Component {
    deleteUser = event => {
        event.preventDefault()
        
        if (
            window.confirm(
                `Do you want to delete this image ${this.props.id} permanently?`,
            )
        ) {
            api.deleteImageById(this.props.id, this.props.name).then(() => {
                window.location.reload()
            })
        }
    }

    render() {
        return <Delete onClick={this.deleteUser}>Delete</Delete>
    }
}

class ImageHandler extends Component {
    state = {
        seen: true
    }

    togglePopup = () => {
        this.setState({
            seen: !this.state.seen
        })
    }

    render() {
        return  <div>
                    {!this.state.seen ? <Popup onClick={this.togglePopup}>
                        <img
                            alt={this.props.filename}
                            src={this.props.file}
                            width="1000px"
                            height="auto"
                        />
                    </Popup> : <ImageButton onClick={this.togglePopup}>
                        <img
                            alt={this.props.filename}
                            src={this.props.file}
                            width="100px"
                            height="auto"
                        />
                    </ImageButton>}
                    <br/>
                    <br/>
                    <br/>
                </div>
    }
}

class ImagesList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            images: [],
            columns: [],
        }
        this.searchGo = this.searchGo.bind(this)
    }
    
    searchGo = async (term) => {
        await api.searchImage(term, false).then(images => {
            this.setState({
                images: images.data.data,
            })
        }).catch(error => {
            this.componentDidMount()
        })
    }

    reloadTable = async () => {
        await api.getAllImages().then(images => {
            this.setState({
                images: images.data.data,
            })
        })
    }

    componentDidMount = async () => {
        await api.getAllImages().then(images => {
            this.setState({
                images: images.data.data,
            })
        })
    }

    render() {
        const { images } = this.state

        const columns = [
            {
                Header: 'ID',
                accessor: '_id',
            },
            {
                Header: 'Name',
                accessor: 'name',
                filterable: true,
            },
            {
                Header: 'Description',
                accessor: 'description',
                filterable: true,
            },
            {
                Header: 'File Name',
                accessor: 'filename',
            },
            {
                Header: 'File',
                accessor: 'file',
            },
            {
                Header: 'Delete',
                accessor: 'delete',
            },
            {
                Header: 'Update',
                accessor: 'update',
            },
        ]

        let showTable = true
        if (!images.length) {
            showTable = false
        }

        return (
            <Wrapper>
                <Search reloadTable={this.reloadTable} go={this.searchGo}/>
                {showTable && (
                    <Table
                        columns={columns}
                        data={images}
                    />
                )}
            </Wrapper>
        )
    }
}

export default ImagesList