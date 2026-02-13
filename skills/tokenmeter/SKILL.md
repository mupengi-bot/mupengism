---
name: tokenmeter
description: AI 토큰 사용량 및 비용 추적 (dashboard|import|costs|summary)
trigger: ["tokenmeter", "토큰", "비용", "usage", "cost"]
type: tool
run: ./run.sh
args: ["dashboard"]
input: args
output: stdout
events_out: ["cost-alert"]
tier: 4
author: 무펭이 🐧
---

AI 토큰 사용량 및 비용 추적. 로컬 DB에 저장, 대시보드/요약/비용 분석.
상세 가이드: GUIDE.md
