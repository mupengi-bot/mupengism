#!/bin/bash
# npm-tracker: npm 패키지 다운로드 수 추적
# Usage: ./run.sh [package] [period]
# period: last-day, last-week, last-month

WORKSPACE="${WORKSPACE:-$HOME/.openclaw/workspace}"
EVENTS_DIR="${EVENTS_DIR:-$WORKSPACE/events}"
TRACK_DIR="$WORKSPACE/memory/npm-stats"
mkdir -p "$TRACK_DIR" "$EVENTS_DIR"

PACKAGE="${1:-mupengism}"
PERIOD="${2:-last-week}"
DATE=$(date +%Y-%m-%d)

# npm API 호출
RESPONSE=$(curl -s "https://api.npmjs.org/downloads/point/$PERIOD/$PACKAGE" 2>/dev/null)
DOWNLOADS=$(echo "$RESPONSE" | grep -o '"downloads":[0-9]*' | cut -d: -f2)
START=$(echo "$RESPONSE" | grep -o '"start":"[^"]*"' | cut -d'"' -f4)
END=$(echo "$RESPONSE" | grep -o '"end":"[^"]*"' | cut -d'"' -f4)

if [ -z "$DOWNLOADS" ]; then
  echo "❌ 패키지 '$PACKAGE' 데이터를 가져올 수 없습니다"
  exit 1
fi

# 일별 추이 (last-week 상세)
DAILY=$(curl -s "https://api.npmjs.org/downloads/range/$PERIOD/$PACKAGE" 2>/dev/null)

# npm 패키지 정보
PKG_INFO=$(curl -s "https://registry.npmjs.org/$PACKAGE/latest" 2>/dev/null)
VERSION=$(echo "$PKG_INFO" | grep -o '"version":"[^"]*"' | head -1 | cut -d'"' -f4)

# 결과 출력
echo "📦 $PACKAGE@$VERSION"
echo "📊 기간: $START ~ $END ($PERIOD)"
echo "⬇️  다운로드: $DOWNLOADS"
echo ""

# 일별 상세 (있으면)
if echo "$DAILY" | grep -q '"downloads"'; then
  echo "📈 일별 추이:"
  echo "$DAILY" | grep -o '"day":"[^"]*","downloads":[0-9]*' | while IFS= read -r line; do
    day=$(echo "$line" | grep -o '"day":"[^"]*"' | cut -d'"' -f4)
    dl=$(echo "$line" | grep -o '"downloads":[0-9]*' | cut -d: -f2)
    bar=$(printf '%*s' $((dl / 50)) '' | tr ' ' '█')
    echo "  $day: $dl $bar"
  done
  echo ""
fi

# 이전 기록 비교
PREV_FILE="$TRACK_DIR/${PACKAGE}-prev.txt"
if [ -f "$PREV_FILE" ]; then
  PREV_DL=$(cat "$PREV_FILE")
  DIFF=$((DOWNLOADS - PREV_DL))
  if [ "$DIFF" -gt 0 ]; then
    echo "📈 이전 대비: +$DIFF (${PREV_DL} → ${DOWNLOADS})"
  elif [ "$DIFF" -lt 0 ]; then
    echo "📉 이전 대비: $DIFF (${PREV_DL} → ${DOWNLOADS})"
  else
    echo "➡️  이전과 동일: $DOWNLOADS"
  fi
else
  echo "📝 첫 추적 (비교 데이터 없음)"
fi

# 현재 값 저장
echo "$DOWNLOADS" > "$PREV_FILE"

# 히스토리 저장
echo "$DATE,$PERIOD,$DOWNLOADS" >> "$TRACK_DIR/${PACKAGE}-history.csv"

# 이벤트 생성
cat > "$EVENTS_DIR/npm-stats-$DATE.json" << EVEOF
{
  "type": "npm-stats",
  "source": "npm-tracker",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "data": {
    "package": "$PACKAGE",
    "period": "$PERIOD",
    "downloads": $DOWNLOADS,
    "version": "$VERSION",
    "start": "$START",
    "end": "$END"
  },
  "consumers": ["daily-report", "notification-hub"]
}
EVEOF

echo ""
echo "✅ 저장: $TRACK_DIR/${PACKAGE}-history.csv"
