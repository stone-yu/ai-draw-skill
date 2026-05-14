# saas-modern visual richness preset

When the chosen theme is **saas-modern**, the default §1-7 patterns in `INSTRUCTIONS.md` produce a too-spartan look. This preset replaces the plain `rect + text` component pattern with the richer "GPT Image 2.0 / SaaS product page" style: **icon badges, multi-color groupings, pill section headers, decorative title, gradient CTAs**.

This is an **opt-in** enrichment — only apply when the user selected `saas-modern`. Other themes (tech-dark / blueprint / etc.) keep using §1-7.

---

## 0. Required `<defs>` (paste once into the SVG)

Every saas-modern diagram needs these gradients + filters available:

```html
<defs>
  <linearGradient id="grad-blue" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="#3b5cff"/><stop offset="100%" stop-color="#8b5cf6"/>
  </linearGradient>
  <linearGradient id="grad-purple" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="#8b5cf6"/><stop offset="100%" stop-color="#6366f1"/>
  </linearGradient>
  <linearGradient id="grad-orange" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="#fb923c"/><stop offset="100%" stop-color="#f97316"/>
  </linearGradient>
  <linearGradient id="grad-purple-pink" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="#a855f7"/><stop offset="100%" stop-color="#ec4899"/>
  </linearGradient>
  <marker id="arrow-blue" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
    <polygon points="0 0, 10 4, 0 8" fill="#3b5cff"/>
  </marker>
  <marker id="arrow-purple" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
    <polygon points="0 0, 10 4, 0 8" fill="#8b5cf6"/>
  </marker>
  <marker id="arrow-dark" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
    <polygon points="0 0, 10 4, 0 8" fill="#475569"/>
  </marker>
  <filter id="soft-shadow" x="-10%" y="-10%" width="120%" height="120%">
    <feDropShadow dx="0" dy="2" stdDeviation="6" flood-color="#3b5cff" flood-opacity="0.08"/>
  </filter>
  <filter id="card-shadow" x="-5%" y="-5%" width="110%" height="115%">
    <feDropShadow dx="0" dy="4" stdDeviation="12" flood-color="#3b5cff" flood-opacity="0.10"/>
  </filter>
</defs>
```

---

## 1. Pastel palette table (memorize)

Each "color slot" has a **deep** stroke/text variant and a **pastel** fill variant. Always pair them.

| 色名 | 深色 (stroke / text / pill) | 浅色 (badge / sub-card fill) |
|---|---|---|
| 蓝 | `#3b5cff` | `#dbeafe` |
| 紫 | `#8b5cf6` | `#ede9fe` |
| 青 | `#06b6d4` | `#cffafe` |
| 橙 | `#f97316` | `#ffedd5` |
| 粉 | `#ec4899` | `#fce7f3` |
| 金 | `#f59e0b` | `#fef3c7` |
| 绿 | `#22c55e` | `#dcfce7` |
| 红 | `#ef4444` | `#fee2e2` |

Rule of thumb: **rotate** through 4-8 of these for sibling items (list rows, sub-cards). Don't use the same color for every item — that's what makes the diagram look "single-color SaaS template."

---

## 2. Icon badge for list items (replaces `<circle r=6>`)

Every list / outline / column item gets a **32×32 rounded badge with pastel fill + emoji**, not a plain dot:

```html
<!-- card row -->
<rect x="60" y="170" width="240" height="58" rx="14" fill="#ffffff" 
      stroke="#e2e8f0" stroke-width="1" filter="url(#soft-shadow)"/>
<!-- 32x32 pastel badge -->
<rect x="74" y="183" width="32" height="32" rx="10" fill="#dbeafe"/>
<text x="90" y="206" font-size="18" text-anchor="middle">📋</text>
<!-- label -->
<text x="120" y="205" fill="#0f172a" font-size="14" font-weight="600">领域业务介绍</text>
```

Emoji selection guide:

| 内容语义 | emoji 建议 |
|---|---|
| 文档 / 介绍 / 背景 | 📋 📄 📚 📖 |
| 数据 / 语义 / 名词 | 💬 🏷️ 🔤 📝 |
| 关系 / 链路 / 拓扑 | 🔗 🔄 🌐 🧩 |
| 接口 / IO / 集成 | 🔌 📡 ⚡ 🎯 |
| 经验 / 隐式 / 洞察 | 💡 🧠 ⭐ 🔍 |
| 规范 / 约束 / 安全 | 📐 📏 🛡️ 🔒 |
| 代码 / 工程 | `</>` (text) 💻 ⚙️ 🔧 |
| 流量 / 渠道 / 分发 | 🚀 📢 🔲 📣 |
| 业务实体 / 域 | 🛒 (订单) 🚚 (配送) 🏪 (商户) 👤 (用户) |
| 流程节点 (产品) | 📦 (需求) 📋 (PRD) 🎯 (澄清) 🧪 (测试) |
| 完结 / 复盘 | ✓ 🎉 ✅ |

If unsure: pick the most domain-specific emoji available, fallback to ⭐ / 🔵.

---

## 3. Section header pill (replaces plain `<text>` heading)

```html
<rect x="60" y="110" width="240" height="40" rx="20" fill="#3b5cff" 
      filter="url(#soft-shadow)"/>
<text x="180" y="135" fill="#ffffff" font-size="15" font-weight="700" 
      text-anchor="middle">知识库内容</text>
```

Color the pill by section semantic: input/source → 蓝; processing/middle → 紫; output/flow → 橙.

---

## 4. Decorative title bar (replaces flat title)

```html
<!-- Left line + dot (blue side) -->
<circle cx="500" cy="46" r="4" fill="#3b5cff"/>
<line x1="510" y1="46" x2="600" y2="46" stroke="url(#grad-blue)" 
      stroke-width="2" stroke-linecap="round"/>
<!-- Title text -->
<text x="740" y="54" fill="#0f172a" font-size="28" font-weight="800"
      text-anchor="middle" letter-spacing="-0.01em">{{TITLE}}</text>
<!-- Right line + dot (orange side) -->
<line x1="880" y1="46" x2="970" y2="46" stroke="url(#grad-orange)" 
      stroke-width="2" stroke-linecap="round"/>
<circle cx="980" cy="46" r="4" fill="#f97316"/>
<!-- Optional underline accent -->
<rect x="710" y="68" width="60" height="3" rx="1.5" fill="url(#grad-blue)"/>
```

---

## 5. Big rounded section card (groups content within a column)

```html
<rect x="350" y="100" width="700" height="430" rx="22" 
      fill="#eef3ff" stroke="#c7d2fe" stroke-width="1.5" 
      filter="url(#card-shadow)"/>
```

- `rx=22` (extra large rounding — distinguishes from per-item `rx=14`)
- Light pastel fill matching the section's dominant color
- Soft matching stroke (lighter shade of the same color family)

---

## 6. Multi-color sub-cards in a row (peer entities)

When showing 3-6 peer entities (e.g. 订单域 / 配送域 / 商户域 / 渠道域), **each card gets a different color** from §1 palette:

```html
<!-- Card 1 — 蓝 -->
<rect x="370" y="296" width="150" height="68" rx="14" fill="#ffffff" 
      stroke="#dbeafe" stroke-width="1.5" filter="url(#soft-shadow)"/>
<rect x="386" y="312" width="36" height="36" rx="10" fill="#dbeafe"/>
<text x="404" y="338" font-size="20" text-anchor="middle">🛒</text>
<text x="431" y="337" fill="#0f172a" font-size="14" font-weight="700">订单域</text>

<!-- Card 2 — 青 -->
<rect x="530" y="296" width="150" height="68" rx="14" fill="#ffffff" 
      stroke="#cffafe" stroke-width="1.5" filter="url(#soft-shadow)"/>
<rect x="546" y="312" width="36" height="36" rx="10" fill="#cffafe"/>
<text x="564" y="338" font-size="20" text-anchor="middle">🚚</text>
<text x="591" y="337" fill="#0f172a" font-size="14" font-weight="700">配送域</text>
<!-- ...etc -->
```

---

## 7. Cross-column arrows with pill labels

Default architecture arrows are thin grey lines. saas-modern uses **gradient-stroked lines with pill labels above + descriptor below**:

**Forward (apply / use) — solid gradient:**
```html
<line x1="1055" y1="200" x2="1095" y2="200" stroke="url(#grad-blue)" 
      stroke-width="3" marker-end="url(#arrow-blue)" stroke-linecap="round"/>
<rect x="1055" y="155" width="50" height="22" rx="11" fill="#3b5cff"/>
<text x="1080" y="171" fill="#ffffff" font-size="11" font-weight="700" 
      text-anchor="middle">应用</text>
<text x="1080" y="225" fill="#3b5cff" font-size="11" font-weight="700" 
      text-anchor="middle">AI → Skill 渐进式</text>
```

**Reverse (feedback / update) — dashed:**
```html
<line x1="1095" y1="296" x2="1055" y2="296" stroke="#a78bfa" stroke-width="2" 
      stroke-dasharray="5,4" marker-end="url(#arrow-purple)" stroke-linecap="round"/>
<rect x="1055" y="266" width="64" height="22" rx="11" fill="#a78bfa"/>
<text x="1087" y="282" fill="#ffffff" font-size="11" font-weight="700" 
      text-anchor="middle">更新知识库</text>
```

For vertical step-flow arrows (between sequential cards in a column), keep them simple grey with `arrow-dark` marker — don't make every arrow elaborate.

---

## 8. Dashed-border callout (for "key insight" / "rule" blocks)

When you have a sub-region that's a definition or rule (not a peer entity), use a dashed border + light pastel fill:

```html
<rect x="370" y="390" width="660" height="120" rx="16" fill="#ffffff" 
      stroke="#a78bfa" stroke-width="1.5" stroke-dasharray="6,4"/>
<rect x="388" y="408" width="40" height="40" rx="12" fill="#ede9fe"/>
<text x="408" y="437" font-size="22" text-anchor="middle">🚀</text>
<text x="442" y="430" fill="#3b5cff" font-size="15" font-weight="700">渐进式加载：</text>
<text x="558" y="430" fill="#0f172a" font-size="14">控制 AI 加载粒度</text>
```

---

## 9. Gradient CTA box (for emphasis API / capability / punchline)

When highlighting a specific call (e.g. "API 读取: graphify"):

```html
<rect x="370" y="790" width="660" height="80" rx="16" 
      fill="url(#grad-purple-pink)" filter="url(#soft-shadow)"/>
<rect x="390" y="810" width="44" height="44" rx="13" 
      fill="#ffffff" fill-opacity="0.25"/>
<text x="412" y="841" font-size="22" text-anchor="middle">⚡</text>
<text x="450" y="828" fill="#ffffff" font-size="15" font-weight="700">API 读取：</text>
<text x="535" y="828" fill="#ffffff" font-size="16" font-weight="800" 
      font-family="JetBrains Mono">graphify</text>
```

White text on gradient fill; 25% transparent white icon container.

---

## 10. Bottom summary band (optional, for "punchline")

A full-width gradient bar at the bottom synthesizes the diagram's takeaway:

```html
<rect x="60" y="970" width="1360" height="50" rx="14" 
      fill="url(#grad-blue)" filter="url(#soft-shadow)"/>
<text x="80" y="1002" fill="#ffffff" font-size="13" font-weight="700">双库互补</text>
<text x="160" y="1002" fill="#ffffff" fill-opacity="0.95" font-size="13">领域 KB → "是什么 / 为什么"</text>
<text x="440" y="1002" fill="#ffffff" fill-opacity="0.6" font-size="13">|</text>
<text x="460" y="1002" fill="#ffffff" fill-opacity="0.95" font-size="13">工程 KB → "在哪里 / 怎么实现"</text>
```

Use only when you have a clear 1-3 sentence takeaway. Skip if it would feel forced.

---

## Anti-patterns (what NOT to do with saas-modern)

- ❌ Single-color throughout — defeats the "multi-color SaaS" feel. Always rotate ≥ 4 colors.
- ❌ Plain `<circle r=6>` bullets — every list item needs an emoji badge.
- ❌ All sub-cards identical color — peer entities must visually differentiate.
- ❌ Dark background — saas-modern is light-first. If you need dark sections, use translucent overlays on light.
- ❌ Skipping the gradient defs — every saas-modern diagram needs §0's `<defs>` block, even if you only use one gradient.
- ❌ Mixing this preset with tech-dark — these patterns are saas-modern only. Other themes use §1-7 of INSTRUCTIONS.md.

---

## When to apply this preset

| Trigger | Apply preset? |
|---|---|
| User selected `saas-modern` theme | **Yes — full preset** |
| User mentioned "SaaS / 产品页 / 营销信息图 / GPT image" | **Yes — full preset** |
| User selected `business-clean` | **Partial — only §2 (icon badges) + §3 (header pills)** |
| User selected `tech-dark` / `blueprint` / `cyberpunk-neon` | **No — follow INSTRUCTIONS §1-7** |
| Diagram type is `class` / `er` | **No — too structured for badges** |

---

## Reference

A complete worked example in this style:
`/Users/yulixing/workspace/temp/ai-draw-out/knowledge-base-sdlc-saas-modern-v2/index.html`
（领域知识库 + 工程知识库 · AI-SDLC 流程，含 §0-10 全部模式实例）
