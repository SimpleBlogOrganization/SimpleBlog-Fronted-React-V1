/**
 * AppContext 类型定义
 * 提供全局状态管理的类型支持
 */

/**
 * 主题模式类型
 * @example 'light' | 'dark'
 */
export type Mode = 'light' | 'dark'

/**
 * 全局状态类型定义
 * 使用 Record 类型存储任意键值对的状态
 * @example { user: {...}, mode: 'dark', theme: {...} }
 */
export type AppState = Record<string, unknown>

/**
 * 状态配置接口
 * 用于配置状态的持久化行为和数据转换
 */
export interface StateConfig {
  /**
   * 是否持久化到 localStorage
   * @default false
   */
  persist?: boolean

  /**
   * localStorage 存储键名
   * @example 'app_user'
   */
  storageKey?: string

  /**
   * 数据转换函数
   * 用于序列化和反序列化状态数据
   */
  transform?: {
    /**
     * 保存时的转换函数（对象 → 字符串）
     * @param value 要保存的值
     * @returns 转换后的字符串
     * @example (value) => JSON.stringify(value)
     */
    save?: (value: unknown) => string

    /**
     * 加载时的转换函数（字符串 → 对象）
     * @param value 存储的字符串
     * @returns 转换后的值
     * @example (value) => JSON.parse(value)
     */
    load?: (value: string) => unknown
  }
}

/**
 * 用户信息接口
 */
export interface User {
  /**
   * 用户 ID
   */
  id: number | string

  /**
   * 用户名
   */
  username?: string

  /**
   * 显示名称
   */
  name?: string

  /**
   * 邮箱地址
   */
  email?: string

  /**
   * 扩展字段（保持灵活性）
   */
  [key: string]: unknown
}

/**
 * 应用上下文类型定义
 * 提供全局状态管理和快捷方法
 */
export interface AppContextType {
  /**
   * 全局状态对象
   * 存储所有应用级别的状态
   */
  state: AppState

  /**
   * 设置状态
   * @param key 状态键名
   * @param value 状态值
   * @param config 可选的配置（覆盖默认配置）
   * @example setState('theme', { color: 'blue' })
   */
  setState: <T = unknown>(key: string, value: T, config?: StateConfig) => void

  /**
   * 获取状态
   * @param key 状态键名
   * @returns 状态值，如果不存在则返回 undefined
   * @example const user = getState<User>('user')
   */
  getState: <T = unknown>(key: string) => T | undefined

  /**
   * 删除状态
   * @param key 状态键名
   * @example removeState('tempData')
   */
  removeState: (key: string) => void

  /**
   * 清空所有状态
   * 会清除内存中的状态和 localStorage 中的持久化数据
   * @example clearState()
   */
  clearState: () => void

  /**
   * 用户信息（快捷属性）
   * 等同于 getState<User>('user')
   */
  user: User | null

  /**
   * 主题模式（快捷属性）
   * 等同于 getState<Mode>('mode')，默认为 'light'
   */
  mode: Mode

  /**
   * 设置用户信息（快捷方法）
   * 等同于 setState('user', user)
   * @param user 用户信息，传入 null 表示退出登录
   * @example setUser({ id: 1, username: 'admin' })
   */
  setUser: (user: User | null) => void

  /**
   * 设置主题模式（快捷方法）
   * 等同于 setState('mode', mode)
   * @param mode 主题模式
   * @example setMode('dark')
   */
  setMode: (mode: Mode) => void

  /**
   * 退出登录（快捷方法）
   * 清除用户信息和 token
   * @example logout()
   */
  logout: () => void
}
