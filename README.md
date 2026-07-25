# Jike 朋友圈前端

一个基于 Nuxt 4 构建的轻量级朋友圈 / 动态时间线前端，设计风格参考微信朋友圈，支持明暗模式、RSS 订阅、友链展示和反应互动。

后端 API 由独立的 [blog_api](https://github.com/kmoretti/blog_api) 项目提供，所有数据均来自该项目的公开接口。

## 技术栈

- **框架**：Nuxt 4（Vue 3 + TypeScript）
- **样式**：SCSS，CSS 变量实现明暗模式
- **图标**：Iconify（通过 `@nuxt/icon`）
- **部署**：静态站点，适配 Cloudflare Pages / EdgeOne / Vercel

## 主要功能

- 动态时间线（支持文本、媒体、扩展卡片、标签、反应）
- 短轮询刷新，保持数据新鲜
- 友链页面，按延迟检测数据过滤并展示网站截图
- 友链申请表单，支持新站申请、旧站更新和公开申请列表
- RSS 文章聚合页面
- 后台管理入口（支持 iframe 内嵌或外部跳转）
- 明暗模式切换
- 响应式布局，适配桌面与移动端

## 项目结构

```
.
├── app/                       # Nuxt 应用源码
│   ├── assets/styles/         # 全局样式
│   ├── components/            # 组件
│   │   └── FriendApplyForm.vue   # 友链申请表单
│   ├── composables/           # 组合式函数
│   ├── layouts/               # 布局
│   ├── pages/                 # 页面
│   │   └── friends.vue        # 友链页面（含申请表单）
│   ├── types/                 # TypeScript 类型
│   └── utils/                 # 工具函数
├── config.ts                  # 站点与分页配置
├── nuxt.config.ts             # Nuxt 配置
└── public/                    # 静态资源
```

## 配置说明

核心配置集中在 [config.ts](./config.ts) 中：

- `site`：站点名称、头像、封面、签名、后台地址等
- `api.baseURL`：后端 API 基础地址
- `pagination`：友链和 RSS 的每页数量
- `nav`：侧边栏/底部导航项
- `theme.defaultMode`：默认主题模式

## 环境变量

部署时可通过环境变量覆盖 API 地址：

```bash
NUXT_PUBLIC_API_BASE=https://your-api-domain.com
```

## 友链申请表单

友链页面底部集成了 `FriendApplyForm` 组件，访客无需登录即可提交友链申请。

### 功能

- **申请条件勾选**：参考 Hexo + Butterfly 主题的友链申请样式，必须勾选所有条件后才能填写表单。
- **双模式切换**：支持「申请友链」和「更新友链」两种模式。
- **Turnstile 人机验证**：当后端启用 Turnstile 时，表单会自动加载验证组件。
- **公开申请列表**：展示已提交的申请记录及审核状态，支持状态筛选和名称搜索。状态显示为：未审批（黄色）、已通过（绿色）、已拒绝（红色）。
- **多端适配**：表单和列表在桌面与移动端均有独立的响应式布局。
- **明暗模式**：使用 CSS 变量跟随站点主题自动切换，状态标签在深色模式下会自动提高亮度以保证可读性。

### 表单字段

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| 站点名称 | 是 | 站点显示名称 |
| 站点地址 | 是 | 必须以 `http://` 或 `https://` 开头 |
| 头像地址 | 是 | 站点头像/Logo URL |
| 联系邮箱 | 是 | 管理员联系用，不公开显示 |
| 站点描述 | 否 | 简短描述 |
| 站点截图 | 否 | 站点预览图 URL |
| 友链页面 | 否 | 对方友链页面地址 |
| RSS 订阅地址 | 否 | 用于后端抓取文章 |
| 启用 RSS 抓取 | 否 | 是否允许后端自动抓取 RSS |

## 本地开发

```bash
pnpm install
pnpm dev
```

开发服务器默认监听 `0.0.0.0`，方便局域网预览。

## 构建与预览

```bash
pnpm typecheck   # 类型检查
pnpm build       # 生成静态产物到 .output/public
pnpm preview     # 本地预览构建结果
```

## 部署

本项目生成纯静态站点，可直接部署到支持静态托管的平台：

- Cloudflare Pages
- EdgeOne Pages
- Vercel

部署时请将构建命令设为 `pnpm build`，输出目录设为 `.output/public`。

## 后台管理嵌入说明

`config.ts` 中 `site.adminEmbed` 控制后台管理是否以内嵌 iframe 形式展示。当后端启用 Turnstile 验证时，iframe 内嵌可能因域名校验失败而无法通过验证，因此 admin 页面会自动检测 Turnstile 状态：若已启用，即使 `adminEmbed` 为 `true`，也会回退为「在新标签页中打开后台」的提示。

## 相关仓库

- 后端 API：[https://github.com/kmoretti/blog_api](https://github.com/kmoretti/blog_api)
