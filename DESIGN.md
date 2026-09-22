# Word Rhythm — Website Design (v1)

> 设计依据：大模型对 `Word Rhythm` 品牌名的调研与定位意见（见对话）。
> 目标：为 `wordrhythm.app` 设计一个 Next.js 品牌枢纽站，承载多个圣经译本 App（KJV / ASV / WEB / RVR / LSG）。

---

## 1. 品牌分析（基于大模型意见）

**名字可行性**
- 公开检索（Google Play / App Store / 可见商标记录）未发现与 Bible App 直接撞名的 `Word Rhythm` 产品。
- 冲突主要来自音乐/诗歌/文字领域（加拿大 2016 年 `Wordrhythm` 商标、*The Word Rhythm Dictionary*、rhythm game）。这反而说明它作为品牌词有辨识度，不是"功能描述型"俗名。
- 注意：加拿大已有 `Wordrhythm` 记录，正式长期品牌化前应查 USPTO / EUIPO / UKIPO / WIPO（Class 9 软件、Class 42 服务）。

**产品哲学映射（核心资产）**
| 词 | 含义 |
|----|------|
| **Word** | God's Word / Scripture |
| **Rhythm** | 日常生活节奏 / 不同时刻 / 停顿 |

→ 不是"音乐节奏"，而是 **"Scripture naturally fitting into different moments of life."**

**Slogan 候选**
- 主推：`Scripture for the rhythm of everyday life.`
- 备选：`God's Word, part of your daily rhythm.`

**版本子品牌（商店命名）**
- `Word Rhythm: KJV Bible`
- `Word Rhythm: ASV Bible`
- `Word Rhythm: WEB Bible`
- `Word Rhythm: Biblia RVR`
- `Word Rhythm: Bible LSG`
- 统一母品牌：`Word Rhythm Bible`

**"Rhythm" 如何被功能解释（站点主线）**
```
Morning ────  Read Scripture
Day ────────  Emotion / Situation → Take a Break → Scripture → Insight → Prayer
Evening ────  Reflection / Reading
```
站点用 **Morning / Day / Evening** 三个"节拍"作为叙事骨架，比 guanyc.com 旧的 KJV 单版本站更有品牌统一感。

---

## 2. 站点架构（Hub 模型）

**假设**：`wordrhythm.app` 是**品牌枢纽站**——首页讲品牌与"节奏"理念，各译本以卡片形式导流到商店/子页。
（若你后面想要每个译本独立子站，可改为 `/versions/[slug]` 详情页，数据已抽离到 `lib/versions.ts`，扩展成本低。）

**页面规划（v1）**
| 路由 | 内容 |
|------|------|
| `/` | Hero（品牌+slogan+节奏动效）→ Rhythm Flow（Morning/Day/Evening）→ 译本网格 → Take a Break 高亮 → Footer |
| `/versions` | 全部译本，标注 live / planned |
| `/take-a-break` | 功能亮点页，导流到 App |
| （未来）`/versions/[slug]` | 单译本详情页 |

**导航**：Home · Versions · Take a Break

---

## 3. 视觉系统

**调性**：安静、克制、有"呼吸感"的灵修质感；用低频色彩 + 轻微节奏动效（非花哨）。

**Palette（CSS 变量，定义在 `globals.css`）**
| Token | 值 | 用途 |
|-------|----|------|
| `--bg` | `#f7f6f3` | 暖白纸感背景 |
| `--surface` | `#ffffff` | 卡片 |
| `--ink` | `#1f2430` | 正文 |
| `--muted` | `#6b7280` | 次要文字 |
| `--brand` | `#4f46e5` | 主色（静谧靛蓝） |
| `--brand-soft` | `#eef0ff` | 主色浅底 |
| `--accent` | `#e0a458` | 暖金强调（"光/节拍"） |

**字体**：系统字体栈（避免构建期拉取外网字体失败，Cloudflare 构建更稳）。

**节奏母题**：Hero 放一组轻微起伏的"节拍条"（CSS 动画 equalizer），呼应 Rhythm 概念，不用图片资源。

---

## 4. 内容策略
- 每个译本一页/卡片，标题走 SEO 长尾（如 "KJV Bible app for daily rhythm"），与 guanyc.com 既有 kjv-marketing / cuv-marketing 打法一致。
- 英文为主（面向美区/英语用户），与 KJV App 受众一致。

---

## 5. 技术 & 部署
- **栈**：Next.js 15（App Router）+ TypeScript + Tailwind CSS 3。无后端，纯静态可部署。
- **Cloudflare Pages**：
  1. 仓库推到 GitHub。
  2. Cloudflare Pages → Create Project → 连接 GitHub 仓库。
  3. Framework preset 选 **Next.js**。
  4. Build command：`npx @cloudflare/next-on-pages`（或 `next build`），output 由 next-on-pages 处理。
  5. 自定义域：`wordrhythm.app`，DNS 在 Cloudflare 托管。
- 本地预览：`npm install` → `npm run dev`（http://localhost:3000）。

---

## 6. 待你确认 / 下一步
1. 译本清单与状态：当前仅 KJV 为 live（com.gyc.ace.kjv），其余标 planned。是否齐全？是否要加 CUV？
2. Hub vs 每译本子页：先 Hub，还是直接做 `/versions/[slug]` 详情页？
3. 文案语言：英文为主，是否要中文/西语/法语版本切换（对应 RVR/LSG）？
4. 是否复用 guanyc.com 已有的 KJV 营销长文作为 `/versions/kjv` 内容？
