import { useEffect, useRef, useState } from 'react'
import { useApp } from '@/contexts/AppContext'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

import FluidReveal, { type FluidRevealRef } from '@/components/FluidReveal'
import { splitText } from '@/utils/SplitText'
import './index.scss'
import useIndexData from '@/hooks/useIndexData'

/**
 * 首页组件
 */
const Index = () => {
  const { mode } = useApp()
  const { topImage, bottomImage } = useIndexData()
  const fluidRevealRef = useRef<FluidRevealRef>(null)
  const rightDecorationRef = useRef<HTMLDivElement>(null)
  const roundOneRef = useRef<HTMLDivElement>(null)
  const roundTwoRef = useRef<HTMLDivElement>(null)
  const leftDecorationRef = useRef<HTMLDivElement>(null)
  const mainTitleSolidRef = useRef<HTMLSpanElement>(null)
  const mainTitleOutlineRef = useRef<HTMLSpanElement>(null)
  const subtitleLine1Ref = useRef<HTMLDivElement>(null)
  const subtitleLine2Ref = useRef<HTMLDivElement>(null)
  const pointerRef = useRef<HTMLDivElement>(null)
  const prevModeRef = useRef(mode)
  const [fontsLoaded, setFontsLoaded] = useState(false)

  // 等待字体加载完成
  useEffect(() => {
    if (document.fonts.status === 'loaded') {
      setFontsLoaded(true)
    } else {
      document.fonts.ready.then(() => {
        setFontsLoaded(true)
      })
    }
  }, [])

  // 主题切换时触发图片切换动画
  useEffect(() => {
    if (prevModeRef.current !== mode) {
      fluidRevealRef.current?.reverse()
      prevModeRef.current = mode
    }
  }, [mode])

  // 首页动画编排
  useGSAP(
    () => {
      if (
        !fontsLoaded ||
        !rightDecorationRef.current ||
        !roundOneRef.current ||
        !roundTwoRef.current ||
        !leftDecorationRef.current ||
        !mainTitleSolidRef.current ||
        !mainTitleOutlineRef.current ||
        !subtitleLine1Ref.current ||
        !subtitleLine2Ref.current ||
        !pointerRef.current
      )
        return

      const mainTl = gsap.timeline({ delay: 0.9 }) // 在 Tablebar 动画进行到 0.9s 时开始

      // 子时间线1：左侧标题（91 + Blog）
      const leftTitleTl = gsap.timeline()
      const solidSplit = splitText({
        element: mainTitleSolidRef.current,
        type: 'chars',
      })
      if (solidSplit) {
        gsap.set(mainTitleSolidRef.current, { opacity: 1 })
        leftTitleTl.from(solidSplit.chars, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.08,
          ease: 'power3.out',
        })
      }

      const outlineSplit = splitText({
        element: mainTitleOutlineRef.current,
        type: 'chars',
      })
      if (outlineSplit) {
        gsap.set(mainTitleOutlineRef.current, { opacity: 1 })
        leftTitleTl.from(
          outlineSplit.chars,
          {
            y: 40,
            opacity: 0,
            duration: 0.8,
            stagger: 0.08,
            ease: 'power3.out',
          },
          '-=0.4'
        )
      }

      // 子时间线2：右侧装饰层 + 圆形装饰
      const rightDecorationTl = gsap.timeline()
      rightDecorationTl.fromTo(
        rightDecorationRef.current,
        { x: 30, opacity: 0 },
        { x: 0, opacity: 1, duration: 1, ease: 'power2.out' }
      )
      // 圆形装饰在右侧装饰层完成后立即开始
      rightDecorationTl.from(roundOneRef.current, {
        scale: 0,
        opacity: 0,
        duration: 0.6,
        ease: 'back.out(1.7)',
      })
      rightDecorationTl.from(
        roundTwoRef.current,
        { scale: 0, opacity: 0, duration: 0.6, ease: 'back.out(1.7)' },
        '-=0.3'
      )

      // 子时间线3：subtitle
      const subtitleTl = gsap.timeline()
      const line1Split = splitText({
        element: subtitleLine1Ref.current,
        type: 'chars',
      })
      if (line1Split) {
        gsap.set(subtitleLine1Ref.current, { opacity: 1 })
        subtitleTl.from(line1Split.chars, {
          y: 30,
          opacity: 0,
          duration: 0.6,
          stagger: 0.06,
          ease: 'power2.out',
        })
      }

      const line2Split = splitText({
        element: subtitleLine2Ref.current,
        type: 'chars',
      })
      if (line2Split) {
        gsap.set(subtitleLine2Ref.current, { opacity: 1 })
        subtitleTl.from(
          line2Split.chars,
          {
            y: 30,
            opacity: 0,
            duration: 0.6,
            stagger: 0.06,
            ease: 'power2.out',
          },
          '-=0.2'
        )
      }

      // 将子时间线添加到主时间线
      mainTl.add(leftTitleTl) // 先执行左侧标题
      mainTl.add(rightDecorationTl, '>') // 在左侧标题完成后，右侧装饰层开始
      mainTl.add(subtitleTl, '<') // 与右侧装饰层同时开始

      // 指针出现（最后）
      mainTl.fromTo(
        pointerRef.current,
        {
          y: 20,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'back.out(1.7)',
        },
        '-=0.2'
      )

      return () => {
        solidSplit?.revert()
        outlineSplit?.revert()
        line1Split?.revert()
        line2Split?.revert()
      }
    },
    { dependencies: [fontsLoaded] }
  )

  return (
    <>
      <div className="index-page">
        {/* 右侧 - 装饰层 - FluidReveal */}
        <div ref={rightDecorationRef} className="fluid-reveal-container">
          <FluidReveal
            ref={fluidRevealRef}
            topImage={topImage}
            bottomImage={bottomImage}
          />
          <div ref={roundOneRef} className="round-one"></div>
          <div ref={roundTwoRef} className="round-two"></div>
        </div>
        {/* 左侧 - 装饰层 */}
        <div ref={leftDecorationRef} className="index-page__decoration-left">
          <div className="main-title">
            <span ref={mainTitleSolidRef} className="main-title__solid">
              91
            </span>
            <span ref={mainTitleOutlineRef} className="main-title__outline">
              Blog
            </span>
          </div>
          <div className="subtitle">
            <div ref={subtitleLine1Ref} className="subtitle__line">
              xxxxx
            </div>
            <div ref={subtitleLine2Ref} className="subtitle__line">
              xxxxxxxxxxxxxxxx
            </div>
            <div ref={pointerRef} className="subtitle__pointer">
              <div className="pointer">☟</div>
            </div>
          </div>
        </div>
      </div>
      {/* 测试内容层 */}
      {Array.from({ length: 200 }).map((_item, i) => (
        <div key={i}>
          <div>测试{i}</div>
          <div>测试{i}</div>
        </div>
      ))}
    </>
  )
}

export default Index
