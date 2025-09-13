# NoCode Run - 无代码应用平台

一个通过自然语言描述创建应用系统，并支持预览和部署的无代码应用平台。

## 🚀 功能特性

- **自然语言驱动**: 通过自然语言描述创建应用
- **实时预览**: 即时查看应用效果
- **应用管理**: 创建、编辑、删除应用
- **代码生成**: 自动生成应用代码
- **响应式设计**: 支持多种设备访问

## 📋 系统要求

- Node.js >= 16.0.0
- npm >= 8.0.0

## 🛠️ 技术栈

### 前端
- **React 18** - 用户界面框架
- **TypeScript** - 类型安全的JavaScript
- **Vite** - 快速构建工具
- **Ant Design** - UI组件库
- **React Router** - 路由管理
- **Zustand** - 状态管理
- **Axios** - HTTP客户端

### 后端
- **Node.js** - 运行时环境
- **Express** - Web框架
- **SQLite** - 轻量级数据库
- **Joi** - 数据验证
- **UUID** - 唯一标识符生成

## 📁 项目结构

```
nocode-run/
├── frontend/                 # 前端应用
│   ├── src/
│   │   ├── components/       # 可复用组件
│   │   ├── pages/           # 页面组件
│   │   ├── services/        # API服务
│   │   ├── store/           # 状态管理
│   │   ├── App.tsx          # 主应用组件
│   │   └── main.tsx         # 入口文件
│   ├── package.json
│   └── vite.config.ts
├── backend/                  # 后端API
│   ├── src/
│   │   ├── database/        # 数据库配置
│   │   ├── models/          # 数据模型
│   │   ├── routes/          # API路由
│   │   └── index.js         # 服务器入口
│   └── package.json
├── PRDs/                     # 产品需求文档
└── README.md
```

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd nocode-run
```

### 2. 安装依赖

```bash
# 安装所有依赖（根目录、前端、后端）
npm run install:all

# 或者分别安装
npm install                    # 根目录依赖
cd frontend && npm install     # 前端依赖
cd ../backend && npm install   # 后端依赖
```

### 3. 环境配置

```bash
# 复制环境配置文件
cp backend/.env.example backend/.env

# 根据需要修改配置
vim backend/.env
```

### 4. 启动开发服务器

```bash
# 同时启动前端和后端（推荐）
npm run dev

# 或者分别启动
npm run dev:frontend    # 前端开发服务器 (http://localhost:3000)
npm run dev:backend     # 后端API服务器 (http://localhost:3001)
```

### 5. 访问应用

- 前端应用: http://localhost:3000
- 后端API: http://localhost:3001/api
- 健康检查: http://localhost:3001/api/health

## 📖 使用指南

### 创建应用

1. 访问首页，点击「创建应用」按钮
2. 输入应用名称和描述
3. 点击确认创建应用

### 开发应用

1. 在首页点击应用卡片进入开发页面
2. 在左下角输入区域用自然语言描述功能需求
3. 点击「提交需求」按钮生成代码
4. 在右侧预览区域查看应用效果

### 管理应用

- **查看应用**: 首页展示所有已创建的应用
- **编辑应用**: 点击应用卡片进入开发页面
- **删除应用**: 点击应用卡片上的删除按钮

## 🔧 开发指南

### 前端开发

```bash
cd frontend
npm run dev     # 启动开发服务器
npm run build   # 构建生产版本
npm run preview # 预览生产版本
npm run lint    # 代码检查
```

### 后端开发

```bash
cd backend
npm run dev     # 启动开发服务器（热重载）
npm start       # 启动生产服务器
npm test        # 运行测试
```

### API文档

#### 应用管理API

- `GET /api/apps` - 获取所有应用
- `GET /api/apps/:id` - 获取单个应用
- `POST /api/apps` - 创建应用
- `PUT /api/apps/:id` - 更新应用
- `DELETE /api/apps/:id` - 删除应用

#### 健康检查

- `GET /api/health` - 服务器健康状态

## 🏗️ 构建部署

### 构建项目

```bash
# 构建前端和后端
npm run build

# 分别构建
npm run build:frontend
npm run build:backend
```

### 生产部署

```bash
# 设置生产环境变量
export NODE_ENV=production

# 启动生产服务器
npm start
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📝 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🐛 问题反馈

如果您发现任何问题或有改进建议，请创建 [Issue](../../issues)。

## 📞 联系我们

- 项目维护者: NoCode Team
- 邮箱: support@nocode-run.com

---

**NoCode Run** - 让创建应用变得简单！ 🎉