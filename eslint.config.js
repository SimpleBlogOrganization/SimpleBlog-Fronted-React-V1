import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import eslintConfigPrettier from 'eslint-config-prettier'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_', //忽略以下划线开头的未使用函数参数
          varsIgnorePattern: '^_', //忽略以下划线开头的未使用变量
        },
      ],
    },
  },
  // 将 Prettier 作为 ESLint 规则运行, 并将差异报告为单个 ESLint 问题
  eslintPluginPrettierRecommended,
  // 关闭 ESLint 中所有不必要或可能与 Prettier 冲突的规则
  eslintConfigPrettier,
])
