#!/bin/bash
# health-monitor/run.sh
# 시스템 상태 감시 및 자동 복구

set -e

WORKSPACE="${WORKSPACE:-$HOME/.openclaw/workspace}"
EVENTS_DIR="${EVENTS_DIR:-$WORKSPACE/events}"

# JSON 결과 저장용
RESULT='{"timestamp":"'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'","checks":{},"issues":[],"recovery_actions":[]}'

echo "🔍 시스템 헬스 체크 시작..."
echo ""

# 1. OpenClaw 프로세스 상태
echo "1️⃣ OpenClaw 프로세스"
if openclaw status &>/dev/null; then
  echo "✅ 정상"
  RESULT=$(echo "$RESULT" | jq '.checks.openclaw = "ok"')
else
  echo "⚠️ 문제 감지"
  RESULT=$(echo "$RESULT" | jq '.checks.openclaw = "error" | .issues += ["OpenClaw 프로세스 응답 없음"]')
fi
echo ""

# 2. 브라우저 연결 상태 (포트 18800)
echo "2️⃣ 브라우저 연결"
if nc -z localhost 18800 2>/dev/null; then
  echo "✅ 정상 (포트 18800)"
  RESULT=$(echo "$RESULT" | jq '.checks.browser = "ok"')
else
  echo "⚠️ 연결 실패 (포트 18800)"
  RESULT=$(echo "$RESULT" | jq '.checks.browser = "error" | .issues += ["브라우저 연결 실패"]')
  
  # 자동 복구 시도
  echo "   → 복구 시도: openclaw browser start"
  if openclaw browser start &>/dev/null; then
    echo "   ✅ 복구 성공"
    RESULT=$(echo "$RESULT" | jq '.recovery_actions += ["openclaw browser start 실행 완료"]')
  fi
fi
echo ""

# 3. 디스크 사용량
echo "3️⃣ 디스크 사용량"
DISK_USAGE=$(df -h / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
  echo "✅ 정상 ($DISK_USAGE%)"
  RESULT=$(echo "$RESULT" | jq '.checks.disk = "ok"')
elif [ "$DISK_USAGE" -lt 90 ]; then
  echo "⚠️ 경고 ($DISK_USAGE%)"
  RESULT=$(echo "$RESULT" | jq '.checks.disk = "warning" | .issues += ["디스크 사용량 높음: '$DISK_USAGE'%"]')
else
  echo "❌ 위험 ($DISK_USAGE%)"
  RESULT=$(echo "$RESULT" | jq '.checks.disk = "critical" | .issues += ["디스크 사용량 위험: '$DISK_USAGE'%"]')
fi
echo ""

# 4. Git 상태
echo "4️⃣ Git 상태"
cd "$WORKSPACE"
UNCOMMITTED=$(git status --porcelain | wc -l | tr -d ' ')
UNPUSHED=$(git log --branches --not --remotes 2>/dev/null | grep -c "^commit" || echo "0")

if [ "$UNCOMMITTED" -eq 0 ] && [ "$UNPUSHED" -eq 0 ]; then
  echo "✅ clean"
  RESULT=$(echo "$RESULT" | jq '.checks.git = "ok"')
elif [ "$UNPUSHED" -gt 0 ]; then
  echo "⚠️ $UNPUSHED unpushed commits"
  RESULT=$(echo "$RESULT" | jq '.checks.git = "warning" | .issues += ["'$UNPUSHED' unpushed commits"]')
else
  echo "ℹ️ $UNCOMMITTED uncommitted changes"
  RESULT=$(echo "$RESULT" | jq '.checks.git = "info"')
fi
echo ""

# 5. Workspace 크기
echo "5️⃣ Workspace 크기"
WORKSPACE_SIZE=$(du -sh "$WORKSPACE" | awk '{print $1}')
MEMORY_SIZE=$(du -sh "$WORKSPACE/memory" 2>/dev/null | awk '{print $1}' || echo "0B")
echo "• 전체: $WORKSPACE_SIZE"
echo "• memory/: $MEMORY_SIZE"
echo ""

# 결과 저장
DATE=$(date +%Y-%m-%d)
EVENT_FILE="$EVENTS_DIR/health-$DATE.json"
echo "$RESULT" > "$EVENT_FILE"

# 요약 출력
ISSUE_COUNT=$(echo "$RESULT" | jq '.issues | length')
if [ "$ISSUE_COUNT" -eq 0 ]; then
  echo "🎉 모든 시스템 정상"
  RESULT=$(echo "$RESULT" | jq '.status = "ok"')
else
  echo "⚠️ $ISSUE_COUNT 개 문제 발견"
  RESULT=$(echo "$RESULT" | jq '.status = "warning"')
fi

echo ""
echo "📊 결과 저장: $EVENT_FILE"
echo "$RESULT" | jq '.'
