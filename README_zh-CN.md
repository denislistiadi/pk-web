# Paham Kades — Pemalang 村长候选人匹配系统

帮助 Pemalang 居民根据个人偏好，通过 TF-IDF 相似度评分查找、比较和匹配村长候选人。

## 功能

- **浏览候选人** — 查看 Pemalang 14 个地区 50 个村庄的所有村长候选人
- **匹配检测** — 填写您的理想愿景、选择重要使命、设定教育/年龄偏好，获取排名匹配结果
- **候选人比较** — 横向对比 2-3 位候选人（教育、年龄、愿景、使命）
- **智能匹配** — 愿景使用 TF-IDF 余弦相似度，使命使用 Jaccard 相似度，加权评分（愿景 35%、使命 30%、教育 15%、年龄 20%）

## 技术栈

### 前端
- **Next.js 15** — React 全栈框架（App Router）
- **React 19** — UI 库
- **TypeScript** — 类型安全的 JavaScript
- **Tailwind CSS 4** — 实用优先的 CSS 框架
- **shadcn/ui** — 组件系统（Button、Card、Badge、Progress、Select 等）

### 后端
- **FastAPI** — 高性能 Python Web 框架
- **Pydantic** — 类型提示数据验证
- **SQLite** — 嵌入式数据库
- **纯 Python TF-IDF** — 无需外部 AI 依赖的匹配引擎

### 平台
- **EdgeOne Pages** — 无服务器托管（云函数 + 静态站点）

## 项目结构

```
pk-web/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # 根布局
│   │   ├── page.tsx                # 首页
│   │   ├── globals.css             # 印尼主题（红+金）
│   │   └── desa/
│   │       ├── page.tsx            # 村庄目录
│   │       └── [id]/
│   │           ├── page.tsx        # 村庄详情 + 候选人
│   │           ├── form/page.tsx   # 偏好表单
│   │           ├── hasil/page.tsx  # 匹配结果
│   │           └── compare/page.tsx # 候选人比较
│   ├── components/
│   │   ├── layout/                 # Header & Footer
│   │   ├── ui/                     # 可复用 UI 组件
│   │   ├── desa-card.tsx
│   │   └── paslon-card.tsx
│   └── lib/
│       ├── types.ts                # TypeScript 接口
│       ├── api.ts                  # API 客户端
│       └── utils.ts                # 工具函数
├── cloud-functions/
│   ├── api/
│   │   └── [[default]].py          # FastAPI 应用
│   ├── lib/
│   │   ├── database.py             # SQLite 查询
│   │   ├── models.py               # Pydantic 模型
│   │   └── tfidf.py                # TF-IDF 匹配引擎
│   ├── seed.py                     # 数据库播种
│   ├── run_api.py                  # 开发服务器脚本
│   ├── pahamkades.db               # SQLite 数据库
│   └── requirements.txt            # Python 依赖
├── data/
│   └── seed-data.json              # 种子数据（编辑此处填入真实数据）
├── public/
│   └── favicon.svg                 # PK 图标
└── next.config.ts                  # API 重写配置
```

## 快速开始

### 环境要求
- Node.js 18+
- Python 3.9+

### 安装依赖

```bash
npm install
pip install -r cloud-functions/requirements.txt
```

### 播种数据库

```bash
python cloud-functions/seed.py
```

### 开发模式

分别在两个终端中运行后端和前端：

**终端 1 — 后端 (FastAPI)：**
```bash
python cloud-functions/run_api.py
```

**终端 2 — 前端 (Next.js)：**
```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### EdgeOne Pages 开发模式

```bash
edgeone pages dev
```

访问 [http://localhost:8088](http://localhost:8088)。

## API 端点

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/kecamatan | 列出所有地区 |
| GET | /api/desa | 列出所有村庄（支持 ?kecamatan_id= 过滤） |
| GET | /api/desa/{id} | 村庄详情及候选人 |
| GET | /api/paslon/{id} | 候选人详情 |
| GET | /api/paslon/compare?ids=1,2,3 | 比较 2 位以上候选人 |
| POST | /api/cocokkan | 提交偏好表单，获取匹配排名 |

### 匹配算法权重

| 标准 | 权重 | 方法 |
|------|------|------|
| 愿景 (Visi) | 35% | TF-IDF 余弦相似度 |
| 使命 (Misi) | 30% | Jaccard 相似度 |
| 教育 | 15% | 阈值评分 |
| 年龄 | 20% | 范围评分 |

## 自定义数据

编辑 `data/seed-data.json` 填入真实的候选人信息，然后重新播种：

```bash
python cloud-functions/seed.py
```

## 许可证

MIT
