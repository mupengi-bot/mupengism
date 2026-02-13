---
name: translate
description: 다국어 번역 및 로컬라이제이션 (literal|natural|localize)
trigger: ["번역", "translate", "영어로", "일본어로", "중국어로"]
type: tool
run: ./run.sh
args: ["--from", "ko", "--to", "en", "--mode", "natural"]
input: args
output: stdout
tier: 3
author: 무펭이 🐧
---

다국어 번역. run.sh는 입력 전처리 + 번역 프롬프트 템플릿 생성.
실제 번역은 에이전트가 LLM으로 처리.
상세 가이드: GUIDE.md
