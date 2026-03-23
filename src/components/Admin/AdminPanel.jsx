import { useState } from 'react'
import { useAdmin } from '../../hooks/useAdmin'
import './AdminPanel.css'

const StatCard = ({ label, value }) => (
  <div className="stat-card">
    <div className="stat-value">{value ?? '—'}</div>
    <div className="stat-label">{label}</div>
  </div>
)

const AdminPanel = ({ user, onClose }) => {
  const { users, stats, loading, error, deleteUser } = useAdmin(user)
  const [tab, setTab] = useState('stats')

  const handleDelete = async (userId, username) => {
    if (!window.confirm(`Delete user ${username}?`)) return
    try {
      await deleteUser(userId)
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="admin-overlay" onClick={onClose}>
      <div className="admin-panel" onClick={(e) => e.stopPropagation()}>
        <div className="admin-header">
          <span className="admin-title">Admin Panel</span>
          <button className="admin-close" onClick={onClose}>✕</button>
        </div>

        <div className="admin-tabs">
          <button className={`admin-tab ${tab === 'stats' ? 'active' : ''}`} onClick={() => setTab('stats')}>
            Stats
          </button>
          <button className={`admin-tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>
            Users
          </button>
        </div>

        {loading && <div className="admin-loading">Loading...</div>}
        {error && <div className="admin-error">{error}</div>}

        {!loading && tab === 'stats' && stats && (
          <div className="admin-stats">
            <div className="stat-cards">
              <StatCard label="Total Users" value={stats.totalUsers} />
              <StatCard label="Repositories" value={stats.totalRepos} />
              <StatCard label="Total Views" value={stats.totalViews} />
              <StatCard label="Modules" value={stats.totalModules} />
            </div>

            {stats.topRepos?.length > 0 && (
              <div className="admin-section">
                <div className="admin-section-title">Top Repositories</div>
                <table className="admin-table">
                  <thead>
                    <tr><th>Name</th><th>Views</th><th>Stars</th></tr>
                  </thead>
                  <tbody>
                    {stats.topRepos.map((r) => (
                      <tr key={r.name}>
                        <td>{r.name}</td>
                        <td>{r.views}</td>
                        <td>{r.stars}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {stats.roleBreakdown && (
              <div className="admin-section">
                <div className="admin-section-title">Roles</div>
                <div className="role-breakdown">
                  {Object.entries(stats.roleBreakdown).map(([role, count]) => (
                    <div key={role} className="role-row">
                      <span className={`role-badge role-${role}`}>{role}</span>
                      <span className="role-count">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && tab === 'users' && (
          <div className="admin-users">
            <table className="admin-table">
              <thead>
                <tr><th>User</th><th>Role</th><th>Repos</th><th>Last Login</th><th></th></tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="user-cell">
                      <img
                        src={u.avatarUrl || `https://avatars.githubusercontent.com/${u.username}`}
                        alt={u.username}
                        className="user-avatar-sm"
                      />
                      <span>{u.username}</span>
                    </td>
                    <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
                    <td>{u.repoCount}</td>
                    <td>{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : '—'}</td>
                    <td>
                      {u.role !== 'admin' && (
                        <button
                          className="delete-btn-sm"
                          onClick={() => handleDelete(u.id, u.username)}
                        >
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPanel
