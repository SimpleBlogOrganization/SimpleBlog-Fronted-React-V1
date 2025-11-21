# SplitText 文字分割工具函数

基于 GSAP SplitText 的文字分割工具函数，用于将文本元素分割成字符、词或行，便于进行 GSAP 动画。

## 基础用法

```tsx
import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { splitText } from '@/components/SplitText'

function App() {
  const textRef = useRef<HTMLSpanElement>(null)

  useGSAP(() => {
    if (!textRef.current) return

    const result = splitText({
      element: textRef.current,
      type: 'chars',
    })

    if (result) {
      gsap.from(result.chars, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: 'power3.out',
      })
    }

    return () => result?.revert()
  }, [])

  return <span ref={textRef}>Hello, GSAP!</span>
}
```

## 分割类型

```tsx
// 按字符分割
splitText({ element: el, type: 'chars' }) // result.chars

// 按词分割
splitText({ element: el, type: 'words' }) // result.words

// 按行分割
splitText({ element: el, type: 'lines' }) // result.lines

// 组合分割
splitText({ element: el, type: 'words, chars' }) // result.words + result.chars
```

## 在时间线中使用

```tsx
useGSAP(() => {
  const tl = gsap.timeline()

  const titleSplit = splitText({ element: titleRef.current, type: 'chars' })
  if (titleSplit) {
    tl.from(titleSplit.chars, { y: 40, opacity: 0, stagger: 0.08 })
  }

  const subtitleSplit = splitText({
    element: subtitleRef.current,
    type: 'words',
  })
  if (subtitleSplit) {
    tl.from(subtitleSplit.words, { y: 30, opacity: 0, stagger: 0.1 }, '-=0.4')
  }

  return () => {
    titleSplit?.revert()
    subtitleSplit?.revert()
  }
}, [])
```

## API

### `splitText(options: SplitTextOptions): SplitTextResult | null`

| 参数      | 类型                                              | 必填 | 默认值    | 说明              |
| --------- | ------------------------------------------------- | ---- | --------- | ----------------- |
| `element` | `HTMLElement`                                     | 是   | -         | 要分割的 DOM 元素 |
| `type`    | `'chars' \| 'words' \| 'lines' \| 'words, chars'` | 否   | `'chars'` | 分割类型          |

**返回值：**

```typescript
interface SplitTextResult {
  chars: Element[] // 字符元素数组
  words: Element[] // 词元素数组
  lines: Element[] // 行元素数组
  revert: () => void // 恢复原始文本
}
```

## 注意事项

- 需要安装 `gsap` 和 `gsap/SplitText` 插件
- 函数会自动清理元素上之前的 SplitText 实例
- 使用完毕后建议调用 `revert()` 方法，特别是在组件卸载时
- 建议在字体加载完成后再执行分割
- 函数可能返回 `null`，使用前需要检查返回值
