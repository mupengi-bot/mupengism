#!/bin/bash
# translate/run.sh
# 다국어 번역 (하이브리드: 전처리 + 프롬프트 템플릿 생성)

set -e

WORKSPACE="${WORKSPACE:-$HOME/.openclaw/workspace}"

FROM_LANG="auto"
TO_LANG="en"
MODE="natural"
TEXT=""
FILE=""

# 인자 파싱
while [[ $# -gt 0 ]]; do
  case "$1" in
    --from)
      FROM_LANG="$2"
      shift 2
      ;;
    --to)
      TO_LANG="$2"
      shift 2
      ;;
    --mode)
      MODE="$2"
      shift 2
      ;;
    --text)
      TEXT="$2"
      shift 2
      ;;
    --file)
      FILE="$2"
      shift 2
      ;;
    *)
      echo "❌ 알 수 없는 옵션: $1"
      echo "사용법: run.sh --from LANG --to LANG --mode MODE [--text TEXT | --file FILE]"
      exit 1
      ;;
  esac
done

# 입력 소스 확인
if [ -z "$TEXT" ] && [ -z "$FILE" ]; then
  echo "❌ 번역할 텍스트 또는 파일이 필요합니다."
  echo "사용법: run.sh --from ko --to en --mode natural --text '텍스트'"
  echo "   또는: run.sh --from ko --to en --mode natural --file input.txt"
  exit 1
fi

# 파일 읽기
if [ -n "$FILE" ]; then
  if [ ! -f "$FILE" ]; then
    if [ ! -f "$WORKSPACE/$FILE" ]; then
      echo "❌ 파일을 찾을 수 없습니다: $FILE"
      exit 1
    fi
    FILE="$WORKSPACE/$FILE"
  fi
  TEXT=$(cat "$FILE")
fi

# 언어 코드 변환
case "$FROM_LANG" in
  ko|한국어) FROM_DISPLAY="Korean" ;;
  en|영어) FROM_DISPLAY="English" ;;
  ja|일본어) FROM_DISPLAY="Japanese" ;;
  zh|중국어) FROM_DISPLAY="Chinese" ;;
  auto) FROM_DISPLAY="auto-detected language" ;;
  *) FROM_DISPLAY="$FROM_LANG" ;;
esac

case "$TO_LANG" in
  ko|한국어) TO_DISPLAY="Korean" ;;
  en|영어) TO_DISPLAY="English" ;;
  ja|일본어) TO_DISPLAY="Japanese" ;;
  zh|중국어) TO_DISPLAY="Chinese" ;;
  *) TO_DISPLAY="$TO_LANG" ;;
esac

# 모드 설명
case "$MODE" in
  literal)
    MODE_DESC="Direct, literal translation preserving structure"
    ;;
  natural)
    MODE_DESC="Natural, fluent translation for readability"
    ;;
  localize)
    MODE_DESC="Cultural adaptation with localized idioms and tone"
    ;;
  *)
    MODE_DESC="$MODE"
    ;;
esac

# 번역 프롬프트 템플릿 생성
cat <<EOF
---
TRANSLATION REQUEST
---

Source Language: $FROM_DISPLAY
Target Language: $TO_DISPLAY
Mode: $MODE ($MODE_DESC)

---
SOURCE TEXT:
---

$TEXT

---
INSTRUCTIONS:
---

Translate the above text from $FROM_DISPLAY to $TO_DISPLAY using "$MODE" mode.

- **literal**: Preserve original structure, direct word-for-word translation
- **natural**: Translate for fluency and readability in target language
- **localize**: Adapt cultural context, idioms, and tone for native speakers

Preserve:
- Code blocks (\`\`\`)
- URLs and links
- Markdown formatting
- Technical terms (include original in parentheses if needed)

Output only the translated text, maintaining the original structure.

---
EOF

exit 0
