import type { LoadingRef } from './type'

/**
 * 全局 Loading 管理器
 * 用于在路由守卫中控制 loading 状态
 */
class LoadingManager {
  private loadingRef: LoadingRef | null = null

  setRef(ref: LoadingRef | null) {
    this.loadingRef = ref
  }

  /**
   * 显示 loading 并等待进入 active 状态
   * @param next - 在 active 状态时执行的回调
   */
  async show(next?: () => void): Promise<void> {
    if (!this.loadingRef) {
      next?.()
      return
    }

    return new Promise((resolve) => {
      const doResolve = () => {
        next?.()
        resolve()
      }

      this.loadingRef?.in(doResolve)
    })
  }

  hide() {
    this.loadingRef?.out()
  }

  /**
   * 检查页面加载状态并隐藏 loading
   */
  checkAndHide() {
    const checkInterval = setInterval(() => {
      if (document.readyState === 'complete') {
        clearInterval(checkInterval)
        this.hide()
      }
    }, 300)
  }
}

export const loadingManager = new LoadingManager()
