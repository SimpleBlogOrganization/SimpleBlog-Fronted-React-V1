/** @type {import('cz-git').UserConfig & import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // @see https://commitlint.js.org/#/reference-rules
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [1, 'always'],
    'header-max-length': [2, 'always', 108],
    'type-empty': [2, 'never'],
    'subject-case': [0],
    'type-case': [0],
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
        'wip',
        'workflow',
        'types',
        'release',
        'update',
      ],
    ],
    // 主题非空与末尾不加句号
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
  },
  prompt: {
    // 允许自定义 scope
    allowCustomScopes: true,
    types: [
      { value: 'feat', name: 'feat: ✨ 新功能: 新增新功能' },
      { value: 'fix', name: 'fix: 🐛 修复: 修复Bug' },
      { value: 'docs', name: 'docs: 📝 文档: 更新文档' },
      { value: 'style', name: 'style: 💄 样式: 调整样式' },
      { value: 'refactor', name: 'refactor: 🔨 重构: 重构代码' },
      { value: 'perf', name: 'perf: ⚡ 性能: 优化性能' },
      { value: 'test', name: 'test: 🧪 测试: 添加测试' },
      { value: 'build', name: 'build: 📦 构建: 构建项目' },
      { value: 'ci', name: 'ci: 🔄 持续集成: 更新CI配置' },
      { value: 'chore', name: 'chore: 🔧 杂项: 杂项变更' },
      { value: 'revert', name: 'revert: ⏪ 回退: 回退版本' },
      { value: 'wip', name: 'wip: 🚧 开发中: 开发中' },
      { value: 'workflow', name: 'workflow: 🔄 工作流: 更新工作流' },
      { value: 'types', name: 'types: 📝 类型: 更新类型' },
      { value: 'release', name: 'release: 🚀 发布: 发布版本' },
      { value: 'update', name: 'update: ♻️ 更新: 常规更新' },
    ],
    // 允许空 scope
    allowEmptyScopes: true,
    // 跳过不常用问题
    skipQuestions: ['footer', 'breaking'],
    // 自定义交互提示文案
    messages: {
      type: '🧩 请选择提交类型:',
      scope: '🎯 请选择影响范围(可选):',
      subject: '📝 请简要描述:',
      body: '🔍 详细描述(可选，换行符为 "|"):',
      footer: '🔗 关联的 ISSUE 或 BREAKING CHANGE(可选):',
      confirmCommit: '✅ 确认提交?',
    },
    scopes: [
      { value: 'app', name: 'app: 应用入口（App.tsx/main.tsx）' },
      { value: 'views', name: 'views: 页面相关（src/views）' },
      {
        value: 'components',
        name: 'components: 组件相关（src/views/components 等）',
      },
      { value: 'services', name: 'services: 服务层（src/services/*）' },
      {
        value: 'config',
        name: 'config: 工程配置（vite、eslint、tsconfig 等）',
      },
      { value: 'build', name: 'build: 构建与打包' },
      { value: 'ci', name: 'ci: 持续集成/流水线' },
      { value: 'deps', name: 'deps: 依赖与锁文件' },
      { value: 'docs', name: 'docs: 文档' },
      { value: 'auth', name: 'auth: 认证相关' },
    ],
  },
}
