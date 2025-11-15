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
 *! 全局上下文 - 提供应用级别的状态管理
 *! 使用 React Context API 实现全局状态共享，支持存储任意类型的数据
 */

/* eslint-disable react-refresh/only-export-components */

// 创建上下文实例
const AppContext = createContext<AppContextType | undefined>(undefined)

/**
 * 从 localStorage 加载状态
 * @param config - 状态配置
 * @returns 加载的状态值，如果不存在则返回 undefined
 */
const loadFromStorage = (config: StateConfig): unknown => {
  if (!config.persist || !config.storageKey) return undefined // 如果配置不持久化或没有存储键，则返回 undefined
  const saved = localStorage.getItem(config.storageKey) // 从 localStorage 获取存储的值
  if (!saved) return undefined // 如果存储的值为空，则返回 undefined
  return config.transform?.load ? config.transform.load(saved) : saved // 如果配置有转换函数，则使用转换函数转换值，否则返回原始值
}

/**
 * 保存状态到 localStorage
 * @param key - 状态键名
 * @param value - 状态值
 * @param config - 可选的配置（覆盖默认配置）
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
 * @param children - 子组件
 * @returns 上下文提供者组件
 */
export const AppProvider = ({ children }: { children: ReactNode }) => {
  // 初始化状态 - 从配置自动生成
  const [state, setStateObj] = useState<AppState>(() => {
    const initialState: AppState = {} // 初始状态为空对象
    // 遍历持久化状态配置
    Object.entries(DEFAULT_CONFIG).forEach(([key, config]) => {
      const loaded = loadFromStorage(config) // 从 localStorage 加载状态
      if (loaded !== undefined) initialState[key] = loaded // 如果加载成功，则设置初始状态
    })
    return initialState // 返回初始状态
  })

  /**
   * 设置状态
   * @param key - 状态键名
   * @param value - 状态值
   * @param config - 可选的配置（覆盖默认配置）
   */
  const setState = useCallback(
    <T = unknown,>(key: string, value: T, config?: StateConfig) => {
      setStateObj((prev) => ({ ...prev, [key]: value })) // 设置状态
      saveToStorage(key, value, config) // 保存状态到 localStorage
    },
    []
  )

  /**
   * 获取状态
   * @param key - 状态键名
   * @returns 状态值，如果不存在则返回 undefined
   */
  const getState = useCallback(
    <T = unknown,>(key: string): T | undefined => {
      return state[key] as T | undefined
    },
    [state]
  )

  /**
   * 删除状态
   * @param key 状态键名
   * @returns void
   */
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
   * @returns void
   */
  const clearState = useCallback(() => {
    setStateObj({} as AppState)
    Object.values(DEFAULT_CONFIG).forEach((config) => {
      if (config.persist && config.storageKey) {
        localStorage.removeItem(config.storageKey)
      }
    })
  }, [])

  /**
   * 设置用户信息
   * @param user 用户信息，传入 null 表示退出登录
   * @returns void
   */
  const setUser = useCallback(
    (user: User | null) => setState('user', user),
    [setState]
  )

  /**
   * 设置主题模式
   * @param mode - 主题模式
   */
  const setMode = useCallback(
    (mode: Mode) => setState('mode', mode),
    [setState]
  )

  /**
   * 退出登录
   * 清除用户信息和 token
   * @returns void
   */
  const logout = useCallback(() => {
    removeState('user')
    removeState('token')
  }, [removeState])

  /**
   * 应用模式到 DOM
   * @returns void
   */
  useEffect(() => {
    const mode = (state.mode as Mode) || 'light'
    document.documentElement.setAttribute('data-mode', mode)
  }, [state.mode])

  /**
   * 使用 useMemo 优化 context value，避免不必要的重渲染
   * @returns AppContextType
   */
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
 * 在组件中调用此 Hook 即可访问全局状态和方法
 * @throws 如果不在 AppProvider 内部使用会抛出错误
 * @returns AppContextType - 应用上下文对象
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
 * @param key - 状态键名
 * @returns 状态值，如果不存在或解析失败则返回 null
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
