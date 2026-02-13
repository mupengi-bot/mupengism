---
name: code-review
description: Git diff 기반 코드 변경사항 자동 분석
trigger: ["코드 리뷰", "code review", "PR 리뷰", "diff 확인"]
run: ./run.sh
args: ["staged"]
input: args
output: stdout
tier: 4
author: 무펭이 🐧
---

Git 변경사항 분석. 타겟: staged (기본) | last | branch
사용법: run.sh --target [staged|last|branch]
출력: 파일 목록 + 변경 라인 수 + diff 내용
상세: GUIDE.md
