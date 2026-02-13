---
name: insta-post
description: Upload Instagram posts via browser automation. Use when uploading images to Instagram, creating Instagram posts, or automating Instagram content publishing. Handles image upload, caption entry, collaborator tagging, and sharing through the OpenClaw browser tool connected to an active Instagram session.
author: 무펭이 🐧
---

# Instagram Post Upload 🐧

Upload images as Instagram posts via OpenClaw browser tool (CDP port 18800).

## Prerequisites

- OpenClaw browser running (port 18800)
- Instagram tab open and logged in
- Images in **JPG format** (PNG causes "문제가 발생했습니다" errors)

## Quick Upload

For simple posts, use the bundled script:

```bash
node <skill-dir>/scripts/post.sh "<image_paths_comma_separated>" "<caption>"
```

## Browser Tool Method (Recommended)

### Step-by-step flow:

1. **Snapshot** — `browser snapshot` to find the Instagram tab. Save `targetId`.

2. **Close any dialogs** — If settings/menus are open, press ESC or click outside.

3. **Click "만들기"** — Find "새로운 게시물 만들기" or "만들기" in sidebar. Click it.

4. **Upload image** — Find `input[type=file]` via evaluate:
   ```js
   document.querySelectorAll('input[type="file"]')
   ```
   Use the last one (usually index 2, accepts video+image). Upload via `browser upload`.

5. **Wait 5 seconds** — Let the image load.

6. **Click "다음"** — Crop screen → Next.

7. **Click "다음"** — Filter screen → Next.

8. **Type caption** — Find textarea with `aria-label="문구 입력..."`, click it, then type.

9. **Add collaborators** (optional) — Before sharing:
   - Click "사람 태그하기" or collaborator section
   - Search and add your team account usernames

10. **Click "공유하기"** — Submit the post.

11. **Verify** — Wait for "게시물이 공유되었습니다" confirmation.

## Image Preparation

- **Format**: JPG only. Convert PNG: `convert input.png -quality 92 output.jpg`
- **Size**: 1024x1024 or 1080x1080 recommended
- **Multiple images**: Upload multiple files to the same input for carousel

## Collaborator Tagging

Configure your default collaborators in your workspace `TOOLS.md` file.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "문제가 발생했습니다" | Convert PNG→JPG, refresh browser |
| act timeout | Re-snapshot, re-confirm refs |
| Settings dialog open | Press ESC or click outside |
| File input not found | Re-click "만들기" button |
| Caption won't type | Click textarea first, then type |
| Wrong element clicked | Always snapshot before clicking, verify ref |

---
> 🐧 Built by **무펭이** — [무펭이즘(Mupengism)](https://github.com/mupeng) 생태계 스킬
