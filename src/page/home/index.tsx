import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '@/contexts/AppContext'

/**
 * 用户中心页面组件
 * @returns 用户信息展示组件
 */
const Home = () => {
  const { user, logout } = useApp()
  const navigate = useNavigate()

  /**
   * 处理退出登录
   */
  const handleLogout = () => {
    logout()
    // 使用 replace: true 避免在历史栈中留下 /home，防止用户通过浏览器回退回到已退出登录的页面
    navigate('/login', { replace: true })
  }

  if (!user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>未登录</h1>
        <Link
          to="/login"
          style={{
            color: 'var(--primary-color)',
            textDecoration: 'none',
          }}
        >
          前往登录
        </Link>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>欢迎回来，{user.username || user.name}！</h1>

      <div
        style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: 'var(--bg-secondary)',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
        }}
      >
        <h2>用户信息</h2>
        <div style={{ marginTop: '1rem' }}>
          <p>
            <strong>ID:</strong> {user.id}
          </p>
          <p>
            <strong>用户名:</strong> {user.username || user.name}
          </p>
          {user.email && (
            <p>
              <strong>邮箱:</strong> {user.email}
            </p>
          )}
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link
            to="/"
            style={{
              padding: '0.5rem 1rem',
              background: 'var(--primary-color)',
              color: '#fff',
              borderRadius: '8px',
              textDecoration: 'none',
            }}
          >
            返回首页
          </Link>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              background: 'transparent',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            退出登录
          </button>
        </div>
      </div>
    </div>
  )
}

export default Home
