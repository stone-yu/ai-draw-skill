# references/themes.md — 双主题目录

v0.3 起，主题分为两套独立目录：
- **画图模式** → `assets/themes-diagram/`（12 个）— 单图 / site 使用
- **PPT 模式** → `assets/themes-ppt/`（36 个）— PPT 演讲稿使用

两套主题互不干扰，T 键只在当前模式的主题集内循环。

---

## 一、画图模式主题（12 个 themes-diagram）

运行 `/ai-draw <画图需求>` 时，从下表按用户语气选 3 个推荐，第一个标 ⭐。

| 用户语气 / 关键词（中 + EN） | ① ⭐ | ② | ③ |
|---|---|---|---|
| 技术分享 / 内部分享 / 架构 / 微服务 / tech share / engineering | glassmorphism | tech-dark | blueprint |
| Linear 风 / 现代产品 / 系统架构 / 文档 / 紫蓝暗色 | saas-modern | tech-dark | linear-mode |
| 蓝图 / 工程图 / blueprint / CI/CD / pipeline | blueprint | tech-dark | minimal-light |
| 客户汇报 / 商务 / 对外 / formal / 董事会 / executive | business-clean | glassmorphism | saas-modern |
| SaaS / 产品页 / 营销信息图 / 平台介绍 / GPT image 风 / 商务渐变 | saas-modern | glassmorphism | business-clean |
| iOS / Apple 风 / 毛玻璃 / 苹果发布会 / glass / 高端发布 | glassmorphism | saas-modern | xhs-soft |
| 小红书 / 分享卡片 / xhs / 卡片风 / soft / 温暖 | xhs-soft | saas-modern | hand-drawn |
| cyber / 赛博 / 霓虹 / futuristic / 产品发布 / launch | cyberpunk-neon | tech-dark | blueprint |
| 创业路演 / 敢说敢做 / brutalism / 硬核 / 创业大赛 / pitch loud | neo-brutalism | cyberpunk-neon | tech-dark |
| 极简 / minimal / 白底 / 性冷淡 / clean | minimal-light | academic-paper | business-clean |
| 学术 / 论文 / 报告 / academic / paper / conference | academic-paper | minimal-light | business-clean |
| 草稿 / 手绘 / sketch / 白板 / wireframe / brainstorm | hand-drawn | minimal-light | xhs-soft |
| **其他 / 无明显匹配（fallback）** | glassmorphism | glassmorphism | tech-dark |

### 画图主题一句话描述

- **tech-dark** — 暗色技术风，slate-950 + 青/紫/翠语义色，JetBrains Mono
- **blueprint** — 蓝图工程风，深蓝 + 白色细线 + 密网格
- **business-clean** — 商务正式，米白 + 沉稳蓝/绿，Inter
- **xhs-soft** — 小红书柔色卡片，奶白 + 粉橙 + 大圆角
- **cyberpunk-neon** — 赛博朋克霓虹，纯黑 + 品红/青/黄发光
- **minimal-light** — 极简白纸，纯白 + 黑线，无强调色无阴影
- **academic-paper** — 学术论文，象牙白 + Source Serif + 灰线条
- **hand-drawn** — 手绘草图，米黄 + Caveat 字体 + rough.js 抖动笔触
- **saas-modern** — 现代 SaaS 产品页，浅色 + 蓝/紫/橙渐变 accent + 大圆角 + 柔和阴影，GPT Image 2.0 风
- **glassmorphism** — Apple 毛玻璃，紫粉橙径向渐变背景 + 半透明卡片 + backdrop-filter blur，iOS / 苹果发布会风
- **linear-mode** — Linear app 风，近黑底 + 电光靛蓝 accent + Inter 字体，现代产品 / 系统架构 / 文档冷静专业
- **neo-brutalism** — 厚黑描边 + 硬偏移阴影（4px 4px 0 #000）+ 三原色 + Archivo Black，创业路演 / 敢说敢做

### 兼容性提示矩阵（软警告，不阻断）

如用户组合落在 ⚠️ 格，提示一次：

> "你选了 **cyberpunk-neon × 类图** — 霓虹风跟 OO 类图的严肃感不太搭，要不要换 **business-clean** 或 **minimal-light**？或者就这样？"

| 主题 \ 图类型 | arch | KG | flow | seq | mind | class | er |
|---|---|---|---|---|---|---|---|
| tech-dark | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| blueprint | ✅ | ⚠️ | ✅ | ✅ | ✅ | ✅ | ✅ |
| business-clean | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| saas-modern | ⭐ | ✅ | ⭐ | ✅ | ✅ | ⚠️ | ⚠️ |
| glassmorphism | ⭐ | ✅ | ✅ | ⚠️ | ✅ | ⚠️ | ⚠️ |
| linear-mode | ⭐ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| neo-brutalism | ✅ | ⚠️ | ⭐ | ✅ | ⚠️ | ⚠️ | ⚠️ |
| xhs-soft | ⚠️ | ✅ | ✅ | ⚠️ | ✅ | ⚠️ | ⚠️ |
| cyberpunk-neon | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ |
| minimal-light | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| academic-paper | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ |
| hand-drawn | ✅ | ✅ | ✅ | ✅ | ⭐ | ⚠️ | ⚠️ |

### 画图主题显式覆盖关键词

用户 prompt 中包含主题名（不区分大小写）或下列别名时，跳过推荐直接锁定该主题：

| 锁定主题 | 别名 |
|---|---|
| tech-dark | tech-dark, dark, 暗色, 黑色 |
| blueprint | blueprint, 蓝图, 工程 |
| business-clean | business-clean, 商务, 汇报 |
| xhs-soft | xhs-soft, xhs, 小红书 |
| cyberpunk-neon | cyberpunk-neon, cyber, 赛博, 霓虹 |
| minimal-light | minimal-light, minimal, 极简, 白底 |
| academic-paper | academic-paper, academic, 学术, 论文 |
| hand-drawn | hand-drawn, sketch, 手绘 |
| saas-modern | saas-modern, saas, SaaS, 产品页, 信息图, 商务渐变, GPT image |
| glassmorphism | glassmorphism, glass, 毛玻璃, iOS, Apple, 苹果 |
| linear-mode | linear-mode, linear, Linear |
| neo-brutalism | neo-brutalism, brutalism, brutal, 暴力美学, 厚描边 |

---

## 二、PPT 模式主题（36 个 themes-ppt）

运行 `/ai-draw --mode ppt` 时，按观众 + 场景推荐。完整文件位于 `assets/themes-ppt/`。

### 商务 / 投资人 / 路演

| 主题 | 一句话描述 |
|---|---|
| `pitch-deck-vc` ⭐ | YC 风白底 + 蓝紫渐变 accent + 大留白，融资路演首选 |
| `corporate-clean` | 纯白 + 海军蓝 + Inter，董事会 / B2B 销售 / 金融保险 |
| `swiss-grid` | 瑞士网格 + Helvetica 感 + 12 栏底纹，严肃排版 |
| `editorial-serif` | 杂志风 Playfair 衬线 + 奶油底，品牌故事 |
| `minimal-white` | 极简白，Inter，极低阴影，内部汇报不抢内容 |

### 技术 / 工程 / 分享

| 主题 | 一句话描述 |
|---|---|
| `tokyo-night` ⭐ | Tokyo Night 蓝夜，偏冷技术分享 / 基础设施 |
| `dracula` | 经典 Dracula 紫红，代码密集的技术分享 |
| `catppuccin-mocha` | catppuccin 深色，开发者内部分享 / 长时间观看 |
| `catppuccin-latte` | catppuccin 浅色，开发者极客友好的技术分享 |
| `terminal-green` | 绿屏终端 + 等宽 + 发光文字，CLI / 复古朋克 |
| `blueprint` | 蓝图工程 + 网格底纹 + 蒙太奇字体，系统架构 / 工程蓝图 |
| `nord` | 北欧清冷蓝白，基础设施 / 云产品 |
| `gruvbox-dark` | 温暖复古深色，Terminal / vim / *nix 社群 |
| `solarized-light` | 经典低眩光配色，长时间观看的工作坊 / 教学 |
| `rose-pine` | 玫瑰松柔和暗色，设计+开发交界审美向 |

### 小红书 / 卡片 / 营销

| 主题 | 一句话描述 |
|---|---|
| `xiaohongshu-white` ⭐ | 小红书白底 + 暖红 accent + 衬线标题 |
| `soft-pastel` | 柔和马卡龙三色渐变，产品发布 / 面向消费者 |
| `magazine-bold` | 奶油底 + 超大 Playfair + 橙色 spot，专栏封面 / 品牌月刊 |
| `rainbow-gradient` | 白底 + 彩虹流动渐变 accent，欢乐向 / 节日 / 庆祝 |
| `aurora` | 极光渐变 + blur + saturate，封面 / CTA / 结语页 |
| `sunset-warm` | 橘/珊瑚/琥珀三色渐变，生活方式 / 情绪正向 |
| `arctic-cool` | 蓝/青/石板灰浅色版，商业分析 / 金融 / 冷静理性 |

### 学术 / 报告 / 论文

| 主题 | 一句话描述 |
|---|---|
| `academic-paper` ⭐ | 论文白 + 衬线正文 + 黑墨 + 蓝链接 |
| `editorial-serif` | 杂志风 Playfair 衬线，文字密度大的长文演讲 |
| `minimal-white` | 极简白，内部汇报 / 技术评审不抢内容 |
| `engineering-whiteprint` | 白底 + 坐标纸网格 + 海军墨线 + 等宽字，API 文档 / 架构白皮书 |
| `news-broadcast` | 白底 + 红色竖条 + Oswald 大写 + 硬阴影，数据播报 / 新闻风 |

### 赛博 / 强烈 / 发布会

| 主题 | 一句话描述 |
|---|---|
| `cyberpunk-neon` ⭐ | 纯黑 + 霓虹粉青黄 + 发光 + JetBrains Mono，黑客 / 赛博 talk |
| `vaporwave` | 深紫 + 粉红青蓝渐变 + 晕染光斑，潮流艺术 / A E S T H E T I C |
| `y2k-chrome` | 银铬渐变 + 彩虹 accent + 大圆角 + Space Grotesk，千禧怀旧 / Gen-Z |
| `neo-brutalism` | 厚描边 + 硬阴影 + 明黄 accent，创业路演 / 敢说敢做 |
| `retro-tv` | 暖奶油 + CRT 扫描线 + 琥珀橙 accent，怀旧叙事 / 八九十年代 |

### 极简 / 克制

| 主题 | 一句话描述 |
|---|---|
| `minimal-white` ⭐ | 极简白，无强调色无阴影，内容优先 |
| `swiss-grid` | 瑞士网格，严肃排版设计 |
| `japanese-minimal` | 象牙白 + 朱红 accent + 极大留白 + Noto Serif，禅意叙事 |
| `sharp-mono` | 纯黑白 + Archivo Black + 硬阴影，宣言类极具冲击力视觉 |

### 设计师 / 创意

| 主题 | 一句话描述 |
|---|---|
| `bauhaus` ⭐ | 几何 + 红黄蓝原色，设计 talk / 艺术史 / 产品美学 |
| `memphis-pop` | 孟菲斯波普背景点 + 大字标题，年轻 / 潮流 / 品牌合作 |
| `midcentury` | 奶油底 + 芥末/青/焦橙 + 锐利几何，设计史 / 家居美学 / 复古品牌 |
| `glassmorphism` | 毛玻璃 + 多色光斑背景，Apple 式发布会 / 产品特性展示 |

---

## 三、PPT 主题显式覆盖关键词

用户 prompt 中包含主题名（不区分大小写）或下列别名时，跳过推荐直接锁定：

| 锁定主题 | 别名 |
|---|---|
| tokyo-night | tokyo, tokyo-night, 蓝夜 |
| dracula | dracula, 吸血鬼 |
| catppuccin-mocha | catppuccin-mocha, mocha, catppuccin |
| catppuccin-latte | catppuccin-latte, latte |
| terminal-green | terminal-green, terminal, 绿屏 |
| blueprint | blueprint, 蓝图 |
| minimal-white | minimal-white, minimal, 极简, 白底 |
| corporate-clean | corporate-clean, corporate, 商务, 汇报 |
| pitch-deck-vc | pitch-deck-vc, pitch, vc, 路演 |
| academic-paper | academic-paper, academic, 学术, 论文 |
| cyberpunk-neon | cyberpunk-neon, cyber, 赛博, 霓虹 |
| vaporwave | vaporwave, vapor |
| y2k-chrome | y2k, chrome |
| neo-brutalism | neo-brutalism, brutalism, 暴力美学 |
| xiaohongshu-white | xiaohongshu-white, xiaohongshu, xhs, 小红书 |
| soft-pastel | soft-pastel, pastel, 马卡龙, 柔色 |
| swiss-grid | swiss-grid, swiss, 瑞士 |
| editorial-serif | editorial-serif, editorial, 衬线 |
| aurora | aurora, 极光 |
| glassmorphism | glassmorphism, glass, 毛玻璃 |
| bauhaus | bauhaus, 包豪斯 |

---

## 四、跨模式说明（混合 slide token 可用性）

当 PPT 模式的某张 slide 需要嵌入画图（如架构图、流程图），嵌入图继承当前 PPT 主题的以下 token：

**PPT 主题保证提供（可安全使用）：**

```css
--bg          /* 背景色 */
--bg-soft     /* 次级背景 */
--surface     /* 卡片 / 面板背景 */
--text-1      /* 主要文字 */
--text-2      /* 次要文字 */
--accent      /* 主强调色 */
--accent-2    /* 第二强调色 */
--accent-3    /* 第三强调色 */
--border      /* 边框色 */
```

**画图专属 token（PPT 主题不定义，不可依赖）：**

```css
--sem-frontend   /* 画图语义：前端层 */
--sem-backend    /* 画图语义：后端层 */
--sem-db         /* 画图语义：数据库 */
--sem-cache      /* 画图语义：缓存 */
--sem-queue      /* 画图语义：消息队列 */
--sem-external   /* 画图语义：外部系统 */
```

处理策略：混合 slide 中的嵌入图应退化为单一 accent 色区分节点类型，或使用固定颜色值（不依赖 `--sem-*`）。如用户要求精确语义色，建议改用单图模式（画图路由）再截图嵌入 PPT。
