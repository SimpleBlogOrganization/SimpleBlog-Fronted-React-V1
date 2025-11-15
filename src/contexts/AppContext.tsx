import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react'
import type { ReactNode } from 'react'
import type {
  AppState,
  AppContextType,
  StateConfig,
  Mode,
  User,
} from '../types/AppContext'
import { DEFAULT_CONFIG } from '@/config/appContext'

/**
 * 全局上下文 - 提供应用级别的状态管理
 * 使用 React Context API 实现全局状态共享，支持存储任意类型的数据
 */

/* eslint-disable react-refresh/only-export-components */

const AppContext = createContext<AppContextType | undefined>(undefined)

/**
 * 从 localStorage 加载状态
 */
const loadFromStorage = (config: StateConfig): unknown => {
  if (!config.persist || !config.storageKey) return undefined
  const saved = localStorage.getItem(config.storageKey)
  if (!saved) return undefined
  return config.transform?.load ? config.transform.load(saved) : saved
}

/**
 * 保存状态到 localStorage
 */
const saveToStorage = (
  key: string,
  value: unknown,
  config?: StateConfig
): void => {
  const finalConfig = config || DEFAULT_CONFIG[key]
  if (!finalConfig?.persist) return

  const storageKey = finalConfig.storageKey || `app_${key}`
  if (value == null) {
    localStorage.removeItem(storageKey)
  } else {
    const valueToSave = finalConfig.transform?.save
      ? finalConfig.transform.save(value)
      : String(value)
    localStorage.setItem(storageKey, valueToSave)
  }
}

/**
 * 全局上下文提供者组件
 * 需要在应用根部包裹此组件，使所有子组件都能访问全局状态
 */
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setStateObj] = useState<AppState>(() => {
    const initialState: AppState = {}
    Object.entries(DEFAULT_CONFIG).forEach(([key, config]) => {
      const loaded = loadFromStorage(config)
      if (loaded !== undefined) initialState[key] = loaded
    })
    return initialState
  })

  const setState = useCallback(
    <T = unknown,>(key: string, value: T, config?: StateConfig) => {
      setStateObj((prev) => ({ ...prev, [key]: value }))
      saveToStorage(key, value, config)
    },
    []
  )

  const getState = useCallback(
    <T = unknown,>(key: string): T | undefined => {
      return state[key] as T | undefined
    },
    [state]
  )

  const removeState = useCallback((key: string) => {
    setStateObj((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [key]: _unused, ...rest } = prev
      return rest
    })
    const config = DEFAULT_CONFIG[key]
    if (config?.persist && config.storageKey) {
      localStorage.removeItem(config.storageKey)
    }
  }, [])

  /**
   * 清空所有状态
   * 会清除内存中的状态和 localStorage 中的持久化数据
   */
  const clearState = useCallback(() => {
    setStateObj({} as AppState)
    Object.values(DEFAULT_CONFIG).forEach((config) => {
      if (config.persist && config.storageKey) {
        localStorage.removeItem(config.storageKey)
      }
    })
  }, [])

  const setUser = useCallback(
    (user: User | null) => setState('user', user),
    [setState]
  )

  const setMode = useCallback(
    (mode: Mode) => setState('mode', mode),
    [setState]
  )

  /**
   * 退出登录
   * 清除用户信息和 token
   */
  const logout = useCallback(() => {
    removeState('user')
    removeState('token')
  }, [removeState])

  useEffect(() => {
    const mode = (state.mode as Mode) || 'light'
    document.documentElement.setAttribute('data-mode', mode)
  }, [state.mode])

  const contextValue = useMemo<AppContextType>(
    () => ({
      state,
      setState,
      getState,
      removeState,
      clearState,
      user: (state.user as User | undefined) || null,
      mode: (state.mode as Mode) || 'light',
      setUser,
      setMode,
      logout,
    }),
    [
      state,
      setState,
      getState,
      removeState,
      clearState,
      setUser,
      setMode,
      logout,
    ]
  )

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  )
}

/**
 * 使用全局上下文的 Hook
 * @throws 如果不在 AppProvider 内部使用会抛出错误
 * @example
 * ```typescript
 * const { user, setUser } = useApp()
 * ```
 */
export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within an AppProvider')
  return context
}

export type { AppState, AppContextType, StateConfig, Mode, User }

/**
 * 获取上下文状态
 * 提供给非 React 组件使用（如路由守卫）
 * @example
 * ```typescript
 * const user = getContext<User>('user')
 * const mode = getContext<Mode>('mode')
 * ```
 */
export const getContext = <T = unknown,>(
  key: keyof typeof DEFAULT_CONFIG
): T | null => {
  try {
    const config = DEFAULT_CONFIG[key]
    if (!config) return null
    const result = loadFromStorage(config)
    return (result ?? null) as T | null
  } catch (error) {
    console.error(`Failed to get context for key "${key}":`, error)
    return null
  }
}

export const getUser = (): User | null => {
  return getContext<User>('user')
}
