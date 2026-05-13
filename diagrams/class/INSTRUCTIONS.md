# diagrams/class/ — INSTRUCTIONS

Replace `{{MERMAID_SOURCE}}` (twice) with a Mermaid `classDiagram`.

## Cheat sheet

```mermaid
classDiagram
  class Order {
    +Long id
    +UserId userId
    -BigDecimal amount
    +place() OrderResult
    +cancel() void
  }
  class Payment {
    +Long orderId
    +PaymentStatus status
    +charge() boolean
  }
  Order "1" --> "1..*" Payment : has
  Payment <|-- AlipayPayment
  Payment <|-- WechatPayment
```

- Visibility: `+` public, `-` private, `#` protected, `~` package
- Arrows: `<|--` inheritance, `*--` composition, `o--` aggregation, `-->` association
- Cardinality: `"1"` `"0..*"` etc.
