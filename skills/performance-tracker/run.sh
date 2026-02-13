#!/bin/bash
# performance-tracker/run.sh
# SNS 성과 데이터 추적 및 분석

set -e

WORKSPACE="${WORKSPACE:-$HOME/.openclaw/workspace}"
MEMORY_DIR="${MEMORY_DIR:-$WORKSPACE/memory}"
PERF_DIR="$MEMORY_DIR/performance"
EVENTS_DIR="${EVENTS_DIR:-$WORKSPACE/events}"

# 디렉토리 생성
mkdir -p "$PERF_DIR"

# 인자 파싱
ACTION="summary"

while [[ $# -gt 0 ]]; do
  case $1 in
    --action)
      ACTION="$2"
      shift 2
      ;;
    *)
      # 첫 번째 인자를 액션으로 처리
      if [ "$1" != "--action" ]; then
        ACTION="$1"
      fi
      shift
      ;;
  esac
done

case "$ACTION" in
  summary)
    echo "📊 전체 성과 요약"
    echo ""
    
    # 파일 수 계산
    TOTAL_FILES=$(find "$PERF_DIR" -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
    
    echo "📁 전체 데이터 파일: $TOTAL_FILES개"
    echo ""
    
    # 최근 5개 파일 요약
    if [ "$TOTAL_FILES" -gt 0 ]; then
      echo "📝 최근 5개 데이터:"
      echo ""
      find "$PERF_DIR" -name "*.json" -type f | sort -r | head -5 | while read -r file; do
        basename=$(basename "$file")
        size=$(wc -c < "$file" | tr -d ' ')
        echo "  - $basename (${size} bytes)"
      done
    else
      echo "⚠️  성과 데이터가 없습니다."
      echo "데이터는 $PERF_DIR 에 저장됩니다."
    fi
    
    echo ""
    echo "{"
    echo "  \"total_files\": $TOTAL_FILES,"
    echo "  \"data_dir\": \"$PERF_DIR\","
    echo "  \"status\": \"ok\""
    echo "}"
    ;;
    
  weekly)
    echo "📅 주간 성과 리포트"
    echo ""
    
    # 이번 주 시작일 (월요일)
    WEEK_START=$(date -v-$(date +%u)d -v+1d +%Y-%m-%d 2>/dev/null || date -d "monday this week" +%Y-%m-%d)
    
    echo "🗓️  이번 주: $WEEK_START ~"
    echo ""
    
    # 이번 주 데이터 파일 찾기
    WEEK_FILES=$(find "$PERF_DIR" -name "*-$WEEK_START*.json" -o -name "*$(date +%Y-%m)*.json" 2>/dev/null | wc -l | tr -d ' ')
    
    if [ "$WEEK_FILES" -gt 0 ]; then
      echo "📁 이번 주 데이터: $WEEK_FILES개"
      find "$PERF_DIR" -name "*$(date +%Y-%m)*.json" 2>/dev/null | sort -r | head -7 | while read -r file; do
        echo "  - $(basename "$file")"
      done
    else
      echo "⚠️  이번 주 데이터가 없습니다."
    fi
    
    echo ""
    echo "{"
    echo "  \"week_start\": \"$WEEK_START\","
    echo "  \"files\": $WEEK_FILES,"
    echo "  \"status\": \"ok\""
    echo "}"
    ;;
    
  best)
    echo "🏆 베스트 성과"
    echo ""
    
    # JSON 파일들에서 likes 필드 추출 (가정: {"likes": 123} 형태)
    if [ -f "$PERF_DIR/instagram-"*.json ]; then
      echo "📈 인스타그램 베스트 (likes 기준):"
      echo ""
      
      # 간단한 JSON 파싱 (jq 없이)
      find "$PERF_DIR" -name "instagram-*.json" -type f | while read -r file; do
        if grep -q "likes" "$file" 2>/dev/null; then
          basename=$(basename "$file")
          echo "  - $basename"
        fi
      done | head -5
    else
      echo "⚠️  베스트 성과 데이터가 없습니다."
    fi
    
    echo ""
    echo "{"
    echo "  \"type\": \"best\","
    echo "  \"status\": \"ok\""
    echo "}"
    ;;
    
  worst)
    echo "📉 개선 필요 성과"
    echo ""
    
    echo "⚠️  worst 분석은 구현 예정입니다."
    echo "현재는 수동으로 memory/performance/ 파일을 확인하세요."
    
    echo ""
    echo "{"
    echo "  \"type\": \"worst\","
    echo "  \"status\": \"not_implemented\""
    echo "}"
    ;;
    
  *)
    echo "❌ 알 수 없는 액션: $ACTION"
    echo "사용법: run.sh --action [summary|weekly|best|worst]"
    exit 1
    ;;
esac

# 이벤트 발행
mkdir -p "$EVENTS_DIR"
EVENT_FILE="$EVENTS_DIR/performance-report-$(date +%s).json"

cat > "$EVENT_FILE" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "source": "performance-tracker",
  "action": "$ACTION"
}
EOF

echo ""
echo "✅ 리포트 완료"
