import type { RouteObject, Location, Params } from 'react-router-dom'

/**
 * 路由元数据类型定义
 */
export interface RouteMeta {
  /**
   * 页面标题
   */
  title?: string

  /**
   * 扩展字段
   */
  [key: string]: unknown
}

declare module 'react-router' {
  export interface Handle {
    /**
     * 路由元数据
     */
    meta?: RouteMeta
  }
}

/**
 * 增强的路由类型
 */
export type EnhancedRoute = RouteObject & {
  /**
   * 路由元数据
   */
  meta?: RouteMeta

  /**
   * 重定向地址
   */
  redirect?: string

  /**
   * 子路由
   */
  children?: EnhancedRoute[]
}

/**
 * 守卫上下文
 */
export type GuardContext = {
  /**
   * 目标路由
   */
  to: Location

  /**
   * 来源路由
   */
  from: Location | null

  /**
   * 路由参数
   */
  params: Params

  /**
   * 路由元数据
   */
  meta: RouteMeta

  /**
   * 重定向地址
   */
  redirect?: string | null
}

/**
 * 路由守卫接口
 */
export interface RouterGuard {
  /**
   * 前置守卫
   */
  beforeEach?: (ctx: GuardContext) => Response | void | Promise<Response | void>

  /**
   * 后置守卫
   */
  afterEach?: (to: Location, from: Location | null) => void
}
