import { useState, useEffect, useCallback } from 'react'
import { apiFetch, getGithubLoginUrl } from '../utils/api'

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      setLoading(false)
      return
    }

    const payload = parseJwt(token)
    if (!payload || payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('auth_token')
      setLoading(false)
      return
    }

    try {
      const userData = await apiFetch('/api/user/me')
      setUser(userData)
    } catch {
      localStorage.removeItem('auth_token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (token) {
      localStorage.setItem('auth_token', token)
      window.history.replaceState({}, '', window.location.pathname)
    }
    loadUser()
  }, [loadUser])

  const login = useCallback(() => {
    window.location.href = getGithubLoginUrl()
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token')
    setUser(null)
  }, [])

  return { user, loading, login, logout }
}
