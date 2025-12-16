import FileList from '../FileList/FileList'
import './Sidebar.css'

const Sidebar = ({ onRepoSelect, selectedRepoId }) => {
  return (
    <div className="sidebar">
      <h3>Most viewed:</h3>
      <FileList onRepoSelect={onRepoSelect} selectedRepoId={selectedRepoId} />
    </div>
  )
}

export default Sidebar
