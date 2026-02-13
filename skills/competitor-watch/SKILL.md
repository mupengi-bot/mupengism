---
name: competitor-watch
description: 경쟁사 시장 동향 모니터링 (scan|report|history)
trigger: ["경쟁사", "시장 동향", "competitor", "모니터링"]
type: tool
run: ./run.sh
args: ["report"]
input: args
output: stdout
events_out: ["market-update"]
tier: 3
author: 무펭이 🐧
---

경쟁사/시장 동향 모니터링. 이벤트 기반 리포트 생성.
실제 검색은 에이전트가 처리, run.sh는 결과 정리/포맷팅.
상세 가이드: GUIDE.md
