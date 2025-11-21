import React, { useRef } from 'react'
import { useApp } from '@/contexts/AppContext'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import {
  FiHome,
  FiUser,
  FiBook,
  FiArchive,
  FiTag,
  FiHeart,
} from 'react-icons/fi'
import Left from './left'
import Middle from './middle'
import type { NavItem } from './middle'
import Right from './right'
import './index.scss'

export interface TablebarProps {
  /** 自定义类名 */
  className?: string
}

/**
 * Tablebar 组件
 * 顶部导航栏
 */
const Tablebar: React.FC<TablebarProps> = ({ className = '' }) => {
  const { user } = useApp()
  const leftRef = useRef<HTMLDivElement>(null)
  const middleNavRef = useRef<HTMLElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)

  const navItems: NavItem[] = [
    { path: '/', label: '首页', icon: <FiHome /> },
    { path: '/articles', label: '文章', icon: <FiBook /> },
    { path: '/archive', label: '归档', icon: <FiArchive /> },
    { path: '/tags', label: '标签', icon: <FiTag /> },
    { path: '/favorites', label: '收藏', icon: <FiHeart />, requireAuth: true },
    {
      path: '/home',
      label: '用户中心',
      icon: <FiUser />,
      requireAuth: true,
    },
  ]

  // 导航栏入场动画编排：Middle → Right → Left
  useGSAP(
    () => {
      if (!middleNavRef.current || !rightRef.current || !leftRef.current) return

      const tl = gsap.timeline()

      // 1. Middle - 从上方滑入
      const middleChildren = Array.from(
        middleNavRef.current.querySelectorAll('.nav-item')
      ) as HTMLElement[]
      const middleTargets =
        middleChildren.length > 0 ? middleChildren : [middleNavRef.current]

      tl.from(middleTargets, {
        y: -20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: 'power2.out',
      })

      // 2. Right - 掉落效果
      const rightChildren = Array.from(
        rightRef.current.children
      ) as HTMLElement[]
      const rightTargets =
        rightChildren.length > 0 ? rightChildren : [rightRef.current]

      tl.from(
        rightTargets,
        {
          y: -100,
          opacity: 0,
          rotation: -10,
          duration: 1.0,
          stagger: 0.15,
          ease: 'bounce.out',
        },
        '-=0.1' // 与上一个动画重叠 0.1s
      )

      // 3. Left - 从左侧弹入
      tl.from(
        leftRef.current,
        {
          x: -100,
          opacity: 0,
          duration: 1.0,
          ease: 'back.out(1.7)',
        },
        '-=0.2' // 与上一个动画重叠 0.2s
      )
    },
    { dependencies: [] }
  )

  return (
    <div id="tablebar" className={`tablebar ${className}`}>
      <Left ref={leftRef} />
      <Middle ref={middleNavRef} navItems={navItems} user={user ?? undefined} />
      <Right ref={rightRef} user={user} />
    </div>
  )
}

export default Tablebar
