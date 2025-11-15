import { Link } from 'react-router-dom'

/**
 * 404 页面组件
 * @returns 页面未找到组件
 */
const NotFound = () => {
  return (
    <div
      style={{
        padding: '2rem',
        textAlign: 'center',
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <h1 style={{ fontSize: '4rem', margin: 0, color: 'var(--text-primary)' }}>
        404
      </h1>
      <p
        style={{
          fontSize: '1.2rem',
          color: 'var(--text-secondary)',
          margin: '1rem 0',
        }}
      >
        页面未找到
      </p>
      <Link
        to="/"
        style={{
          padding: '0.5rem 1rem',
          background: 'var(--primary-color)',
          color: '#fff',
          borderRadius: '8px',
          textDecoration: 'none',
          marginTop: '1rem',
        }}
      >
        返回首页
      </Link>
    </div>
  )
}

export default NotFound
