---
name: performance-tracker
description: SNS 게시물 성과 추적 및 분석
trigger: ["성과", "performance", "인사이트", "분석", "리포트"]
run: ./run.sh
args: ["summary"]
input: args
output: stdout
tier: 4
author: 무펭이 🐧
---

SNS 성과 데이터 집계 및 분석.
액션: summary (전체 요약) | weekly (주간) | best | worst
저장 위치: memory/performance/
상세: GUIDE.md
