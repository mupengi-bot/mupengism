---
name: daily-report
description: 일일 업무 보고서 자동 생성
trigger: ["일일 보고", "daily report", "오늘 뭐했어", "보고서"]
run: ./run.sh
args: ["today"]
input: args
output: stdout
events_in: ["cost-alert", "market-update", "content-published"]
tier: 5
author: 무펭이 🐧
---

`memory/YYYY-MM-DD.md` 파일과 이벤트를 읽어 일일 보고서를 생성합니다.
상세 가이드: GUIDE.md
