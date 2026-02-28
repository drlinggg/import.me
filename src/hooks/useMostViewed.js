import { useState, useEffect } from 'react'

export const useMostViewed = () => {
  const [mostViewed, setMostViewed] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMostViewed = async () => {
      try {
        setLoading(true)
        
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const mockData = [
          { id: 1, name: 'some_dude/ssh', views: 100500, githubUrl: 'https://github.com/some_dude/ssh' },
          { id: 2, name: 'some_dude/CPython', views: 5, githubUrl: 'https://github.com/some_dude/CPython' },
          { id: 3, name: 'some_dude/rubiks-cube', views: 5, githubUrl: 'https://github.com/some_dude/rubiks-cube' },
          { id: 4, name: 'some_dude/doom', views: 5, githubUrl: 'https://github.com/some_dude/doom' },
          { id: 5, name: 'some_dude/another-repo', views: 5, githubUrl: 'https://github.com/some_dude/another-repo' }
        ]
        
        setMostViewed(mockData)
        
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchMostViewed()
  }, [])

  return {
    mostViewed,
    loading,
    error
  }
}
