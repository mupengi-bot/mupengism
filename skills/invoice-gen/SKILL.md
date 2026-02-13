---
name: invoice-gen
description: 프리랜스 청구서 자동 생성 (마크다운 템플릿)
trigger: ["청구서", "invoice", "견적서", "세금계산서"]
run: ./run.sh
args: []
input: args
output: stdout
tier: 4
author: 무펭이 🐧
---

청구서 자동 생성. 부가세 10% 자동 계산.
사용법: run.sh --service "서비스명" --amount 금액 --client "고객" --date 날짜
저장: $WORKSPACE/invoices/YYYY-MM-DD-{client}.md
상세: GUIDE.md
