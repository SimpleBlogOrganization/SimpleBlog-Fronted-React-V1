import type { EnhancedRoute } from '@/types/router'
import Layout from './Layout'
import NotFound from '@/page/404'

import { lazy } from 'react'

const Index = lazy(() => import('@/page/index'))
const Home = lazy(() => import('@/page/home'))
const Login = lazy(() => import('@/page/login'))

/**
 * 路由配置
 * 定义应用的所有路由及其元数据
 */
export const routes: EnhancedRoute[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Index />,
        meta: {
          title: '首页',
        },
      },
      {
        path: 'home',
        element: <Home />,
        meta: {
          title: '用户中心',
        },
      },
      {
        path: 'login',
        element: <Login />,
        meta: {
          title: '登录',
        },
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]
