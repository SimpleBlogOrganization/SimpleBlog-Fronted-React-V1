import {
  forwardRef,
  useImperativeHandle,
  useState,
  useRef,
  useEffect,
} from 'react'
import type { LoadingState, LoadingRef } from './type'
import './index.scss'

/**
 * Loading 组件
 * 提供全屏 loading 遮罩，支持进入/退出动画和状态管理
 */
const Loading = forwardRef<LoadingRef>((_, ref) => {
  const [state, setState] = useState<LoadingState>('idle')
  const containerRef = useRef<HTMLDivElement>(null)
  const stateChangeCallbackRef = useRef<((state: LoadingState) => void) | null>(
    null
  )
  const nextCallbackRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleTransitionEnd = (e: TransitionEvent) => {
      if (e.target !== container || e.propertyName !== 'transform') return

      setState((prev) => {
        if (prev === 'entering') return 'active'
        if (prev === 'exiting') return 'idle'
        return prev
      })
    }

    container.addEventListener('transitionend', handleTransitionEnd)
    return () => {
      container.removeEventListener('transitionend', handleTransitionEnd)
    }
  }, [])

  useEffect(() => {
    stateChangeCallbackRef.current?.(state)

    if (state === 'active' && nextCallbackRef.current) {
      nextCallbackRef.current()
      nextCallbackRef.current = null
    }
  }, [state])

  useImperativeHandle(
    ref,
    () => ({
      in: (next, onStateChange) => {
        stateChangeCallbackRef.current = onStateChange || null
        nextCallbackRef.current = next || null
        setState('entering')
      },
      out: (onStateChange) => {
        stateChangeCallbackRef.current = onStateChange || null
        setState('exiting')
      },
      getState: () => state,
    }),
    [state]
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
export type { LoadingState, LoadingRef } from './type'
