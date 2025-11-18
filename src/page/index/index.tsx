import { useRef } from 'react'
import { useApp } from '@/contexts/AppContext'

import FluidReveal, { type FluidRevealRef } from '@/components/FluidReveal'
import './index.scss'
import useIndexData from '@/hooks/useIndexData'

/**
 * 首页组件
 */
const Index = () => {
  const { setMode } = useApp()
  const { topImage, bottomImage } = useIndexData()
  const fluidRevealRef = useRef<FluidRevealRef>(null)

  const handleReverse = () => {
    fluidRevealRef.current?.reverse()
  }

  return (
    <>
      {/* 装饰层 - FluidReveal */}
      <div className="index-page__decoration">
        <div className="fluid-reveal-container">
          <div className="round-one"></div>
          <div className="round-two"></div>
          <FluidReveal
            ref={fluidRevealRef}
            topImage={topImage}
            bottomImage={bottomImage}
          />
        </div>
      </div>
      {/* 内容层 - 主题切换 */}
      <div className="index-page__content">
        <div className="index-page__theme-switcher">
          {[
            { value: 'light', label: '🌞 浅色' },
            { value: 'dark', label: '🌙 深色' },
          ].map((item) => (
            <button
              key={item.value}
              className="index-page__button"
              onClick={() => {
                setMode(item.value as 'light' | 'dark')
              }}
            >
              {item.label}
            </button>
          ))}
          <button className="index-page__button" onClick={handleReverse}>
            🔄 切换图片
          </button>
        </div>
      </div>
    </>
  )
}

export default Index
