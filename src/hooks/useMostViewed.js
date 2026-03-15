import { useState, useEffect, useCallback } from 'react'
import { apiFetch, normalizeRepo } from '../utils/api'

export const useMostViewed = (trigger = 0) => {
  const [mostViewed, setMostViewed] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchMostViewed = useCallback(async () => {
    try {
      setLoading(true)
      const data = await apiFetch('/api/repos/top?limit=10')
      setMostViewed((data || []).map(normalizeRepo))
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMostViewed() }, [fetchMostViewed, trigger])

  return { mostViewed, loading, error, refresh: fetchMostViewed }
}
