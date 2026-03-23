import { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '../utils/api'

export const useAdmin = (user) => {
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchAll = useCallback(async () => {
    if (!user || user.role !== 'admin') return
    setLoading(true)
    setError(null)
    try {
      const [usersData, statsData] = await Promise.all([
        apiFetch('/api/admin/users'),
        apiFetch('/api/admin/stats'),
      ])
      setUsers(usersData || [])
      setStats(statsData || null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  const deleteUser = useCallback(async (userId) => {
    await apiFetch(`/api/user/admin/users/${userId}`, { method: 'DELETE' })
    setUsers((prev) => prev.filter((u) => u.id !== userId))
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  return { users, stats, loading, error, refetch: fetchAll, deleteUser }
}
