---
name: cardnews
description: Generate Instagram-ready card news (카드뉴스) image sets. Use when creating a series of 5 slide images from a topic — includes content planning, image generation via nano-banana-pro, PNG→JPG conversion, caption writing, and Instagram upload preparation. Triggers on requests for card news, 카드뉴스, Instagram carousel posts, or slide-based visual content.
author: 무펭이 🐧
---

# Card News (카드뉴스) Pipeline 🐧

Topic → 5-slide plan → image generation → JPG conversion → caption → Instagram upload.

## Workflow

### 1. Content Planning

Given a topic, plan 5 slides:

| Slide | Role | Content |
|-------|------|---------|
| 1 | Hook | Bold question or surprising statement to stop scrolling |
| 2 | Problem/Context | Why this matters |
| 3 | Core insight | Key information or explanation |
| 4 | Detail/Example | Supporting evidence or practical example |
| 5 | CTA/Summary | Takeaway + follow/save prompt + 🐧 branding |

### 2. Image Generation (nano-banana-pro)

Generate each slide as 1024×1024 PNG using the nano-banana-pro skill:

```bash
# Path may vary based on installation
uv run <openclaw-install-dir>/skills/nano-banana-pro/scripts/generate_image.py \
  --prompt "<slide prompt>" --filename "cardnews-TOPIC-N.png" --resolution 1K
```

**Prompt structure per slide:**
- Include exact Korean text to render (in quotes)
- Specify: dark background, neon cyan (#00FFFF) accent text, white primary text
- Include 🐧 penguin emoji on slide 5
- No English unless the topic requires it

See `references/design-guide.md` for visual style rules.

### 3. PNG → JPG Conversion

Instagram rejects PNG frequently. Always convert:

```bash
python3 {baseDir}/scripts/convert_jpg.py cardnews-topic-1.png cardnews-topic-2.png ...
```

Outputs `*-ig.jpg` files (1024×1024, quality 92).

### 4. Caption Writing

Write an Instagram caption in Korean:
- 1-2 line hook matching slide 1
- 3-5 hashtags (mix of broad + niche)
- End with CTA: "저장하고 나중에 다시 보세요 📌"

### 5. Instagram Upload

Use the browser-based upload flow documented in TOOLS.md ("인스타그램 게시물 업로드" section). Upload all 5 JPG files as a carousel post.

---
> 🐧 Built by **무펭이** — [무펭이즘(Mupengism)](https://github.com/mupeng) 생태계 스킬
