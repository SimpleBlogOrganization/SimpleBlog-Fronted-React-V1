import type { RouterGuard } from '@/types/router'
import { redirect } from 'react-router-dom'
import { PUBLIC_ROUTES } from '@/config/router'
import { getUser } from '@/contexts/AppContext'

/**
 * 创建认证守卫
 * 处理路由认证、重定向和页面标题设置
 */
export const createAuthGuard = (): RouterGuard => {
  return {
    beforeEach: async ({ to, meta }) => {
      const isPublic = (PUBLIC_ROUTES as readonly string[]).includes(
        to.pathname
      )
      const user = getUser()

      if (!isPublic && !user) {
        return redirect(
          `/login?redirect=${encodeURIComponent(to.pathname + to.search)}`
        )
      }

      if (to.pathname === '/login' && user) {
        return redirect('/home')
      }

      if (meta.title) {
        document.title = meta.title
      }

      return undefined
    },
  }
}
