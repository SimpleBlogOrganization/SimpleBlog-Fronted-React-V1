import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useApp } from '@/contexts/AppContext'

/**
 * 登录页面组件
 * @returns 登录表单组件
 */
const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { setUser, setState } = useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  /**
   * 处理登录表单提交
   * @param e - 表单提交事件
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // TODO: 替换为真实的登录 API 调用
    setTimeout(() => {
      const user = {
        id: 1,
        username,
        name: username,
        email: `${username}@example.com`,
      }
      const token = 'mock-token-' + Date.now()
      setUser(user)
      setState('token', token)
      setLoading(false)

      // 从 query 参数获取重定向路径
      const redirectTo = searchParams.get('redirect') || '/home'
      navigate(redirectTo, { replace: true })
    }, 500)
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      <h1>登录</h1>
      <form onSubmit={handleLogin} style={{ marginTop: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: 'var(--text-primary)',
            }}
          >
            用户名
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              boxSizing: 'border-box',
            }}
            placeholder="输入用户名"
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: 'var(--text-primary)',
            }}
          >
            密码
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              boxSizing: 'border-box',
            }}
            placeholder="输入密码"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: loading
              ? 'var(--border-color)'
              : 'var(--primary-color)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
          }}
        >
          {loading ? '登录中...' : '登录'}
        </button>
      </form>
    </div>
  )
}

export default Login
