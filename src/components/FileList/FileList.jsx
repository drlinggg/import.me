import { useFavorites } from '../../hooks/useFavorites'
import { useUserRepos } from '../../hooks/useUserRepos'
import { apiFetch } from '../../utils/api'
import './FileList.css'

const HeartIcon = ({ filled }) => (
  <svg
    className={`heart-icon ${filled ? 'filled' : ''}`}
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="trash-icon">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
)

const RepoItem = ({ item, isSelected, onClick, user, likedIds, onToggleLike, onDelete }) => {
  const isLiked = likedIds?.has(item.id)
  const isAdmin = user?.role === 'admin'
  const isOwner = item.ownerId === user?.id
  const canDelete = isAdmin || isOwner

  return (
    <div className={`file-item ${isSelected ? 'selected' : ''}`} onClick={() => onClick(item)}>
      <div className="file-item-content">
        <span className="file-name">{item.name}</span>
        {item.description && <span className="file-desc">{item.description}</span>}
      </div>
      <div className="file-item-right">
        <span className="file-count">{item.views}</span>
        {user && onToggleLike && (
          <button
            className={`like-btn ${isLiked ? 'liked' : ''}`}
            onClick={(e) => { e.stopPropagation(); onToggleLike(item.id) }}
            title={isLiked ? 'Unlike' : 'Like'}
          >
            <HeartIcon filled={isLiked} />
          </button>
        )}
        {canDelete && (
          <button
            className="delete-btn"
            onClick={(e) => { e.stopPropagation(); onDelete(item.id) }}
            title="Delete repository"
          >
            <TrashIcon />
          </button>
        )}
      </div>
    </div>
  )
}

const EmptyState = ({ message }) => <div className="file-list-empty">{message}</div>

const FileList = ({
  mode = 'top',
  onRepoSelect,
  selectedRepoId,
  user,
  mostViewed = [],
  mostViewedLoading = false,
  mostViewedError = null,
  onRefresh,
}) => {
  const { favorites, loading: favLoading, error: favError, likedIds, toggleLike, refetch: refetchFav } = useFavorites(user)
  const { repos: myRepos, loading: mineLoading, error: mineError, refetch: refetchMine } = useUserRepos(user)

  const handleDelete = async (repoId) => {
    if (!window.confirm('Delete this repository?')) return
    try {
      await apiFetch(`/api/repos/${repoId}`, { method: 'DELETE' })
      if (onRefresh) onRefresh()
      if (refetchFav) refetchFav()
      if (refetchMine) refetchMine()
    } catch (err) {
      alert(err.message)
    }
  }

  const itemProps = (item) => ({
    key: item.id,
    item,
    isSelected: selectedRepoId === item.id,
    onClick: onRepoSelect || (() => {}),
    user,
    likedIds,
    onToggleLike: toggleLike,
    onDelete: handleDelete,
  })

  if (mode === 'top') {
    if (mostViewedLoading) return <div className="file-list-loading">Loading...</div>
    if (mostViewedError) return <div className="file-list-error">Error: {mostViewedError}</div>
    if (!mostViewed.length) return <EmptyState message="No repositories yet" />
    return <div className="file-list">{mostViewed.map((item) => <RepoItem {...itemProps(item)} />)}</div>
  }

  if (mode === 'favorites') {
    if (!user) return <EmptyState message="Login to see favorites" />
    if (favLoading) return <div className="file-list-loading">Loading...</div>
    if (favError) return <div className="file-list-error">Error: {favError}</div>
    if (!favorites.length) return <EmptyState message="No liked repositories yet" />
    return <div className="file-list">{favorites.map((item) => <RepoItem {...itemProps(item)} />)}</div>
  }

  if (mode === 'mine') {
    if (!user) return <EmptyState message="Login to see your repositories" />
    if (mineLoading) return <div className="file-list-loading">Loading...</div>
    if (mineError) return <div className="file-list-error">Error: {mineError}</div>
    if (!myRepos.length) return <EmptyState message="No owned repositories found" />
    return <div className="file-list">{myRepos.map((item) => <RepoItem {...itemProps(item)} />)}</div>
  }

  return null
}

export default FileList
