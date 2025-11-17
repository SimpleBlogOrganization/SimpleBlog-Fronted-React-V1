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
import { loadingManager } from '@/components/Loading/manager'

/**
 * 路由增强器
 * 负责路由增强、Loading 动画控制、守卫调用
 */

let currentPathname: string = ''

/**
 * 创建路由增强器
 * 为路由注入 loader，处理 Loading 动画和守卫调用
 */
export const createEnhancedRouter = (
  routes: EnhancedRoute[],
  guard?: RouterGuard
) => {
  let previousLocation: Location | null = null

  const enhanceRoutes = (
    routes: EnhancedRoute[],
    parentMeta: RouteMeta = {}
  ): RouteObject[] => {
    const items = routes.map((route) => {
      // 合并路由元数据
      const currentMeta = { ...parentMeta, ...route.meta }

      const enhancedLoader: RouteObject['loader'] = async (args) => {
        const targetUrl = new URL(args.request.url)

        if (targetUrl.pathname === currentPathname) {
          return (route.loader as LoaderFunction)?.(args)
        }
        currentPathname = targetUrl.pathname

        const context: GuardContext = {
          to: {
            pathname: targetUrl.pathname,
            search: targetUrl.search,
            hash: targetUrl.hash,
            state: null,
            key: Date.now().toString(36),
          },
          from: previousLocation ?? null,
          params: args.params,
          meta: { title: 'Untitled', ...currentMeta },
          redirect: route.redirect,
        }

        // 如果存在重定向，并且重定向地址不等于当前地址，导到重定向地址
        if (route.redirect && route.redirect !== targetUrl.pathname) {
          return redirect(route.redirect)
        }

        try {
          // 先执行守卫检查，如果会重定向则不显示 Loading
          if (guard?.beforeEach) {
            const result = await guard.beforeEach(context)

            if (result instanceof Response) {
              return result
            }
          }

          await loadingManager.show()

          previousLocation = context.to
          const loaderResult = await (route.loader as LoaderFunction)?.(args)

          loadingManager.checkAndHide()

          return loaderResult
        } catch (error) {
          console.error('Route Loader Error:', error)
          loadingManager.hide()
          return redirect('/404')
        }
      }

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
