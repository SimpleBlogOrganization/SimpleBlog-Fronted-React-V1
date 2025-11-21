import { Outlet } from 'react-router-dom'
import React from 'react'
import Tablebar from '@/components/Tablebar'
import './Layout.scss'

/**
 * 布局组件
 * 提供路由出口和加载状态
 */
const Layout = () => {
  return (
    <>
      <Tablebar />
      <div className="layout-content">
        <React.Suspense fallback={null}>
          <Outlet />
        </React.Suspense>
      </div>
    </>
  )
}

export default Layout
