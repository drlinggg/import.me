import { useState, useEffect, useCallback } from 'react'
import { apiFetch, normalizeRepo } from '../utils/api'

export const useUserRepos = (user) => {
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRepos = useCallback(async () => {
    if (!user) {
      setRepos([])
      setError(null)
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const data = await apiFetch('/api/user/my-repositories')
      setRepos((data || []).map(normalizeRepo))
    } catch (err) {
      setError(err.message)
      setRepos([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchRepos() }, [fetchRepos])

  return { repos, loading, error, refetch: fetchRepos }
}
