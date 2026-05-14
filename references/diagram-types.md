# references/diagram-types.md — diagram-type intent recognition

When the user runs `/ai-draw <需求>`, you (the agent) decide which `diagrams/<type>/` to dispatch into. Use the keyword tables below.

## Type → keyword table

| Type | Trigger keywords (中 + EN) |
|---|---|
| **architecture** | 架构 / 系统架构 / 部署 / 微服务 / 模块图 / 三层 / 服务依赖 / architecture / system / topology / deployment / infrastructure / cloud diagram |
| **knowledge-graph** | 图谱 / 知识图谱 / 概念图 / 关系网 / 引用网 / 节点+边 / knowledge graph / concept map / network / ontology |
| **flowchart** | 流程 / 流程图 / 工作流 / flow / flowchart / workflow / 怎么做 / 步骤 / process / steps / pipeline (logic) / decision tree |
| **sequence** | 时序 / 时序图 / 调用链 / 谁调谁 / 交互过程 / sequence / interaction / call chain / message flow |
| **mindmap** | 思维导图 / mind map / mindmap / 大纲 / outline / 分类 / brainstorm tree |
| **class** | 类图 / class diagram / OO / 继承 / inheritance / UML class |
| **er** | ER / ER 图 / 实体关系 / 数据模型 / 表关系 / entity relationship / database schema / data model |

## Disambiguation triggers

If **multiple types match**, ask the user. Common ambiguities:

| Both match | Ask |
|---|---|
| flowchart + state | "你想要 ① 流程图（顺序流，强调"走到下一步"）还是 ② 状态图（圆圈+箭头，强调"在哪个状态、能去哪个状态"）？" — note: state diagram uses Mermaid `stateDiagram-v2` inside the **flowchart** type folder |
| flowchart + sequence | "你想要 ① 流程图（强调步骤分支）还是 ② 时序图（强调谁调谁、消息往返）？" |
| architecture + knowledge-graph | "你想要 ① 架构图（手动布局，组件+连线，强调系统结构）还是 ② 知识图谱（自动力导向，强调关系密度）？" |
| class + er | "你想要 ① 类图（OO 继承/方法/属性）还是 ② ER 图（数据库表关系）？" |

## Single-image vs deck

Detect "many diagrams" cues to default to **deck mode**:

- The user lists multiple diagrams in one request ("微服务架构、调用时序、数据流流程")
- Words like "PPT", "deck", "分享稿", "演讲", "slides", "presentation"
- The user enumerates topics with ①②③ or 1./2./3.

Default for **single-diagram requests**: single-image mode. Ask "单图 / Deck？" only if intent is unclear.

## Plurality cues that DON'T mean deck

These are common false positives for "many":

- "包含 N 个组件" / "with N components" → still one diagram (the diagram has N components)
- "我们有 5 个微服务" → still one architecture diagram

## "新画图" vs "add to deck" vs "redo theme"

The trigger is the **command keyword**, not the request body:

- `/ai-draw <需求>` → new (creates a new dir)
- `/ai-draw add <需求>` → append to most-recent deck (`.ai-draw-state.json` lookup)
- `/ai-draw redo --style <theme>` → only swap the `theme-link` href in the most-recent output, no regeneration
- `/ai-draw export png` → run `scripts/render.sh` against most-recent output
- `/ai-draw list` → show contents of `./ai-draw-out/`
