#!/bin/bash
# tokenmeter/run.sh
# AI 토큰 사용량 및 비용 추적

set -e

WORKSPACE="${WORKSPACE:-$HOME/.openclaw/workspace}"
EVENTS_DIR="${EVENTS_DIR:-$WORKSPACE/events}"
MEMORY_DIR="${MEMORY_DIR:-$WORKSPACE/memory}"

ACTION="${1:-dashboard}"
TOKENMETER_PATH="${TOKENMETER_PATH:-$HOME/clawd/tokenmeter}"

# tokenmeter 설치 확인
if [ ! -d "$TOKENMETER_PATH" ]; then
  echo "❌ tokenmeter가 설치되지 않았습니다."
  echo "자동 설치: mkdir -p ~/clawd && cd ~/clawd && git clone https://github.com/jugaad-lab/tokenmeter.git && cd tokenmeter && python3 -m venv .venv && source .venv/bin/activate && pip install -e ."
  exit 1
fi

# venv 활성화
cd "$TOKENMETER_PATH"
if [ ! -d ".venv" ]; then
  echo "❌ Python venv가 없습니다. 먼저 설치하세요."
  exit 1
fi

source .venv/bin/activate

# 액션 실행
case "$ACTION" in
  dashboard)
    tokenmeter dashboard
    ;;
  import)
    tokenmeter import --auto
    ;;
  costs)
    PERIOD="${2:-week}"
    tokenmeter costs --period "$PERIOD"
    ;;
  summary)
    PERIOD="${2:-week}"
    tokenmeter summary --period "$PERIOD"
    ;;
  *)
    echo "❌ 알 수 없는 액션: $ACTION"
    echo "사용법: run.sh [dashboard|import|costs|summary] [period]"
    exit 1
    ;;
esac

# 이벤트 생성 (dashboard 또는 summary 실행 시)
if [ "$ACTION" = "dashboard" ] || [ "$ACTION" = "summary" ]; then
  mkdir -p "$EVENTS_DIR"
  TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S+09:00")
  EVENT_FILE="$EVENTS_DIR/cost-alert-$(date +%Y-%m-%d).json"
  
  # 간단한 이벤트만 생성 (실제 파싱은 복잡하므로 placeholder)
  cat > "$EVENT_FILE" <<EOF
{
  "type": "cost-alert",
  "source": "tokenmeter",
  "timestamp": "$TIMESTAMP",
  "data": {
    "action": "$ACTION",
    "note": "tokenmeter 실행 완료. 상세 내용은 tokenmeter dashboard 출력 참고."
  },
  "consumers": ["daily-report"]
}
EOF
  
  echo ""
  echo "✅ 이벤트 생성: $EVENT_FILE"
fi

exit 0
