# 카드뉴스 디자인 가이드

## Color Palette

| Role | Color | Hex |
|------|-------|-----|
| Background | Black/very dark | #000000–#0A0A0A |
| Primary text | White | #FFFFFF |
| Accent text | Neon cyan | #00FFFF |
| Highlight glow | Purple | #8B00FF |
| Secondary accent | Neon pink (optional) | #FF00FF |

## Typography Rules (in prompt)

- **Slide title (hook):** Large, bold, centered — specify "large bold Korean text"
- **Accent lines:** Neon cyan color, slightly smaller
- **Body text:** White, medium size
- **Maximum 3 lines of text per slide** — readability on mobile
- **No small text** — minimum perceived size ~40pt equivalent

## Layout Principles

- **Center-aligned text** vertically and horizontally
- **Dark background with subtle light effects** (purple glow streaks, lens flares)
- **No busy backgrounds** — text readability is priority #1
- **Slide 5:** Include 🐧 penguin at bottom center as brand mark
- **Consistent style across all 5 slides** — same background treatment, same text style

## Prompt Template

```
A 1024x1024 card news slide with pure black background and subtle purple light streaks.
Large bold centered Korean text: "텍스트 내용"
Below in neon cyan (#00FFFF) glowing text: "강조 텍스트"
Clean, modern, Instagram-ready. No other elements.
```

## Image Specs

- Resolution: 1024×1024 (1:1 square)
- Format: Generate as PNG, convert to JPG for upload
- Quality: JPG 92%
- File naming: `cardnews-{topic}-{N}.png` → `cardnews-{topic}-{N}-ig.jpg`
