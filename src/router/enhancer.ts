import type {
  EnhancedRoute,
  GuardContext,
  RouteMeta,
  RouterGuard,
} from '@/types/router'
import {
  createBrowserRouter,
  redirect,
  type LoaderFunction,
  type RouteObject,
  type Location,
} from 'react-router-dom'
import { loadingManager } from '@/components/loading/manager'

/**
 * 路由增强器
 * 负责路由增强、Loading 动画控制、守卫调用
 */

let currentPathname: string = ''

/**
 * 创建路由增强器
 * 为路由注入 loader，处理 Loading 动画和守卫调用
 * @param routes - 路由配置数组
 * @param guard - 路由守卫配置对象
 * @returns 增强后的路由器实例
 * @example
 * ```typescript
 * const router = createEnhancedRouter(routes, createAuthGuard())
 * ```
 */
export const createEnhancedRouter = (
  routes: EnhancedRoute[],
  guard?: RouterGuard
) => {
  let previousLocation: Location | null = null // 来源路由信息

  /**
   * 增强路由配置
   * @param routes - 路由配置数组
   * @param parentMeta - 父路由元数据
   * @returns 增强后的路由对象数组
   */
  const enhanceRoutes = (
    routes: EnhancedRoute[],
    parentMeta: RouteMeta = {}
  ): RouteObject[] => {
    const items = routes.map((route) => {
      // 合并父路由和子路由的元数据
      const currentMeta = mergeRouteMeta(parentMeta, route.meta)

      /**
       * 增强的 loader
       * 负责：路径检查、Loading 动画、守卫调用、页面加载
       */
      const enhancedLoader: RouteObject['loader'] = async (args) => {
        const targetUrl = new URL(args.request.url) // 目标URL

        // 如果是相同路径，直接返回（避免重复加载）
        if (targetUrl.pathname === currentPathname) {
          return (route.loader as LoaderFunction)?.(args) // 直接返回loader结果
        }
        currentPathname = targetUrl.pathname // 更新当前路径

        // 构建守卫上下文
        const context: GuardContext = {
          // 目标路由信息
          to: {
            pathname: targetUrl.pathname, // 路径
            search: targetUrl.search, // 搜索参数
            hash: targetUrl.hash, // 哈希
            state: null, // 状态
            key: Date.now().toString(36), // 唯一key
          },
          from: previousLocation ?? null, // 来源路由信息
          params: args.params, // 动态参数
          meta: { title: 'Untitled', ...currentMeta }, // 合并后的元数据
          redirect: route.redirect, // 重定向
        }

        // 处理路由配置的重定向
        if (route.redirect && route.redirect !== targetUrl.pathname) {
          return redirect(route.redirect)
        }

        // ========== Loading 动画控制 + 守卫调用 ==========
        try {
          // 显示 loading 并等待进入 active 状态
          await loadingManager.show()

          // 执行守卫（如果存在）
          if (guard?.beforeEach) {
            const result = await guard.beforeEach(context)

            // 守卫返回重定向响应
            if (result instanceof Response) {
              loadingManager.hide() // 隐藏 loading
              return result
            }
          }

          // 执行路由 loader（加载页面数据）
          previousLocation = context.to
          const loaderResult = await (route.loader as LoaderFunction)?.(args)

          // 页面数据加载完成，检查 DOM 加载状态并隐藏 loading
          loadingManager.checkAndHide()

          return loaderResult
        } catch (error) {
          // 错误处理：隐藏 loading 并重定向到 404 页面
          console.error('Route Loader Error:', error)
          loadingManager.hide()
          return redirect('/404')
        }
      }

      // 返回增强后的路由对象
      return {
        ...route,
        loader: enhancedLoader,
        handle: {
          meta: currentMeta,
        },
        children: route.children?.length
          ? enhanceRoutes(route.children, currentMeta)
          : route.children,
      }
    })

    return items as RouteObject[]
  }

  return createBrowserRouter(enhanceRoutes(routes))
}

/**
 * 合并路由元数据
 * 合并父子路由的元数据
 * @param parent - 父路由的元数据
 * @param child - 子路由的元数据
 * @returns 合并后的元数据对象
 */
const mergeRouteMeta = (parent: RouteMeta = {}, child: RouteMeta = {}) => {
  return {
    ...parent,
    ...child,
  }
}
