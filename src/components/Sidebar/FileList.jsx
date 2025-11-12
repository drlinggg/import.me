const FileList = () => {
  const mostViewed = [
    { id: 1, name: 'some_dude/ssh', views: 100500 },
    { id: 2, name: 'some_dude/CPython', views: 5 },
    { id: 3, name: 'some_dude/rubiks-cube', views: 5 },
    { id: 4, name: 'some_dude/doom', views: 5 },
    { id: 5, name: 'some_dude/ssh', views: 5 },
    { id: 6, name: 'some_dude/ssh', views: 5 },
    { id: 7, name: 'some_dude/ssh', views: 5 },
    { id: 8, name: 'some_dude/ssh', views: 5 },
    { id: 9, name: 'some_dude/ssh', views: 5 },
    { id: 10, name: 'some_dude/ssh', views: 1 }
  ]

  return (
    <div className="file-list">
      {mostViewed.map(item => (
        <div key={item.id} className="file-item">
          <span className="file-name">{item.name}</span>
          <span className="file-count">{item.views}</span>
        </div>
      ))}
    </div>
  )
}

export default FileList
