import FileList from './FileList'

const Sidebar = ({ onRepoSelect, selectedRepoId }) => {
  return (
    <div className="sidebar">
      <h3>Most viewed:</h3>
      <FileList onRepoSelect={onRepoSelect} selectedRepoId={selectedRepoId} />
    </div>
  )
}

export default Sidebar
