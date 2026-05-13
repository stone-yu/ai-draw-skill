# references/themes.md — theme picker decision table

When the user runs `/ai-draw <需求>`, you (Claude) recommend 3 themes from the 8-theme catalog. Use the table below: read the user's request, find the row whose keywords best match the **tone** of the ask (NOT the diagram type), and offer those 3 themes with the ⭐ first.

| User tone / keywords (中 + EN) | ① ⭐ | ② | ③ |
|---|---|---|---|
| 技术分享 / 内部分享 / 架构 / 微服务 / tech share / engineering | tech-dark | blueprint | cyberpunk-neon |
| 蓝图 / 工程图 / blueprint / CI/CD / pipeline | blueprint | tech-dark | minimal-light |
| 客户汇报 / 商务 / 对外 / formal / 董事会 / executive | business-clean | minimal-light | academic-paper |
| 小红书 / 分享卡片 / xhs / 卡片风 / soft / 温暖 | xhs-soft | hand-drawn | minimal-light |
| cyber / 赛博 / 霓虹 / futuristic / 产品发布 / launch | cyberpunk-neon | tech-dark | blueprint |
| 极简 / minimal / 白底 / 性冷淡 / clean | minimal-light | academic-paper | business-clean |
| 学术 / 论文 / 报告 / academic / paper / conference | academic-paper | minimal-light | business-clean |
| 草稿 / 手绘 / sketch / 白板 / wireframe / brainstorm | hand-drawn | minimal-light | xhs-soft |
| **None of the above (fallback)** | tech-dark | minimal-light | business-clean |

## Theme one-liners (for the recommendation prompt)

- **tech-dark** — 暗色技术风，slate-950 + 青/紫/翠语义色，JetBrains Mono
- **blueprint** — 蓝图工程风，深蓝 + 白色细线 + 密网格
- **business-clean** — 商务正式，米白 + 沉稳蓝/绿，Inter
- **xhs-soft** — 小红书柔色卡片，奶白 + 粉橙 + 大圆角
- **cyberpunk-neon** — 赛博朋克霓虹，纯黑 + 品红/青/黄发光
- **minimal-light** — 极简白纸，纯白 + 黑线，无强调色无阴影
- **academic-paper** — 学术论文，象牙白 + Source Serif + 灰线条
- **hand-drawn** — 手绘草图，米黄 + Caveat 字体 + rough.js 抖动笔触

## Compatibility hints (soft warning, don't block)

If the user combination falls into a ⚠️ cell below, mention it once before generating:

> "你选了 **cyberpunk-neon × 类图** — 霓虹风跟 OO 类图的严肃感不太搭，要不要换 **business-clean** 或 **minimal-light**？或者就这样？"

| Theme \ Type | arch | KG | flow | seq | mind | class | er |
|---|---|---|---|---|---|---|---|
| tech-dark | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| blueprint | ✅ | ⚠️ | ✅ | ✅ | ✅ | ✅ | ✅ |
| business-clean | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| xhs-soft | ⚠️ | ✅ | ✅ | ⚠️ | ✅ | ⚠️ | ⚠️ |
| cyberpunk-neon | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ |
| minimal-light | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| academic-paper | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ |
| hand-drawn | ✅ | ✅ | ✅ | ✅ | ⭐ | ⚠️ | ⚠️ |

## Explicit override keywords

If the user's prompt contains an exact theme name (case-insensitive) or one of these aliases, **skip the recommendation** and lock that theme:

| Lock theme | Aliases |
|---|---|
| tech-dark | tech-dark, dark, 暗色, 黑色 |
| blueprint | blueprint, 蓝图, 工程 |
| business-clean | business-clean, 商务, 汇报 |
| xhs-soft | xhs-soft, xhs, 小红书 |
| cyberpunk-neon | cyberpunk-neon, cyber, 赛博, 霓虹 |
| minimal-light | minimal-light, minimal, 极简, 白底 |
| academic-paper | academic-paper, academic, 学术, 论文 |
| hand-drawn | hand-drawn, sketch, 手绘 |
