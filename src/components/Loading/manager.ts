import type { LoadingRef } from './type'

/**
 * 全局 Loading 管理器
 * 用于在路由守卫中控制 loading 状态
 */
class LoadingManager {
  private loadingRef: LoadingRef | null = null
  private loadHandler: (() => void) | null = null
  private loadTimeout: number | null = null

  setRef(ref: LoadingRef | null) {
    this.loadingRef = ref
  }

  /**
   * 显示 loading 并等待进入动画完成
   * @param next - 在进入动画完成时执行的回调
   */
  async show(next?: () => void): Promise<void> {
    if (!this.loadingRef) {
      next?.()
      return
    }

    return new Promise((resolve) => {
      this.loadingRef?.in(() => {
        next?.()
        resolve()
      })
    })
  }

  /**
   * 隐藏 Loading 并开始退出动画
   */
  hide() {
    this.loadingRef?.out()
  }

  /**
   * - 如果页面已经加载完成，则直接隐藏 Loading
   * - 如果页面没有加载完成，则监听页面加载完成事件
   * - 如果页面加载超时，则隐藏 Loading
   */
  checkAndHide() {
    // 如果页面已经加载完成，则直接隐藏 Loading
    if (document.readyState === 'complete') {
      this.hide()
      return
    }

    /**
     * 如果已经监听了页面加载完成事件，则移除事件监听
     * 如果已经设置了加载超时，则清除超时定时器
     */
    if (this.loadHandler) {
      window.removeEventListener('load', this.loadHandler)
      if (this.loadTimeout) clearTimeout(this.loadTimeout)
    }

    // 如果页面没有加载完成，则监听页面加载完成事件
    this.loadHandler = () => {
      this.cleanup()
      this.hide()
    }

    window.addEventListener('load', this.loadHandler)
    this.loadTimeout = setTimeout(() => {
      this.cleanup()
      this.hide()
    }, 10000)
  }

  private cleanup() {
    if (this.loadHandler) {
      // 移除页面加载完成事件监听
      window.removeEventListener('load', this.loadHandler)
      this.loadHandler = null
    }
    if (this.loadTimeout) {
      // 清除加载超时定时器
      clearTimeout(this.loadTimeout)
      this.loadTimeout = null
    }
  }
}

export const loadingManager = new LoadingManager()
