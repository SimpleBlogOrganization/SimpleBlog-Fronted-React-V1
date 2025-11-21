import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  forwardRef,
  useCallback,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { User } from '@/contexts/AppContext'

export interface NavItem {
  path: string
  label: string
  icon: React.ReactNode
  requireAuth?: boolean
}

interface MiddleProps {
  navItems: NavItem[]
  user?: User
}

const Middle = forwardRef<HTMLElement, MiddleProps>(
  ({ navItems, user }, ref) => {
    const navigate = useNavigate()
    const location = useLocation()
    const navRef = useRef<HTMLElement>(null)
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

    const [activeStyle, setActiveStyle] = useState({
      translateX: 0,
      width: 0,
      opacity: 0,
    })
    const [hoverStyle, setHoverStyle] = useState({
      translateX: 0,
      width: 0,
      opacity: 0,
    })

    const visibleItems = useMemo(
      () => navItems.filter((item) => !item.requireAuth || user),
      [navItems, user]
    )

    const isActive = useCallback(
      (path: string) =>
        path === '/'
          ? location.pathname === '/'
          : location.pathname.startsWith(path),
      [location.pathname]
    )

    const getElementRect = (el: HTMLElement) => {
      if (!navRef.current) return null
      const navRect = navRef.current.getBoundingClientRect()
      const elRect = el.getBoundingClientRect()
      return {
        translateX: elRect.left - navRect.left,
        width: elRect.width,
        opacity: 1,
      }
    }

    // 更新激活项位置（路由变化或窗口大小变化时）
    useEffect(() => {
      const updateActivePosition = () => {
        itemRefs.current = itemRefs.current.slice(0, visibleItems.length)
        const activeIndex = visibleItems.findIndex((item) =>
          isActive(item.path)
        )
        const el = activeIndex !== -1 ? itemRefs.current[activeIndex] : null

        if (el) {
          const rect = getElementRect(el)
          if (rect) setActiveStyle(rect)
        } else {
          setActiveStyle((prev) => ({ ...prev, opacity: 0 }))
        }
      }

      updateActivePosition()
      window.addEventListener('resize', updateActivePosition)
      return () => window.removeEventListener('resize', updateActivePosition)
    }, [location.pathname, visibleItems, isActive])

    const handleMouseEnter = (index: number) => {
      const el = itemRefs.current[index]
      if (el) {
        const rect = getElementRect(el)
        if (rect) setHoverStyle(rect)
      }
    }

    const handleMouseLeave = () => {
      setHoverStyle((prev) => ({ ...prev, opacity: 0 }))
    }

    return (
      <nav
        ref={(el) => {
          navRef.current = el
          if (typeof ref === 'function') {
            ref(el)
          } else if (ref) {
            ref.current = el
          }
        }}
        className="tablebar__middle"
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="nav-slide nav-slide-active"
          style={{
            transform: `translateX(${activeStyle.translateX}px)`,
            width: activeStyle.width,
            opacity: activeStyle.opacity,
          }}
        />
        <div
          className="nav-slide nav-slide-hover"
          style={{
            transform: `translateX(${hoverStyle.translateX}px)${hoverStyle.opacity > 0 ? ' scale(0.95)' : ''}`,
            width: hoverStyle.width,
            opacity: hoverStyle.opacity,
          }}
        />

        {visibleItems.map((item, index) => (
          <button
            key={item.path}
            ref={(el) => {
              itemRefs.current[index] = el
            }}
            className={`nav-item ${isActive(item.path) ? 'nav-item--active' : ''}`}
            onClick={() => navigate(item.path)}
            onMouseEnter={() => handleMouseEnter(index)}
            aria-label={item.label}
          >
            <span className="nav-item__icon">{item.icon}</span>
            <span className="nav-item__label">{item.label}</span>
          </button>
        ))}
      </nav>
    )
  }
)

Middle.displayName = 'Middle'

export default Middle
