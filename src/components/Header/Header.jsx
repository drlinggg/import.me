const Header = () => {
  return (
    <div className="header">
      <div className="import-section">
        <div className="logo">IMPORT ME</div>
        <input type="text" className="import-input" placeholder="drlinggg/import.me" defaultValue="drlinggg/import.me" />
        <button className="import-action-button">import</button>
      </div>
    </div>
  )
}

export default Header
