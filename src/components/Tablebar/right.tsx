import { forwardRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiLogIn } from 'react-icons/fi'
import ThemeToggle from '@/components/ThemeToggle'
import type { User } from '@/contexts/AppContext'

interface RightProps {
  user?: User | null
}

const Right = forwardRef<HTMLDivElement, RightProps>(({ user }, ref) => {
  const navigate = useNavigate()

  return (
    <div ref={ref} className="tablebar__right">
      {/* 主题切换 */}
      <ThemeToggle />

      {/* 用户相关 */}
      {user ? (
        <button
          className="tablebar__user-btn"
          onClick={() => navigate('/home')}
          aria-label="用户中心"
        >
          <span className="tablebar__user-avatar">
            {user.name?.[0] || user.username?.[0] || 'U'}
          </span>
        </button>
      ) : (
        <button
          className="tablebar__login-btn"
          onClick={() => navigate('/login')}
          aria-label="登录"
        >
          <FiLogIn />
          <span>登录</span>
        </button>
      )}
    </div>
  )
})

Right.displayName = 'Right'

export default Right
