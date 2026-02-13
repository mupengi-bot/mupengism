---
name: npm-tracker
description: "npm 패키지 다운로드 수 추적 및 성장 분석. mupengism, openclaw 등 패키지 통계를 자동 수집하고 추이를 기록."
trigger: ["npm 다운로드", "다운로드 수", "npm stats", "패키지 통계", "mupengism 몇명"]
type: tool
run: ./run.sh
args: ["mupengism", "last-week"]
output: stdout
events_out: ["npm-stats"]
tier: 1
author: 무펭이 🐧
---
