import type { RouteObject, Location, Params } from 'react-router-dom'

/**
 * 路由元数据类型定义
 */
export interface RouteMeta {
  /**
   * 页面标题
   */
  title?: string
  [key: string]: unknown
}

declare module 'react-router' {
  export interface Handle {
    meta?: RouteMeta
  }
}

/**
 * 增强的路由类型
 */
export type EnhancedRoute = RouteObject & {
  meta?: RouteMeta
  redirect?: string
  children?: EnhancedRoute[]
}

/**
 * 守卫上下文
 */
export type GuardContext = {
  to: Location
  from: Location | null
  params: Params
  meta: RouteMeta
  redirect?: string | null
}

/**
 * 路由守卫接口
 */
export interface RouterGuard {
  beforeEach?: (ctx: GuardContext) => Response | void | Promise<Response | void>
  afterEach?: (to: Location, from: Location | null) => void
}
