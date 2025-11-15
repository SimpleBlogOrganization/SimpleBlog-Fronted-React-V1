# My Blog Frontend

基于 React 19 + TypeScript + Vite 构建的现代化博客前端应用。

## ✨ 特性

- ⚡️ **极速开发** - 基于 Vite 7，提供极速的 HMR 体验
- 🎯 **类型安全** - 完整的 TypeScript 类型支持，提升开发体验和代码质量
- 🛡️ **路由守卫** - 基于 React Router v7 的权限控制，支持认证检查
- 🎨 **主题切换** - 支持浅色/深色模式切换，自动持久化用户偏好
- 📦 **状态管理** - 基于 Context API 的全局状态管理，支持持久化到 localStorage
- 🎭 **Loading 动画** - 优雅的路由切换动画，提升用户体验
- 🔒 **代码规范** - ESLint + Prettier + Husky + Commitlint 保证代码质量

## 🛠️ 技术栈

### 核心依赖

- **React** 19.2.0 - UI 框架
- **TypeScript** 5.9.3 - 类型系统
- **Vite** 7.2.2 - 构建工具
- **React Router DOM** 7.9.6 - 路由管理
- **Axios** 1.13.2 - HTTP 客户端
- **Sass** 1.94.0 - CSS 预处理器

### 开发工具

- **ESLint** - 代码检查
- **Prettier** - 代码格式化
- **Husky** - Git Hooks
- **Commitlint** - 提交信息规范
- **Commitizen** - 交互式提交

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装依赖

```bash
npm install
```

### 开发

```bash
npm run dev
```

访问 http://localhost:5173

### 构建

```bash
npm run build
```

构建产物位于 `dist/` 目录。

### 预览

```bash
npm run preview
```

## 📁 项目结构

```
frontend/
├── public/                 # 静态资源
├── src/
│   ├── components/         # 公共组件
│   │   └── loading/        # Loading 组件及管理器
│   ├── config/             # 配置文件
│   │   ├── appContext.ts   # 全局状态配置
│   │   └── router.ts       # 路由配置（公开路由）
│   ├── contexts/           # Context 上下文
│   │   └── AppContext.tsx  # 全局状态管理
│   ├── page/               # 页面组件
│   │   ├── index/          # 首页
│   │   ├── home/           # 用户中心
│   │   ├── login/          # 登录页
│   │   └── 404.tsx         # 404 页面
│   ├── router/             # 路由系统
│   │   ├── routes.tsx      # 路由配置
│   │   ├── guard.ts        # 路由守卫
│   │   ├── enhancer.ts     # 路由增强器
│   │   ├── Layout.tsx      # 布局组件
│   │   └── index.tsx       # 路由组装
│   ├── services/           # 服务层
│   │   └── request.ts      # HTTP 请求封装
│   ├── types/              # 类型定义
│   ├── App.tsx             # 根组件
│   ├── main.tsx            # 入口文件
│   ├── global.ts           # 全局扩展
│   └── global.scss         # 全局样式
├── .husky/                 # Git Hooks
├── index.html              # HTML 模板
├── vite.config.ts          # Vite 配置
├── tsconfig.json           # TypeScript 配置
└── package.json            # 项目配置
```

## 📖 核心功能

### 路由系统

基于 React Router v7 实现的路由系统，提供：

- **路由守卫** - 在路由加载前执行认证检查，避免页面闪烁
- **自动 Loading** - 路由切换时自动显示/隐藏 Loading 动画
- **页面标题** - 自动设置页面标题（通过 `meta.title`）
- **重定向处理** - 未登录自动重定向到登录页，并保存来源路径

详细文档请查看 [路由模块文档](./src/router/README.md)

### 全局状态管理

基于 Context API 实现的全局状态管理，支持：

- **状态持久化** - 自动保存到 localStorage，刷新后保持状态
- **类型安全** - 完整的 TypeScript 类型支持
- **快捷方法** - 提供 `user`、`mode`、`token` 等快捷访问方法

### 主题系统

支持浅色/深色模式切换：

- **自动持久化** - 用户偏好自动保存到 localStorage
- **无闪烁切换** - 在 HTML 渲染前设置主题，避免闪烁
- **CSS 变量** - 基于 CSS 变量实现，易于扩展和维护

### HTTP 请求封装

基于 Axios 封装的请求工具，提供：

- **自动 Token 注入** - 自动从 localStorage 获取 token 并注入请求头
- **统一响应格式** - 统一的 `ApiResponse<T>` 响应格式
- **类型安全** - 完整的 TypeScript 类型支持

### Loading 动画

优雅的路由切换 Loading 动画：

- **状态机管理** - `idle` → `entering` → `active` → `exiting`
- **自动控制** - 路由切换时自动显示/隐藏
- **页面加载检测** - 自动检测页面加载完成

## 🎨 代码规范

### 代码格式化

项目使用 Prettier 进行代码格式化，配置如下：

- 不使用分号
- 单引号
- 2 空格缩进
- 行宽 80 字符

### 代码检查

项目使用 ESLint 进行代码检查，包含：

- TypeScript 推荐规则
- React Hooks 规则
- Prettier 集成

### Git 提交规范

项目使用 Commitlint 和 Commitizen 规范提交信息：

```bash
npm run commit
```

支持的提交类型：

- `feat` - 新功能
- `fix` - 修复 Bug
- `docs` - 文档更新
- `style` - 样式调整
- `refactor` - 代码重构
- `perf` - 性能优化
- `test` - 测试相关
- `build` - 构建相关
- `ci` - CI 配置
- `chore` - 杂项

### Git Hooks

项目使用 Husky 配置 Git Hooks：

- **pre-commit** - 提交前运行 lint-staged，自动格式化代码
- **commit-msg** - 提交信息检查，确保符合规范

## 📦 构建部署

### 构建生产版本

```bash
npm run build
```

构建产物位于 `dist/` 目录。

### 部署

构建完成后，将 `dist/` 目录部署到静态服务器即可。

## 📝 待办事项

- [ ] ALL

## 📄 许可证

MIT
