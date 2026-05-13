# diagrams/flowchart/ — INSTRUCTIONS

Replace `{{MERMAID_SOURCE}}` (twice — once in the `<pre class="mermaid">`, once in the `<details>`) with a Mermaid `graph` definition.

## Cheat sheet

```mermaid
graph TD
  A[开始] --> B{条件判断}
  B -->|是| C[做这件事]
  B -->|否| D[做另一件事]
  C --> E[结束]
  D --> E
```

- `graph TD` = top-down; `graph LR` = left-right; `graph BT` / `RL` also valid
- `A[文本]` = rectangle; `A(文本)` = rounded; `A{文本}` = diamond (decision); `A((文本))` = circle
- `-->` = arrow; `-.->` = dashed; `==>` = thick; `-->|label|` = labeled
- `subgraph 名称 ... end` to group nodes

## Layout direction

- Default to `TD` for short flows (≤ 8 steps)
- Use `LR` for longer chains or many parallel branches
- For a state machine, use `stateDiagram-v2` instead — it's a different Mermaid keyword:

```mermaid
stateDiagram-v2
  [*] --> Pending
  Pending --> Paid: pay()
  Pending --> Cancelled: cancel()
  Paid --> Shipped: ship()
  Shipped --> [*]
```

## Limits

- ≤ 50 nodes works well; 100+ may render slowly
- Prefer multiple small flowcharts (and a deck) over one huge one
