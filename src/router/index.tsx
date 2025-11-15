import { createEnhancedRouter } from './enhancer'
import { createAuthGuard } from './guard'
import { routes } from './routes'

/**
 * 路由实例
 * 组装路由配置、守卫、Loading 动画等功能
 *
 * 架构说明：
 * - routes.tsx: 路由配置（纯配置）
 * - guard.ts: 权限守卫（认证、权限控制）
 * - enhancer.ts: 路由增强器（注入 loader、处理动画）
 * - index.tsx: 组装所有功能，导出最终的路由实例
 */
export const router = createEnhancedRouter(routes, createAuthGuard())
