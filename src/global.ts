import React from 'react'
import * as Router from 'react-router-dom'
import Request from '@/services/request'

/**
 * 全局扩展：在 React 命名空间上挂载路由和请求工具
 * 方便在组件中通过 React.Router 和 React.Http 访问
 */
React.Router = Router
React.Http = Request

export default {}
