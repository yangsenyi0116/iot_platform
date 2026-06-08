# 工业智能平台 (IIoT Platform)

基于 React 构建的工业智能平台前端应用，提供设备管理、能耗管理、备件管理、预测性维护等核心功能。

## 技术栈

- **框架**: React 19 + TypeScript
- **构建工具**: Vite 6
- **UI 组件**: Ant Design 6
- **状态管理**: Zustand
- **路由**: React Router 7
- **图表**: ECharts
- **3D 渲染**: Three.js + React Three Fiber

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

启动开发服务器，访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

构建产物输出到 `dist` 目录。

### 预览生产版本

```bash
npm run preview
```

启动预览服务器，查看构建结果。

### 代码检查

```bash
npm run lint
```

运行 ESLint 检查代码质量。

## 项目结构

```
src/
├── components/          # 通用组件
│   └── Layout/         # 布局组件（侧边栏、头部）
├── pages/              # 页面组件
│   ├── DigitalTwin/    # 全场总览（数字孪生）
│   ├── DeviceManagement/ # 设备管理
│   ├── GatewayManagement/ # IoT网关管理
│   ├── AlarmCenter/    # 报警中心
│   ├── WorkOrder/      # 工单管理
│   ├── PredictiveMaintenance/ # 预测性维护
│   ├── KnowledgeBase/  # 知识库
│   ├── EnergyManagement/ # 能耗管理
│   └── SpareParts/     # 备件管理
├── mocks/              # Mock 数据
├── types/              # TypeScript 类型定义
├── App.tsx             # 应用入口
├── main.tsx            # React 挂载入口
└── index.css           # 全局样式
```

## 功能模块

| 模块 | 说明 |
|------|------|
| 全场总览 | 数字孪生可视化，全局状态监控 |
| 设备管理 | 设备列表、设备详情、设备状态管理 |
| IoT网关管理 | 网关设备管理、连接状态监控 |
| 报警中心 | 实时报警、历史报警记录 |
| 工单管理 | 工单创建、处理、流转 |
| 预测性维护 | 设备健康预测、维护建议 |
| 知识库 | 运维知识文档、AI 问答 |
| 能耗管理 | 能耗监控、能效分析、趋势图表 |
| 备件管理 | 库存管理、采购建议、AI 分析 |

## 路由配置

| 路径 | 页面 |
|------|------|
| `/` | 重定向到全场总览 |
| `/digitaltwin` | 全场总览 |
| `/gateway` | IoT网关管理 |
| `/device` | 设备管理 |
| `/alarm` | 实时报警 |
| `/alarm/history` | 历史报警 |
| `/work-orders` | 工单管理 |
| `/predictive` | 预测性维护 |
| `/knowledge` | 知识库 |
| `/energy` | 能耗管理 |
| `/spare-parts` | 备件管理 |

## License

MIT