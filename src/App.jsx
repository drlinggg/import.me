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
    
    // Если у репозитория есть githubUrl, используем его
    if (repo.githubUrl) {
      handleImport(repo.githubUrl)
    } else {
      // Иначе формируем URL из имени репозитория
      const repoUrl = `https://github.com/${repo.name}`
      handleImport(repoUrl)
    }
  }

  return (
    <div className="app">
      <Header onImport={handleImport} />
      <div className="content">
        <Sidebar onRepoSelect={handleRepoSelect} selectedRepoId={selectedRepo?.id} />
        <Graph ref={graphRef} />
      </div>
    </div>
  )
}

export default App
