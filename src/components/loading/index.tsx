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
 */
export interface LoadingRef {
  /**
   * 显示 loading 并开始进入动画
   * @param next - 可选的回调函数，在进入 active 状态时执行
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
   */
  getState: () => LoadingState
}

/**
 * Loading 组件
 * 提供全屏 loading 遮罩，支持进入/退出动画和状态管理
 */
const Loading = forwardRef<LoadingRef>((_, ref) => {
  const [state, setState] = useState<LoadingState>('idle')
  const containerRef = useRef<HTMLDivElement>(null)
  const stateRef = useRef<LoadingState>('idle')
  const stateChangeCallbackRef = useRef<((state: LoadingState) => void) | null>(
    null
  )
  const nextCallbackRef = useRef<(() => void) | null>(null)

  const notifyStateChange = useCallback((newState: LoadingState) => {
    stateRef.current = newState
    setState(newState)
    stateChangeCallbackRef.current?.(newState)

    if (newState === 'active' && nextCallbackRef.current) {
      nextCallbackRef.current()
      nextCallbackRef.current = null
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleTransitionEnd = (e: TransitionEvent) => {
      if (e.target !== container || e.propertyName !== 'transform') return

      const currentState = stateRef.current
      if (currentState === 'entering') {
        notifyStateChange('active')
      } else if (currentState === 'exiting') {
        notifyStateChange('idle')
      }
    }

    container.addEventListener('transitionend', handleTransitionEnd)
    return () => {
      container.removeEventListener('transitionend', handleTransitionEnd)
    }
  }, [notifyStateChange])

  useImperativeHandle(
    ref,
    () => ({
      in: (next, onStateChange) => {
        stateChangeCallbackRef.current = onStateChange || null
        nextCallbackRef.current = next || null
        notifyStateChange('entering')
      },
      out: (onStateChange) => {
        stateChangeCallbackRef.current = onStateChange || null
        notifyStateChange('exiting')
      },
      getState: () => stateRef.current,
    }),
    [notifyStateChange]
  )

  const isOut = state === 'idle' || state === 'exiting'

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
