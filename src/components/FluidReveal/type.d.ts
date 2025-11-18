export interface FluidRevealProps {
  /** 顶部图片 URL（默认显示的图片） */
  topImage: string
  /** 底部图片 URL（鼠标滑过时显示的图片） */
  bottomImage: string
  /** 流体模拟分辨率，默认 500 */
  resolution?: number
  /** 衰减系数，默认 0.97 */
  decay?: number
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: React.CSSProperties
}

export interface FluidRevealRef {
  /** 反转图片（使用自动流体效果平滑过渡） */
  reverse: () => void
}
