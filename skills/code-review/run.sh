#!/bin/bash
# code-review/run.sh
# Git diff 기반 코드 변경사항 분석

set -e

WORKSPACE="${WORKSPACE:-$HOME/.openclaw/workspace}"
EVENTS_DIR="${EVENTS_DIR:-$WORKSPACE/events}"

cd "$WORKSPACE"

# 인자 파싱
TARGET="staged"

while [[ $# -gt 0 ]]; do
  case $1 in
    --target)
      TARGET="$2"
      shift 2
      ;;
    *)
      echo "❌ 알 수 없는 옵션: $1"
      echo "사용법: run.sh --target [staged|last|branch]"
      exit 1
      ;;
  esac
done

# Git 저장소 확인
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo "❌ Git 저장소가 아닙니다."
  exit 1
fi

echo "📊 코드 리뷰 분석"
echo "🎯 타겟: $TARGET"
echo ""

# 타겟에 따라 diff 실행
case "$TARGET" in
  staged)
    echo "📝 Staged 변경사항 (git diff --cached)"
    echo ""
    
    # 변경 파일 목록
    echo "### 변경 파일 목록"
    git diff --cached --name-status
    echo ""
    
    # 변경 통계
    echo "### 변경 통계"
    git diff --cached --stat
    echo ""
    
    # 전체 diff
    echo "### 상세 변경 내용"
    git diff --cached
    ;;
    
  last)
    echo "📝 마지막 커밋 변경사항 (git diff HEAD~1)"
    echo ""
    
    # 변경 파일 목록
    echo "### 변경 파일 목록"
    git diff HEAD~1 --name-status
    echo ""
    
    # 변경 통계
    echo "### 변경 통계"
    git diff HEAD~1 --stat
    echo ""
    
    # 전체 diff
    echo "### 상세 변경 내용"
    git diff HEAD~1
    ;;
    
  branch)
    # 현재 브랜치와 main/master 비교
    DEFAULT_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || echo "main")
    CURRENT_BRANCH=$(git branch --show-current)
    
    if [ "$CURRENT_BRANCH" = "$DEFAULT_BRANCH" ]; then
      echo "❌ 현재 브랜치가 기본 브랜치($DEFAULT_BRANCH)입니다."
      echo "다른 브랜치에서 실행하거나 --target staged 또는 last를 사용하세요."
      exit 1
    fi
    
    echo "📝 브랜치 비교 ($CURRENT_BRANCH vs $DEFAULT_BRANCH)"
    echo ""
    
    # 변경 파일 목록
    echo "### 변경 파일 목록"
    git diff "$DEFAULT_BRANCH"..."$CURRENT_BRANCH" --name-status
    echo ""
    
    # 변경 통계
    echo "### 변경 통계"
    git diff "$DEFAULT_BRANCH"..."$CURRENT_BRANCH" --stat
    echo ""
    
    # 전체 diff
    echo "### 상세 변경 내용"
    git diff "$DEFAULT_BRANCH"..."$CURRENT_BRANCH"
    ;;
    
  *)
    echo "❌ 알 수 없는 타겟: $TARGET"
    echo "사용 가능: staged, last, branch"
    exit 1
    ;;
esac

# 이벤트 발행
mkdir -p "$EVENTS_DIR"
EVENT_FILE="$EVENTS_DIR/review-completed-$(date +%s).json"

# 변경 파일 수 계산
case "$TARGET" in
  staged)
    FILE_COUNT=$(git diff --cached --name-only | wc -l)
    ADDED=$(git diff --cached --numstat | awk '{sum+=$1} END {print sum+0}')
    DELETED=$(git diff --cached --numstat | awk '{sum+=$2} END {print sum+0}')
    ;;
  last)
    FILE_COUNT=$(git diff HEAD~1 --name-only | wc -l)
    ADDED=$(git diff HEAD~1 --numstat | awk '{sum+=$1} END {print sum+0}')
    DELETED=$(git diff HEAD~1 --numstat | awk '{sum+=$2} END {print sum+0}')
    ;;
  branch)
    DEFAULT_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || echo "main")
    CURRENT_BRANCH=$(git branch --show-current)
    FILE_COUNT=$(git diff "$DEFAULT_BRANCH"..."$CURRENT_BRANCH" --name-only | wc -l)
    ADDED=$(git diff "$DEFAULT_BRANCH"..."$CURRENT_BRANCH" --numstat | awk '{sum+=$1} END {print sum+0}')
    DELETED=$(git diff "$DEFAULT_BRANCH"..."$CURRENT_BRANCH" --numstat | awk '{sum+=$2} END {print sum+0}')
    ;;
esac

cat > "$EVENT_FILE" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "source": "code-review",
  "target": "$TARGET",
  "files_changed": $FILE_COUNT,
  "lines_added": $ADDED,
  "lines_deleted": $DELETED
}
EOF

echo ""
echo "✅ 리뷰 완료: $FILE_COUNT개 파일, +$ADDED/-$DELETED 줄"
