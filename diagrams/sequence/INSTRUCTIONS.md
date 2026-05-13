# diagrams/sequence/ — INSTRUCTIONS

Replace `{{MERMAID_SOURCE}}` (twice) with a Mermaid `sequenceDiagram`.

## Cheat sheet

```mermaid
sequenceDiagram
  autonumber
  participant U as User
  participant W as Web
  participant API as OrderService
  participant DB as PostgreSQL

  U->>W: click "Place Order"
  W->>API: POST /orders
  activate API
  API->>DB: INSERT order
  DB-->>API: order_id
  API-->>W: 201 Created
  deactivate API
  W-->>U: show success page
```

- `participant X as Label` declares (left to right)
- `->>`  = solid arrow with arrowhead; `-->>`  = dashed
- `activate` / `deactivate` show lifecycle bars
- `Note over A,B: text` for annotations
- `loop`, `alt`/`else`, `par`/`and` for control flow

## Limits

- 3-7 participants works best; 10+ becomes hard to read — split into multiple sequence diagrams (and a deck)
