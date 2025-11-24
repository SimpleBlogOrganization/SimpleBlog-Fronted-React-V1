/**
 * Loading 组件引用接口
 */
export interface LoadingRef {
  /**
   * 显示 loading 并开始进入动画
   * @param next - 在进入动画完成时执行的回调
   */
  in: (next?: () => void) => void
  /**
   * 隐藏 loading 并开始退出动画
   */
  out: () => void
}
