import Header from './components/Header/Header'
import Sidebar from './components/Sidebar/Sidebar'
import Graph from './components/Graph/Graph'

function App() {
  return (
    <div className="app">
      <Header />
      <div className="content">
        <Sidebar />
        <Graph />
      </div>
    </div>
  )
}

export default App
