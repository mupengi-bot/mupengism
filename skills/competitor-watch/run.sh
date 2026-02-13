#!/bin/bash
# competitor-watch/run.sh
# 경쟁사 시장 동향 모니터링 (하이브리드: 이벤트 읽기/정리)

set -e

WORKSPACE="${WORKSPACE:-$HOME/.openclaw/workspace}"
EVENTS_DIR="${EVENTS_DIR:-$WORKSPACE/events}"
MEMORY_DIR="${MEMORY_DIR:-$WORKSPACE/memory}"

ACTION="${1:-report}"

case "$ACTION" in
  scan)
    # scan은 placeholder - 실제 검색은 에이전트가 web_search로 처리
    echo "⚠️  scan 액션은 에이전트가 직접 web_search를 통해 처리합니다."
    echo "run.sh는 검색 결과를 이벤트로 저장하는 역할만 수행합니다."
    exit 0
    ;;

  report)
    # events/market-update-*.json 읽어서 리포트 생성
    echo "📊 경쟁사 모니터링 리포트"
    echo ""
    
    if [ ! -d "$EVENTS_DIR" ]; then
      echo "❌ 이벤트 디렉토리가 없습니다: $EVENTS_DIR"
      exit 1
    fi
    
    # 최근 7일 이벤트 읽기
    RECENT_EVENTS=$(find "$EVENTS_DIR" -name "market-update-*.json" -mtime -7 2>/dev/null || true)
    
    if [ -z "$RECENT_EVENTS" ]; then
      echo "최근 7일간 수집된 시장 동향 이벤트가 없습니다."
      echo ""
      echo "💡 에이전트에게 '경쟁사 모니터링' 또는 '시장 동향 조사' 요청하여"
      echo "   web_search로 최신 정보를 수집하세요."
      exit 0
    fi
    
    echo "최근 7일 동향:"
    echo ""
    
    # JSON 파일 읽어서 요약 출력 (jq 사용 권장, 없으면 cat)
    if command -v jq &> /dev/null; then
      for file in $RECENT_EVENTS; do
        TIMESTAMP=$(jq -r '.timestamp' "$file" 2>/dev/null || echo "N/A")
        SUMMARY=$(jq -r '.data.summary' "$file" 2>/dev/null || echo "N/A")
        echo "• [$TIMESTAMP] $SUMMARY"
      done
    else
      for file in $RECENT_EVENTS; do
        echo "• $(basename $file)"
        grep -o '"summary":"[^"]*"' "$file" | cut -d'"' -f4 || echo "  (요약 없음)"
      done
    fi
    ;;

  history)
    # 전체 이벤트 히스토리
    echo "📚 경쟁사 모니터링 히스토리"
    echo ""
    
    if [ ! -d "$EVENTS_DIR" ]; then
      echo "❌ 이벤트 디렉토리가 없습니다: $EVENTS_DIR"
      exit 1
    fi
    
    ALL_EVENTS=$(find "$EVENTS_DIR" -name "market-update-*.json" 2>/dev/null || true)
    
    if [ -z "$ALL_EVENTS" ]; then
      echo "수집된 시장 동향 이벤트가 없습니다."
      exit 0
    fi
    
    COUNT=$(echo "$ALL_EVENTS" | wc -l | tr -d ' ')
    echo "총 이벤트 수: $COUNT개"
    echo ""
    
    # 최근 10개만 출력
    echo "최근 10개 이벤트:"
    echo "$ALL_EVENTS" | sort -r | head -10 | while read file; do
      echo "• $(basename $file)"
    done
    ;;

  *)
    echo "❌ 알 수 없는 액션: $ACTION"
    echo "사용법: run.sh [scan|report|history]"
    exit 1
    ;;
esac

exit 0
