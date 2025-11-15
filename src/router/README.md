# 路由模块

基于 React Router v7 的路由守卫实现，提供类似 Vue Router `beforeEach` 的功能。

## 目录结构

```
router/
├── config.ts      # 配置常量（公开路由配置）
├── routes.tsx     # 路由配置（纯配置，路由定义）
├── guard.ts       # 权限守卫（认证、权限控制）
├── enhancer.ts    # 路由增强器（注入 loader、Loading 动画）
├── index.tsx      # 组装功能，导出路由实例
└── Layout.tsx     # 布局组件
```

## 架构设计

### 职责分离

**1. routes.tsx - 路由配置**

- 职责：定义路由结构和元数据
- 纯配置文件，不包含业务逻辑

**2. guard.ts - 权限守卫**

- 职责：权限控制、认证检查、页面标题设置
- 只关心"能不能访问"，不涉及动画控制
- 提供 `createAuthGuard()`

**3. enhancer.ts - 路由增强器**

- 职责：路由增强、Loading 动画控制、守卫调用
- 负责"怎么访问"，协调守卫和动画
- 提供 `createEnhancedRouter()`

**4. index.tsx - 功能组装**

- 职责：组装路由配置、守卫、增强器
- 导出最终的路由实例

## 核心功能

- **路由守卫**：在路由加载前执行认证检查，避免页面闪烁
- **Loading 动画**：路由切换时自动显示/隐藏 Loading
- **自动认证**：基于 `PUBLIC_ROUTES` 配置自动判断是否需要登录
- **页面标题**：自动设置页面标题（通过 `meta.title`）
- **重定向处理**：未登录自动重定向到登录页，并保存来源路径

## 使用方式

### 添加新路由

在 `routes.tsx` 中添加路由配置：

```typescript
{
  path: 'dashboard',
  element: <Dashboard />,
  meta: {
    title: '仪表盘',
  },
}
```

### 配置公开路由

在 `config.ts` 中修改 `PUBLIC_ROUTES`：

```typescript
export const PUBLIC_ROUTES = ['/', '/login', '/about'] as const
```

**注意**：不在 `PUBLIC_ROUTES` 中的路由会自动要求登录。

### 自定义守卫

```typescript
// 创建自定义守卫
const customGuard: RouterGuard = {
  beforeEach: async ({ to, meta }) => {
    // 自定义逻辑
    if (someCondition) {
      return redirect('/custom-page')
    }
    return undefined // 返回 undefined 表示通过
  },
}

// 使用自定义守卫
const router = createEnhancedRouter(routes, customGuard)
```

## 工作流程

```
用户触发路由跳转
    ↓
enhancer.ts: 拦截路由加载
    ↓
1. 检测路径变化
    ↓
2. 显示 Loading 动画 (entering → active)
    ↓
3. 调用 guard.ts: 执行权限检查
    ├── 未登录 → 重定向到 /login
    └── 通过 → 继续
    ↓
4. 如果重定向 → 立即隐藏 Loading
5. 如果通过 → 执行 route.loader
    ↓
6. 检查页面加载状态
    ↓
7. 页面加载完成 → 隐藏 Loading (exiting → idle)
```

## 关键文件说明

- **config.ts**：公开路由配置和工具函数
- **routes.tsx**：路由定义和元数据
- **guard.ts**：守卫工厂函数和认证逻辑（纯权限控制）
- **enhancer.ts**：路由增强和动画控制逻辑
- **index.tsx**：组装所有功能，导出路由实例

## 扩展性

### 添加新的守卫

1. 在 `guard.ts` 中添加新的守卫工厂函数
2. 在 `index.tsx` 中组合多个守卫

### 修改 Loading 动画

1. 修改 `components/loading/` 中的动画实现
2. `enhancer.ts` 会自动使用新的动画逻辑

### 添加路由拦截逻辑

1. 在 `enhancer.ts` 的 `enhancedLoader` 中添加
2. 或创建新的增强器模块
