---
name: git-auto
description: Git 워크스페이스 자동 관리 (상태/커밋/푸시/로그/diff)
trigger: ["git 상태", "커밋해줘", "푸시", "git status", "변경사항"]
run: ./run.sh
args: ["status"]
input: args
output: stdout
tier: 4
author: 무펭이 🐧
---

Git 작업 자동화. 액션: status, commit, push, log, diff
상세 가이드: GUIDE.md
