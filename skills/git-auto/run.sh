#!/bin/bash
# git-auto/run.sh
# Git 워크스페이스 자동 관리

set -e

WORKSPACE="${WORKSPACE:-$HOME/.openclaw/workspace}"
cd "$WORKSPACE"

ACTION="${1:-status}"

case "$ACTION" in
  status)
    echo "📊 Git 상태"
    git status --short
    echo ""
    MODIFIED=$(git status --short | grep -c "^ M" || true)
    ADDED=$(git status --short | grep -c "^??" || true)
    DELETED=$(git status --short | grep -c "^ D" || true)
    echo "변경: $MODIFIED개 | 추가: $ADDED개 | 삭제: $DELETED개"
    ;;

  commit)
    # 변경사항 확인
    if [ -z "$(git status --porcelain)" ]; then
      echo "❌ 커밋할 변경사항이 없습니다."
      exit 0
    fi

    # 자동 커밋 메시지 생성
    FILES=$(git status --porcelain)
    
    # 파일 종류별 분류
    if echo "$FILES" | grep -q "skills/"; then
      PREFIX="✨ feat:"
      MSG="스킬 업데이트"
    elif echo "$FILES" | grep -q "memory/"; then
      PREFIX="🗃️ memory:"
      MSG="메모리 파일 업데이트"
    elif echo "$FILES" | grep -q "\.md$"; then
      PREFIX="📝 docs:"
      MSG="문서 업데이트"
    else
      PREFIX="🔧 chore:"
      MSG="작업 파일 업데이트"
    fi

    COMMIT_MSG="$PREFIX $MSG"
    
    git add -A
    git commit -m "$COMMIT_MSG"
    echo "✅ 커밋 완료: $COMMIT_MSG"
    ;;

  push)
    BRANCH=$(git branch --show-current)
    git push origin "$BRANCH"
    echo "✅ 푸시 완료: origin/$BRANCH"
    ;;

  log)
    COUNT="${2:-10}"
    git log -n "$COUNT" --oneline --decorate
    ;;

  diff)
    echo "📊 변경사항 요약"
    git diff --stat
    echo ""
    git diff --shortstat
    ;;

  *)
    echo "❌ 알 수 없는 액션: $ACTION"
    echo "사용법: run.sh [status|commit|push|log|diff]"
    exit 1
    ;;
esac
