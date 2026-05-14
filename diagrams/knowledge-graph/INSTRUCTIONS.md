# diagrams/knowledge-graph/ — INSTRUCTIONS

You are filling in `template.html` for a knowledge graph (force-directed, D3).

## 1. Replace placeholders

| Placeholder | What goes here |
|---|---|
| `{{TITLE}}` (twice) | Diagram name, e.g. "微服务依赖图谱" |
| `{{SUBTITLE}}` | One-line context |
| `{{KG_DATA_JSON}}` | JSON object with `{nodes, edges}` (see §2) |

## 2. Data shape

```json
{
  "nodes": [
    { "id": "user-svc",    "label": "UserService" },
    { "id": "order-svc",   "label": "OrderService" },
    { "id": "postgres",    "label": "PostgreSQL" }
  ],
  "edges": [
    { "source": "order-svc", "target": "user-svc",  "relation": "calls" },
    { "source": "order-svc", "target": "postgres",  "relation": "writes" }
  ]
}
```

Embed it directly:
```html
window.KG_DATA = { "nodes": [...], "edges": [...] };
```

- `id` must be unique per node, kebab-case
- `label` is what the user sees
- `relation` is optional metadata (currently shown only on dblclick), use a verb

## 3. Scale guidance

| Node count | Action |
|---|---|
| 1 – 19 | Fine, but the user might want a flowchart instead — confirm |
| 20 – 300 | Sweet spot |
| > 300 | Stop and say: "300+ nodes is past what this template handles. Run the `graphifyy` Python tool from [fireworks-tech-graph](https://github.com/yizhiyanhua-ai/fireworks-tech-graph) to extract `graph.json`, then reuse our renderer by replacing the `KG_DATA` block with that JSON's `{nodes, links}` (rename `links` → `edges`)." |

## 4. v0.1 limitations (do NOT add these features yet)

- No community auto-grouping (`community` field is parsed but ignored — all nodes share `--node-fill` / `--node-stroke`)
- No edge labels rendered (only available on dblclick)
- No persistent layout (drag positions reset on reload)

If a user asks for any of these, tell them v0.1 doesn't support it and offer to do it manually for them in a single use of the tool.

## 5. Reference example

See `examples/microservices-deps.html`.
