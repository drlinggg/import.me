import { useState, useEffect, useCallback } from 'react'
import { apiFetch, normalizeRepo } from '../utils/api'

function normalizeGithubRepo(repo) {
  return {
    id: repo.id ?? repo.fullName,
    name: repo.fullName ?? repo.name,
    fullName: repo.fullName,
    description: repo.description || '',
    githubUrl: repo.url || `https://github.com/${repo.fullName}`,
    views: repo.viewCount ?? 0,
    stars: repo.stars ?? 0,
    forks: repo.forks ?? 0,
    ownerId: repo.ownerId,
    isAnalyzed: repo.isAnalyzed ?? false,
    isPrivate: repo.isPrivate ?? false,
  }
}

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
      const data = await apiFetch('/api/user/github-repos')
      setRepos((data || []).map(normalizeGithubRepo))
    } catch (err) {
      try {
        const fallback = await apiFetch('/api/user/my-repositories')
        setRepos((fallback || []).map(normalizeRepo))
      } catch {
        setError(err.message)
        setRepos([])
      }
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchRepos() }, [fetchRepos])

  return { repos, loading, error, refetch: fetchRepos }
}
