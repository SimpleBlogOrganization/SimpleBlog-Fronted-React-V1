/**
 * SplitText 分割选项
 */
export interface SplitTextOptions {
  /** 要分割的 DOM 元素 */
  element: HTMLElement
  /** 分割类型，默认 'chars' */
  type?: 'chars' | 'words' | 'lines' | 'words, chars'
}

/**
 * SplitText 分割结果
 */
export interface SplitTextResult {
  /** 分割后的字符元素数组 */
  chars: Element[]
  /** 分割后的词元素数组 */
  words: Element[]
  /** 分割后的行元素数组 */
  lines: Element[]
  /** 恢复原始文本的方法 */
  revert: () => void
}
