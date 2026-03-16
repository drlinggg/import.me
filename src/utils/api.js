const BASE_URL = import.meta.env.VITE_API_URL || 'https://web-backend-lab-1drlinggg.onrender.com'

function getToken() {
  return localStorage.getItem('auth_token')
}

export async function apiFetch(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  let response
  try {
    response = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  } catch {
    throw new Error('Cannot reach server. Is the backend running?')
  }

  const text = await response.text()

  if (!response.ok) {
    let message = `HTTP ${response.status}`
    try {
      const parsed = JSON.parse(text)
      message = parsed.message || parsed.error || message
    } catch {
      message = response.statusText || message
    }
    throw new Error(message)
  }

  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    throw new Error(`Server returned non-JSON response for ${path}`)
  }
}

export function getGithubLoginUrl() {
  return `${BASE_URL}/api/auth/github`
}

/**
 * Neo4j driver serialises Integer values as { low, high } objects.
 * This helper extracts a plain JS number from either form.
 */
export function toInt(value) {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  if (typeof value === 'object' && 'low' in value) return value.low
  return Number(value) || 0
}

/**
 * Normalise a raw repo object coming from the backend into the shape the
 * frontend expects.  Handles Neo4j Integer fields transparently.
 */
export function normalizeRepo(repo) {
  return {
    id:          repo.id,
    name:        repo.fullName || repo.name,
    views:       toInt(repo.viewCount),
    stars:       toInt(repo.stars),
    forks:       toInt(repo.forks),
    githubUrl:   repo.url || `https://github.com/${repo.fullName || repo.name}`,
    description: repo.description || '',
    ownerId:     repo.ownerId,
  }
}
