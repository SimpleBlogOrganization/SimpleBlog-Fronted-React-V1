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
   * @param next - 在进入 active 状态时执行的回调
   * @param onStateChange - 可选，状态变化时的回调（用于调试或扩展）
   */
  in: (next?: () => void, onStateChange?: (state: LoadingState) => void) => void
  /**
   * 隐藏 loading 并开始退出动画
   * @param onStateChange - 可选，状态变化时的回调（用于调试或扩展）
   */
  out: (onStateChange?: (state: LoadingState) => void) => void
  /**
   * 获取当前 loading 状态
   */
  getState: () => LoadingState
}
