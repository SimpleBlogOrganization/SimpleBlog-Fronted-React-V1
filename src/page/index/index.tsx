import { Link } from 'react-router-dom'
import { useApp } from '@/contexts/AppContext'

/**
 * 首页组件
 */
const Index = () => {
  const { user, mode, setMode } = useApp()

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>博客首页</h1>

      <div style={{ marginTop: '2rem' }}>
        <nav style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {user ? (
            <Link
              to="/home"
              style={{
                padding: '0.5rem 1rem',
                background: 'var(--primary-color)',
                color: '#fff',
                borderRadius: '8px',
                textDecoration: 'none',
              }}
            >
              {user.username || user.name || '用户中心'}
            </Link>
          ) : (
            <Link
              to="/login"
              style={{
                padding: '0.5rem 1rem',
                background: 'var(--primary-color)',
                color: '#fff',
                borderRadius: '8px',
                textDecoration: 'none',
              }}
            >
              登录
            </Link>
          )}
        </nav>
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h2>模式切换</h2>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          {[
            { value: 'light', label: '🌞 浅色' },
            { value: 'dark', label: '🌙 深色' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setMode(item.value as 'light' | 'dark')}
              style={{
                padding: '0.5rem 1rem',
                background:
                  mode === item.value ? 'var(--primary-color)' : 'transparent',
                color: mode === item.value ? '#fff' : 'var(--text-primary)',
                border: `2px solid ${
                  mode === item.value
                    ? 'var(--primary-color)'
                    : 'var(--border-color)'
                }`,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Index
