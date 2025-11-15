import type { StateConfig } from '@/types/AppContext'

/**
 * 全局状态持久化配置
 * 定义哪些状态需要持久化到 localStorage 及其配置
 */
export const DEFAULT_CONFIG: Record<string, StateConfig> = {
  user: {
    persist: true,
    storageKey: 'app_user',
    transform: {
      save: (value) => JSON.stringify(value),
      load: (value) => JSON.parse(value),
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
