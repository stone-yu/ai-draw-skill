# diagrams/er/ — INSTRUCTIONS

Replace `{{MERMAID_SOURCE}}` (twice) with a Mermaid `erDiagram`.

## Cheat sheet

```mermaid
erDiagram
  USER ||--o{ ORDER : "places"
  ORDER ||--|{ ORDER_ITEM : "contains"
  PRODUCT ||--o{ ORDER_ITEM : "in"

  USER {
    bigint id PK
    string email
    string name
    timestamp created_at
  }
  ORDER {
    bigint id PK
    bigint user_id FK
    decimal total
    string status
  }
```

- Cardinality:
  - `||--||` exactly one to exactly one
  - `||--o{` one to zero-or-many
  - `}|--|{` many-to-many (mandatory)
  - `}o--o{` many-to-many (optional)
- Inside `{ }`: `type name PK|FK|UK` (one per line)
