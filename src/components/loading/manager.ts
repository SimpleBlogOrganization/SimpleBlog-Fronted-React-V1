import type { LoadingRef } from './index'

/**
 * 全局 Loading 管理器
 * 用于在路由守卫中控制 loading 状态
 */
class LoadingManager {
  private loadingRef: LoadingRef | null = null

  /**
   * 设置 loading 引用
   * @param ref - Loading 组件引用
   */
  setRef(ref: LoadingRef | null) {
    this.loadingRef = ref
  }

  /**
   * 显示 loading 并等待进入 active 状态
   * @param next - 在 active 状态时执行的回调
   * @returns Promise，在 active 状态时 resolve
   */
  async show(next?: () => void): Promise<void> {
    if (!this.loadingRef) {
      next?.()
      return
    }

    return new Promise((resolve) => {
      let resolved = false
      const doResolve = () => {
        if (!resolved) {
          resolved = true
          next?.()
          resolve()
        }
      }

      this.loadingRef?.in(doResolve, (state) => {
        if (state === 'active') {
          doResolve()
        }
      })
    })
  }

  /**
   * 隐藏 loading
   */
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
