import type { StateConfig } from '@/types/AppContext'

/**
 * 全局状态持久化配置
 * 定义哪些状态需要持久化到 localStorage 及其配置
 */
export const DEFAULT_CONFIG: Record<string, StateConfig> = {
  user: {
    persist: true, // 是否持久化
    storageKey: 'app_user', // 存储键名
    transform: {
      save: (value) => JSON.stringify(value), // 保存时的转换函数
      load: (value) => JSON.parse(value), // 加载时的转换函数
    },
  },
  mode: {
    persist: true,
    storageKey: 'app_mode',
  },
  token: {
    persist: true,
    storageKey: 'app_token',
  },
}
