import { useState, useEffect, useCallback } from 'react'
import { apiFetch, normalizeRepo } from '../utils/api'

export const useFavorites = (user) => {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [likedIds, setLikedIds] = useState(new Set())

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([])
      setLikedIds(new Set())
      setError(null)
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const data = await apiFetch('/api/user/favorites')
      const normalized = (data || []).map(normalizeRepo)
      setFavorites(normalized)
      setLikedIds(new Set(normalized.map((r) => r.id)))
    } catch (err) {
      setError(err.message)
      setFavorites([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchFavorites() }, [fetchFavorites])

  const toggleLike = useCallback(async (repoId) => {
    if (!user) return
    const isLiked = likedIds.has(repoId)
    try {
      if (isLiked) {
        await apiFetch(`/api/repos/${repoId}/like`, { method: 'DELETE' })
        setLikedIds((prev) => { const next = new Set(prev); next.delete(repoId); return next })
        setFavorites((prev) => prev.filter((r) => r.id !== repoId))
      } else {
        await apiFetch(`/api/repos/${repoId}/like`, { method: 'POST' })
        setLikedIds((prev) => new Set(prev).add(repoId))
        await fetchFavorites()
      }
    } catch (err) {
      console.error('Toggle like error:', err)
    }
  }, [user, likedIds, fetchFavorites])

  return { favorites, loading, error, likedIds, toggleLike, refetch: fetchFavorites }
}
