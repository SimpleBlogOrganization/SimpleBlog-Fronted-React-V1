import {
  forwardRef,
  useImperativeHandle,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react'
import './index.scss'

/**
 * Loading 组件状态类型
 * - idle: 初始/完全隐藏状态
 * - entering: 动画开始（从下方滑入中）
 * - active: 动画执行中（完全显示，等待中）
 * - exiting: 动画结束（滑出中）
 */
export type LoadingState = 'idle' | 'entering' | 'active' | 'exiting'

/**
 * Loading 组件引用接口
 * 提供控制 loading 显示/隐藏和状态查询的方法
 */
export interface LoadingRef {
  /**
   * 显示 loading 并开始进入动画
   * @param next - 可选的回调函数，在进入 active 状态时执行（通常用于路由跳转）
   * @param onStateChange - 可选的状态变化回调函数
   */
  in: (next?: () => void, onStateChange?: (state: LoadingState) => void) => void
  /**
   * 隐藏 loading 并开始退出动画
   * @param onStateChange - 可选的状态变化回调函数
   */
  out: (onStateChange?: (state: LoadingState) => void) => void
  /**
   * 获取当前 loading 状态
   * @returns 当前状态
   */
  getState: () => LoadingState
}

/**
 * Loading 组件
 * 提供全屏 loading 遮罩，支持进入/退出动画和状态管理
 */
const Loading = forwardRef<LoadingRef>((_, ref) => {
  const [state, setState] = useState<LoadingState>('idle') // 当前状态
  const containerRef = useRef<HTMLDivElement>(null) // 容器引用
  const stateRef = useRef<LoadingState>('idle') // 状态引用
  const stateChangeCallbackRef = useRef<((state: LoadingState) => void) | null>(
    null
  ) // 状态变化回调引用
  const nextCallbackRef = useRef<(() => void) | null>(null) // 下一个回调引用

  /**
   * 通知状态变化
   * @param newState - 新状态
   */
  const notifyStateChange = useCallback((newState: LoadingState) => {
    stateRef.current = newState
    setState(newState)
    stateChangeCallbackRef.current?.(newState)

    // 当进入 active 状态时，执行 next 回调
    if (newState === 'active' && nextCallbackRef.current) {
      nextCallbackRef.current() // 执行下一个回调
      nextCallbackRef.current = null // 清空下一个回调引用
    }
  }, [])

  /**
   * 处理过渡动画结束事件
   */
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleTransitionEnd = (e: TransitionEvent) => {
      // 如果不是容器或不是 transform 属性，则返回
      if (e.target !== container || e.propertyName !== 'transform') return

      const currentState = stateRef.current // 当前状态
      if (currentState === 'entering') {
        notifyStateChange('active')
      } else if (currentState === 'exiting') {
        notifyStateChange('idle')
      }
    }

    container.addEventListener('transitionend', handleTransitionEnd) // 添加过渡结束事件监听
    return () => {
      container.removeEventListener('transitionend', handleTransitionEnd) // 移除过渡结束事件监听
    }
  }, [notifyStateChange])

  /**
   * 暴露给外部使用的方法
   * @returns LoadingRef
   */
  useImperativeHandle(
    ref,
    () => ({
      in: (next, onStateChange) => {
        stateChangeCallbackRef.current = onStateChange || null // 状态变化回调引用
        nextCallbackRef.current = next || null // 下一个回调引用
        notifyStateChange('entering') // 通知状态变化为 entering
      },
      out: (onStateChange) => {
        stateChangeCallbackRef.current = onStateChange || null // 状态变化回调引用
        notifyStateChange('exiting') // 通知状态变化为 exiting
      },
      getState: () => stateRef.current, // 获取当前状态
    }),
    [notifyStateChange]
  )

  const isOut = state === 'idle' || state === 'exiting' // 是否退出

  return (
    <div ref={containerRef} id="loading" className={isOut ? 'loading_out' : ''}>
      <svg viewBox="0 0 50 50">
        <circle r="25" cx="25" cy="25"></circle>
      </svg>
      <p>LOADING</p>
    </div>
  )
})

Loading.displayName = 'Loading'

export default Loading
