import { useRef } from 'react'
import Header from './components/Header/Header'
import Sidebar from './components/Sidebar/Sidebar'
import Graph from './components/Graph/Graph'
import './styles/globals.css'


function App() {
  const graphRef = useRef()

  const handleImport = (repoUrl) => {
    if (graphRef.current) {
      graphRef.current.loadGraph(repoUrl)
    }
  }

  return (
    <div className="app">
      <Header onImport={handleImport} />
      <div className="content">
        <Sidebar />
        <Graph ref={graphRef} />
      </div>
    </div>
  )
}

export default App
