import { useState, useEffect } from 'react'
import FileList from '../FileList/FileList'
import { useMostViewed } from '../../hooks/useMostViewed'
import './Sidebar.css'

const TABS = [
  { key: 'top', label: 'Most Viewed' },
  { key: 'favorites', label: 'Favorites' },
  { key: 'mine', label: 'My Repos' },
]

const Sidebar = ({ onRepoSelect, selectedRepoId, importKey, user }) => {
  const [activeTab, setActiveTab] = useState('top')
  const { mostViewed, loading, error, refresh } = useMostViewed(importKey)
  const [localSelectedId, setLocalSelectedId] = useState(selectedRepoId)

  useEffect(() => {
    setLocalSelectedId(selectedRepoId)
  }, [selectedRepoId])

  return (
    <div className="sidebar">
      <div className="sidebar-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`sidebar-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <FileList
        mode={activeTab}
        onRepoSelect={(repo) => { setLocalSelectedId(repo.id); onRepoSelect(repo) }}
        selectedRepoId={localSelectedId}
        user={user}
        mostViewed={mostViewed}
        mostViewedLoading={loading}
        mostViewedError={error}
        onRefresh={refresh}
      />
    </div>
  )
}

export default Sidebar
