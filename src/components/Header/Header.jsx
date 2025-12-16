import { useState } from 'react'
import './Header.css'

const Header = ({ onImport }) => {
  const [repoUrl, setRepoUrl] = useState('drlinggg/import.me')

  const handleImport = () => {
    if (onImport && repoUrl) {
      onImport(repoUrl)
    }
  }

  return (
    <div className="header">
      <div className="import-section">
        <div className="logo">IMPORT ME</div>
        <input 
          type="text" 
          className="import-input" 
          placeholder="username/repository"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
        />
        <button className="import-action-button" onClick={handleImport}>
          import
        </button>
      </div>
    </div>
  )
}

export default Header
