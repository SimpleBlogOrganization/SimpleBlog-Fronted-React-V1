import { Outlet } from 'react-router-dom'
import React from 'react'

/**
 * 布局组件
 * 提供路由出口和加载状态
 * @returns 包含 Suspense 和 Outlet 的布局组件
 * @example
 * ```typescript
 * <Layout />
 * ```
 */
const Layout = () => {
  return (
    <React.Suspense fallback={null}>
      <Outlet />
    </React.Suspense>
  )
}

export default Layout
