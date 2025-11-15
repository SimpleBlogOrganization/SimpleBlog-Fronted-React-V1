import type { RouterGuard } from '@/types/router'
import { redirect } from 'react-router-dom'
import { PUBLIC_ROUTES } from '@/config/router'
import { getUser } from '@/contexts/AppContext'

/**
 * 创建认证守卫
 * 处理路由认证、重定向和页面标题设置
 * @returns 路由守卫配置对象
 * @example
 * ```typescript
 * const guard = createAuthGuard()
 * const router = createEnhancedRouter(routes, guard)
 * ```
 */
export const createAuthGuard = (): RouterGuard => {
  return {
    beforeEach: async ({ to, meta }) => {
      const isPublic = (PUBLIC_ROUTES as readonly string[]).includes(
        to.pathname
      )
      const user = getUser()

      // 非公开路由需要登录
      if (!isPublic && !user) {
        return redirect(
          `/login?redirect=${encodeURIComponent(to.pathname + to.search)}`
        )
      }

      // 已登录用户访问登录页，重定向到首页
      if (to.pathname === '/login' && user) {
        return redirect('/home')
      }

      // 设置页面标题
      if (meta.title) {
        document.title = meta.title
      }

      // 守卫通过，返回 undefined（继续路由）
      return undefined
    },
  }
}
