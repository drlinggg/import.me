import { useRef, useState } from 'react'
import Header from './components/Header/Header'
import Sidebar from './components/Sidebar/Sidebar'
import Graph from './components/Graph/Graph'
import './styles/globals.css'

function App() {
  const graphRef = useRef()
  const [selectedRepo, setSelectedRepo] = useState(null)

  const handleImport = (repoUrl) => {
    if (graphRef.current) {
      graphRef.current.loadGraph(repoUrl)
    }
  }

  const handleRepoSelect = (repo) => {
    console.log('Выбран репозиторий:', repo)
    setSelectedRepo(repo)
    
    if (repo.githubUrl) {
      handleImport(repo.githubUrl)
    } else {
      const repoUrl = `https://github.com/${repo.name}`
      handleImport(repoUrl)
    }
  }

  return (
    <div className="app" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header onImport={handleImport} />
      <div className="content" style={{ 
        flex: 1, 
        display: 'flex', 
        overflow: 'hidden',
        padding: '20px',
        gap: '20px'
      }}>
        <Sidebar onRepoSelect={handleRepoSelect} selectedRepoId={selectedRepo?.id} />
        <div style={{ 
          flex: 1, 
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0 // Для правильного сжатия
        }}>
          <Graph ref={graphRef} />
        </div>
      </div>
    </div>
  )
}

export default App
