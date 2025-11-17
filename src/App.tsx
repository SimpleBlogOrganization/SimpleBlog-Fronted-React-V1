import { RouterProvider } from 'react-router-dom'
import { AppProvider } from './contexts/AppContext'
import { router } from './router'
// import Loading, { type LoadingRef } from './components/Loading'
// import { loadingManager } from './components/Loading/manager'
// import { useRef, useEffect } from 'react'
import './global'

/**
 * Loading 容器组件
 * 注册 loading 引用到全局管理器，并处理初始页面加载
 */
// const LoadingContainer = () => {
//   const loadingRef = useRef<LoadingRef>(null)
//   const isInitialMountRef = useRef(true)

//   useEffect(() => {
//     loadingManager.setRef(loadingRef.current)

//     if (isInitialMountRef.current) {
//       isInitialMountRef.current = false
//       loadingManager.checkAndHide()
//     }

//     return () => {
//       loadingManager.setRef(null)
//     }
//   }, [])

//   return <Loading ref={loadingRef} />
// }

/**
 * 应用根组件
 */
const App = () => {
  return (
    <AppProvider>
      {/* <LoadingContainer /> */}
      <RouterProvider router={router} />
    </AppProvider>
  )
}

export default App
