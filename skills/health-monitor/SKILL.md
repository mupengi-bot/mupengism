---
name: health-monitor
description: 시스템 상태 자동 체크 및 복구
trigger: ["시스템 상태", "health check", "서버 상태", "인프라 체크"]
run: ./run.sh
input: args
output: stdout
events_out: ["health-check"]
tier: 5
author: 무펭이 🐧
---

OpenClaw, 브라우저, 디스크, Git 상태를 체크하고 자동 복구 시도.
결과는 JSON으로 events/에 저장. 상세 가이드: GUIDE.md
