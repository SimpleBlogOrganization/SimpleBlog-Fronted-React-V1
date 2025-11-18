# FluidReveal 流体揭示效果组件

基于 Three.js 和 WebGL 的流体揭示效果组件，支持鼠标/触摸交互和图片反转功能。

## 功能特性

- 🎨 流畅的流体揭示效果
- 🖱️ 支持鼠标和触摸交互
- 🔄 图片反转功能（圆形爆炸扩散）
- 🖼️ 支持两张图片的平滑切换
- ⚡ 高性能的 WebGL 渲染
- 🎯 智能检测完全清理状态

## 基础用法

```tsx
import FluidReveal from '@/components/FluidReveal'

function App() {
  return (
    <FluidReveal
      topImage="/imgs/top.jpg"
      bottomImage="/imgs/bottom.jpg"
      resolution={500}
      decay={0.97}
      style={{ width: '100vw', height: '100vh' }}
    />
  )
}
```

## 图片反转功能

通过 `ref` 可以获取组件实例，调用反转方法：

```tsx
import { useRef } from 'react'
import FluidReveal, { type FluidRevealRef } from '@/components/FluidReveal'

function App() {
  const fluidRevealRef = useRef<FluidRevealRef>(null)

  const handleReverse = () => {
    // 触发图片反转（使用圆形爆炸扩散效果）
    fluidRevealRef.current?.reverse()
  }

  return (
    <div>
      <button onClick={handleReverse}>反转图片</button>

      <FluidReveal
        ref={fluidRevealRef}
        topImage="/imgs/top.jpg"
        bottomImage="/imgs/bottom.jpg"
        style={{ width: '100vw', height: '100vh' }}
      />
    </div>
  )
}
```

## 工作原理

### 正常交互模式

- 鼠标/触摸移动时，在轨迹上绘制流体效果
- 流体值逐渐衰减，形成自然的消失效果
- 通过流体值混合两张图片，实现平滑的揭示效果

### 反转模式

1. **圆形爆炸扩散**：从中心点开始，圆形逐渐扩大覆盖整个 canvas
2. **智能检测**：自动检测是否完全清理 top 图片
3. **无感交换**：完全清理后，在视觉无变化的情况下交换图片
4. **平滑过渡**：交换后，新的 top 图片逐渐消失，显示新的 bottom 图片

## API

### Props

| 属性          | 类型                   | 默认值 | 说明                             |
| ------------- | ---------------------- | ------ | -------------------------------- |
| `topImage`    | `string`               | -      | 顶部图片 URL（默认显示的图片）   |
| `bottomImage` | `string`               | -      | 底部图片 URL（揭示时显示的图片） |
| `resolution`  | `number`               | `500`  | 流体模拟分辨率                   |
| `decay`       | `number`               | `0.97` | 衰减系数（0-1，值越大衰减越慢）  |
| `className`   | `string`               | `''`   | 自定义类名                       |
| `style`       | `React.CSSProperties?` | -      | 自定义样式                       |

### Ref 方法

| 方法      | 参数 | 说明                                                           |
| --------- | ---- | -------------------------------------------------------------- |
| `reverse` | -    | 反转图片（使用圆形爆炸扩散效果平滑过渡，自动检测完全清理状态） |

## 技术细节

### 流体模拟

- 使用 ping-pong 渲染目标实现双缓冲
- 每帧根据鼠标轨迹更新流体值
- 支持自定义衰减系数控制消失速度

### 图片混合

- 使用 Premultiplied Alpha 混合，避免透明像素污染
- 支持图片的 cover 模式适配
- 自动处理超大图片（限制最大 4096px）

### 反转机制

- 圆形爆炸扩散：从中心点 (0.5, 0.5) 开始，半径逐渐增大
- 使用 cubic ease-out 缓动函数，让扩散更自然
- 反转过程中禁用衰减（decay = 1），确保已揭示区域不恢复
- 智能检测：每 200ms 检测一次，确保完全清理后才交换

## 注意事项

1. 组件需要 Three.js 依赖，确保已安装 `three` 包
2. 图片建议使用高质量图片以获得最佳效果
3. 分辨率越高，性能消耗越大，建议根据设备性能调整（默认 500）
4. 衰减系数建议在 0.95-0.99 之间，值越大效果持续时间越长
5. 反转功能会自动检测完全清理状态，无需手动控制
6. 组件会自动处理图片尺寸，超大图片会被自动缩放

## 性能优化

- 使用 FloatType 渲染目标，保证精度
- 自动限制图片最大尺寸为 4096px
- 智能检测完全清理状态，减少不必要的计算
- 使用 ResizeObserver 优化尺寸更新
