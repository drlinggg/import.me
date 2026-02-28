import { useMostViewed } from '../../hooks/useMostViewed';
import './FileList.css';

const FileList = ({ onRepoSelect, selectedRepoId }) => {
  const { mostViewed, loading, error } = useMostViewed()

  const handleRepoClick = (repo) => {
    if (onRepoSelect) {
      onRepoSelect(repo)
    }
  }

  if (loading) {
    return <div className="file-list-loading">Загрузка...</div>
  }

  if (error) {
    return (
      <div className="file-list-error">
        <div>Ошибка загрузки: {error}</div>
        <div>Используются демо-данные</div>
      </div>
    )
  }

  return (
    <div className="file-list">
      {mostViewed.map(item => (
        <div 
          key={item.id} 
          className={`file-item ${selectedRepoId === item.id ? 'selected' : ''}`}
          onClick={() => handleRepoClick(item)}
        >
          <span className="file-name">{item.name}</span>
          <span className="file-count">{item.views}</span>
        </div>
      ))}
    </div>
  )
}

export default FileList
