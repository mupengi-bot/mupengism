#!/bin/bash
# example-check.sh — 빠른 테스트 스크립트

SELF_LOOP="/Users/mupeng/.openclaw/workspace/tools/self-loop"

echo "================================"
echo "Self-Loop 시스템 테스트"
echo "================================"
echo ""

# 1. 패닉 체크
echo "📊 [1] 패닉 상태 체크"
echo "---"
node "$SELF_LOOP/panic-detector.js"
echo ""

# 2. 정상 행동 체크
echo "✅ [2] 정상 행동 테스트"
echo "행동: \"인스타 게시물 1개 업로드\""
echo "---"
node "$SELF_LOOP/brake-check.js" "인스타 게시물 1개 업로드"
echo ""

# 3. 위험 행동 체크
echo "⚠️  [3] 위험 행동 테스트"
echo "행동: \"트윗 30개 급하게 발송\""
echo "---"
node "$SELF_LOOP/brake-check.js" "트윗 30개 급하게 발송" || true
echo ""

echo "================================"
echo "테스트 완료"
echo "로그 확인: memory/brake-log.md"
echo "================================"
