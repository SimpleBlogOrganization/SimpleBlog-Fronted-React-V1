import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  useCallback,
} from 'react'
import { gsap } from 'gsap'
import type { LoadingRef } from './type'
import Logo from './Logo'
import './index.scss'

/**
 * Loading 组件
 * 提供全屏 loading 遮罩，支持块状覆盖动画和 Logo 描边动画
 */
const Loading = forwardRef<LoadingRef>((_, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const logoOverlayRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<SVGSVGElement>(null)
  const blocksRef = useRef<HTMLDivElement[]>([])
  const isTransitioning = useRef(false)

  const createBlocks = useCallback(() => {
    if (!overlayRef.current) return
    overlayRef.current.innerHTML = ''
    blocksRef.current = []

    for (let i = 0; i < 20; i++) {
      const block = document.createElement('div')
      block.className = 'block'
      overlayRef.current.appendChild(block)
      blocksRef.current.push(block)
    }
  }, [])

  const resetState = useCallback(() => {
    const path = logoRef.current?.querySelector('path')
    if (!path) return

    const pathLength = path.getTotalLength()
    gsap.set(path, {
      strokeDasharray: pathLength,
      strokeDashoffset: pathLength,
      fill: 'transparent',
    })
    gsap.set(blocksRef.current, { scaleX: 0, transformOrigin: 'left' })
    gsap.set(logoOverlayRef.current, { opacity: 0 })
  }, [])

  const coverPage = useCallback(
    (next?: () => void) => {
      const path = logoRef.current?.querySelector('path')
      if (!path) return

      gsap.killTweensOf([path, logoOverlayRef.current, blocksRef.current])
      resetState()

      isTransitioning.current = true

      const tl = gsap.timeline({
        onComplete: () => {
          next?.()
        },
      })

      tl.to(blocksRef.current, {
        scaleX: 1,
        duration: 0.4,
        stagger: 0.02,
        ease: 'power2.out',
        transformOrigin: 'left',
      })
        .set(logoOverlayRef.current, { opacity: 1 }, '-=0.2')
        .to(
          path,
          {
            strokeDashoffset: 0,
            duration: 2,
            ease: 'power2.inOut',
          },
          '-=0.5'
        )
        .to(
          path,
          {
            fill: 'var(--md-on-background)',
            duration: 1,
            ease: 'power2.inOut',
          },
          '-=0.5'
        )
        .to(logoOverlayRef.current, {
          opacity: 0,
          duration: 0.25,
          ease: 'power2.inOut',
        })
    },
    [resetState]
  )

  const revealPage = useCallback(() => {
    gsap.killTweensOf(blocksRef.current)
    gsap.set(blocksRef.current, { scaleX: 1, transformOrigin: 'right' })
    gsap.to(blocksRef.current, {
      scaleX: 0,
      duration: 0.4,
      stagger: 0.02,
      ease: 'power2.out',
      transformOrigin: 'right',
      onComplete: () => {
        isTransitioning.current = false
      },
    })
  }, [])

  useEffect(() => {
    createBlocks()
    resetState()
  }, [createBlocks, resetState])

  useImperativeHandle(
    ref,
    () => ({
      in: (next) => {
        if (isTransitioning.current) {
          next?.()
          return
        }
        coverPage(next)
      },
      out: () => {
        revealPage()
      },
    }),
    [coverPage, revealPage]
  )

  return (
    <div ref={containerRef} id="loading">
      <div ref={overlayRef} className="transition-overlay"></div>
      <div ref={logoOverlayRef} className="logo-overlay">
        <div className="logo-container">
          <Logo ref={logoRef} />
        </div>
      </div>
    </div>
  )
})

Loading.displayName = 'Loading'

export default Loading
export type { LoadingRef } from './type'
