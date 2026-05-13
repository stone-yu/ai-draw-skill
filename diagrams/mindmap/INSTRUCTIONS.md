# diagrams/mindmap/ — INSTRUCTIONS

Replace `{{MARKDOWN_SOURCE}}` with a nested Markdown outline. Markmap renders it as a radial mind map.

## Format

```markdown
# 中心主题
## 一级分支 A
- 二级要点
- 二级要点
  - 三级
## 一级分支 B
- 二级要点
## 一级分支 C
- 二级要点
- 二级要点
- 二级要点
```

- The `# H1` is the root (single)
- `## H2` are first-level branches
- `- bullets` go deeper
- Nesting matters — indent with 2 spaces

## Tips

- Aim for **3-7 H2 branches** per mind map (radial layout looks best with this fan-out)
- Each branch should have **2-5 leaves**
- For deeper trees (50+ nodes), consider splitting into multiple mind maps

## Recommended themes

`hand-drawn` is the default and looks best for mind maps. `xhs-soft` and `minimal-light` are good alternatives. Avoid `cyberpunk-neon` and `academic-paper` (compatibility matrix flags them).
