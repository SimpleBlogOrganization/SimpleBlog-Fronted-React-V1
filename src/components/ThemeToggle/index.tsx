import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { useApp } from '@/contexts/AppContext'
import './index.scss'

// 注册 GSAP 插件
gsap.registerPlugin(MorphSVGPlugin, DrawSVGPlugin)

const sunPath =
  'M70 49.5C70 60.8218 60.8218 70 49.5 70C38.1782 70 29 60.8218 29 49.5C29 38.1782 38.1782 29 49.5 29C60 29 69.5 38 70 49.5Z'
const moonPath =
  'M70 49.5C70 60.8218 60.8218 70 49.5 70C38.1782 70 29 60.8218 29 49.5C29 38.1782 38.1782 29 49.5 29C39 45 49.5 59.5 70 49.5Z'

const rayPaths = [
  'M50 2V11',
  'M85 15L78 22',
  'M98 50H89',
  'M85 85L78 78',
  'M50 98V89',
  'M23 78L16 84',
  'M11 50H2',
  'M23 23L16 16',
]

// 光线动画函数 - 使用 DrawSVGPlugin
const animateRays = (
  tl: gsap.core.Timeline,
  rays: SVGPathElement[],
  isHide: boolean
) => {
  const totalRays = rays.length

  rays.forEach((ray, index) => {
    const staggerIndex = isHide ? totalRays - 1 - index : index

    // 使用 DrawSVGPlugin 实现路径绘制/擦除动画
    tl.to(
      ray,
      {
        drawSVG: isHide ? '0%' : '100%',
        opacity: isHide ? 0 : 1,
        scale: isHide ? 0 : 1,
        strokeOpacity: isHide ? 0 : 1,
        duration: 0.3,
        ease: 'power2.out',
      },
      staggerIndex * 0.05
    )
  })
}

const ThemeToggle: React.FC = () => {
  const { mode, setMode } = useApp()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const mainPathRef = useRef<SVGPathElement>(null)
  const raysGroupRef = useRef<SVGGElement>(null)
  const moonShineRef = useRef<SVGPathElement>(null)
  const animationRef = useRef<gsap.core.Timeline | null>(null)
  const isInitialMountRef = useRef(true)

  const isDark = mode === 'dark'

  // 初始化动画 - 只在首次挂载时设置初始状态，不触发动画
  useEffect(() => {
    if (!isInitialMountRef.current || !mainPathRef.current) return

    // 获取当前的 mode 值（首次挂载时的值）
    const currentIsDark = mode === 'dark'

    // 设置初始状态
    gsap.set(mainPathRef.current, {
      attr: { d: currentIsDark ? moonPath : sunPath },
      rotation: currentIsDark ? -360 : 0,
      scale: currentIsDark ? 2 : 1,
      fillOpacity: 0.35,
      strokeOpacity: 1,
      transformOrigin: 'center center',
    })

    // 设置光线初始状态
    if (raysGroupRef.current) {
      const rays = Array.from(raysGroupRef.current.children) as SVGPathElement[]
      rays.forEach((ray) => {
        gsap.set(ray, {
          drawSVG: currentIsDark ? '0%' : '100%',
          strokeOpacity: currentIsDark ? 0 : 1,
          opacity: currentIsDark ? 0 : 1,
          scale: currentIsDark ? 0 : 1,
        })
      })
    }

    // 设置月亮光晕初始状态
    if (moonShineRef.current) {
      gsap.set(moonShineRef.current, {
        opacity: 0,
        scale: 2.18,
        attr: { 'stroke-dasharray': '20, 1000', 'stroke-dashoffset': 0 },
        filter: 'blur(0px)',
        transformOrigin: 'center center',
      })
    }

    // 标记初始化完成
    isInitialMountRef.current = false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // 只在首次挂载时执行，使用初始 mode 值

  // 主题切换动画 - 使用更接近 motion 的 spring 缓动效果
  useEffect(() => {
    // 首次挂载时不触发动画
    if (isInitialMountRef.current) return

    if (!mainPathRef.current || !raysGroupRef.current || !moonShineRef.current)
      return

    // 清理之前的动画
    if (animationRef.current) {
      animationRef.current.kill()
    }

    const tl = gsap.timeline()
    animationRef.current = tl

    if (isDark) {
      // 切换到深色模式（月亮）
      // 1. 隐藏太阳光线 - 反向 stagger（从最后一个开始）
      const rays = Array.from(raysGroupRef.current.children) as SVGPathElement[]
      animateRays(tl, rays, true)

      // 2. 主路径 SVG morphing（使用 MorphSVGPlugin）和旋转 - 与光线消失同时开始
      tl.to(
        mainPathRef.current,
        {
          morphSVG: moonPath, // 使用 MorphSVGPlugin 实现平滑路径变形
          rotation: -360,
          scale: 2,
          duration: 1,
          ease: 'power2.inOut',
        },
        0 // 从时间线开始就执行，与光线消失同时进行
      )

      // 3. 月亮光晕动画 - opacity 和 strokeDashoffset 都是数组动画
      // opacity: [0, 1, 0], strokeDashoffset: [0, -50, -100], duration 0.75s, ease: linear
      tl.to(moonShineRef.current, {
        opacity: 1,
        attr: { 'stroke-dashoffset': -50 },
        filter: 'blur(2px)',
        duration: 0.375, // 0.75 / 2，到达中间值
        ease: 'none',
      }).to(moonShineRef.current, {
        opacity: 0,
        attr: { 'stroke-dashoffset': -100 },
        filter: 'blur(0px)',
        duration: 0.375, // 0.75 / 2，从中间值到结束
        ease: 'none',
      })
    } else {
      // 切换到浅色模式（太阳）
      // 1. 主路径 SVG morphing（使用 MorphSVGPlugin）和旋转
      tl.to(mainPathRef.current, {
        morphSVG: sunPath, // 使用 MorphSVGPlugin 实现平滑路径变形
        rotation: 0,
        scale: 1,
        duration: 1,
        ease: 'power2.inOut',
      })

      // 2. 显示太阳光线 - 正向 stagger
      const rays = Array.from(raysGroupRef.current.children) as SVGPathElement[]
      animateRays(tl, rays, false)

      // 3. 隐藏月亮光晕
      tl.set(
        moonShineRef.current,
        {
          opacity: 0,
          attr: { 'stroke-dashoffset': 0 },
          filter: 'blur(0px)',
        },
        '<'
      )
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.kill()
        animationRef.current = null
      }
    }
  }, [isDark])

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 0.9,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
      })
    }

    const { clientX, clientY } = e
    const newMode = isDark ? 'light' : 'dark'

    const transition = document.startViewTransition(() => {
      document.documentElement.setAttribute('data-mode', newMode)
      setMode(newMode)
    })

    transition.ready.then(() => {
      const radius = Math.hypot(
        Math.max(clientX, window.innerWidth - clientX),
        Math.max(clientY, window.innerHeight - clientY)
      )

      const clipPath = [
        `circle(0% at ${clientX}px ${clientY}px)`,
        `circle(${radius}px at ${clientX}px ${clientY}px)`,
      ]

      document.documentElement.animate(
        {
          clipPath: !isDark ? clipPath.reverse() : clipPath,
        },
        {
          duration: 500,
          easing: 'ease-in-out',
          fill: 'forwards',
          pseudoElement: !isDark
            ? '::view-transition-old(root)'
            : '::view-transition-new(root)',
        }
      )
    })
  }

  return (
    <button
      ref={buttonRef}
      onClick={handleToggle}
      className="theme-toggle"
      aria-label={isDark ? '切换到浅色主题' : '切换到深色主题'}
    >
      <svg
        strokeWidth="4"
        strokeLinecap="round"
        width={25}
        height={25}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="theme-toggle-svg"
        role="img"
        style={{
          overflow: 'visible',
        }}
      >
        {/* 月亮光晕 */}
        <path
          ref={moonShineRef}
          d={moonPath}
          className="theme-toggle-moon-shine"
          style={{
            stroke: 'var(--md-primary)',
            strokeWidth: 3,
          }}
        />

        {/* 太阳光线 */}
        <g
          ref={raysGroupRef}
          className="theme-toggle-rays"
          style={{
            stroke: 'var(--md-tertiary)',
            strokeWidth: 4,
            strokeLinecap: 'round',
          }}
        >
          {rayPaths.map((path, index) => (
            <path
              key={index}
              d={path}
              className="theme-toggle-ray-path"
              style={{
                transformOrigin: 'center',
              }}
            />
          ))}
        </g>

        {/* 主路径（太阳/月亮） */}
        <path
          ref={mainPathRef}
          d={isDark ? moonPath : sunPath}
          className="theme-toggle-main-path"
          style={{
            stroke: isDark ? 'var(--md-primary)' : 'var(--md-tertiary)',
            fill: isDark ? 'var(--md-primary)' : 'var(--md-tertiary)',
            strokeWidth: 3,
            fillOpacity: 0.35,
            strokeOpacity: 1,
            transformOrigin: '50% 50%',
          }}
        />
      </svg>
    </button>
  )
}

export default ThemeToggle
