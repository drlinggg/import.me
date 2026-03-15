import { useRef, useState } from 'react'
import Header from './components/Header/Header'
import Sidebar from './components/Sidebar/Sidebar'
import Graph from './components/Graph/Graph'
import { useAuth } from './hooks/useAuth'
import './styles/globals.css'

function App() {
  const graphRef = useRef()
  const [selectedRepo, setSelectedRepo] = useState(null)
  const [importKey, setImportKey] = useState(0)
  const { user, loading: authLoading, login, logout } = useAuth()

  const handleImport = async (repoUrl) => {
    if (graphRef.current) {
      await graphRef.current.loadGraph(repoUrl)
      setImportKey((k) => k + 1)
    }
  }

  const handleRepoSelect = (repo) => {
    setSelectedRepo(repo)
    const url = repo.githubUrl
      ? repo.githubUrl.replace('https://github.com/', '')
      : repo.name
    handleImport(url)
  }

  return (
    <div className="app" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        onImport={handleImport}
        user={user}
        authLoading={authLoading}
        onLogin={login}
        onLogout={logout}
      />
      <div
        className="content"
        style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          padding: '20px',
          gap: '20px',
        }}
      >
        <Sidebar
          onRepoSelect={handleRepoSelect}
          selectedRepoId={selectedRepo?.id}
          importKey={importKey}
          user={user}
        />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Graph ref={graphRef} />
        </div>
      </div>
    </div>
  )
}

export default App
