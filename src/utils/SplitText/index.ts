import { gsap } from 'gsap'
import { SplitText as GSAPSplitText } from 'gsap/SplitText'
import type { SplitTextOptions, SplitTextResult } from './type'

gsap.registerPlugin(GSAPSplitText)

export type { SplitTextOptions, SplitTextResult }

/**
 * 分割文本并返回分割结果
 * @param options 分割选项
 * @returns 分割结果，包含 chars、words、lines 和 revert 方法
 */
export const splitText = (
  options: SplitTextOptions
): SplitTextResult | null => {
  const { element, type = 'chars' } = options

  if (!element) return null

  const el = element as HTMLElement & {
    _rbsplitInstance?: GSAPSplitText
  }

  // 清理之前的实例
  if (el._rbsplitInstance) {
    try {
      el._rbsplitInstance.revert()
    } catch {
      // 忽略 revert 错误
    }
    el._rbsplitInstance = undefined
  }

  const splitInstance = new GSAPSplitText(el, {
    type,
    smartWrap: false,
  })

  el._rbsplitInstance = splitInstance

  return {
    chars: splitInstance.chars || [],
    words: splitInstance.words || [],
    lines: splitInstance.lines || [],
    revert: () => {
      try {
        splitInstance.revert()
      } catch {
        // 忽略 revert 错误
      }
      el._rbsplitInstance = undefined
    },
  }
}
