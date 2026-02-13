---
name: data-scraper
description: 웹페이지 데이터 수집 및 텍스트 추출 (curl 기반)
trigger: ["스크래핑", "데이터 수집", "scrape", "크롤링"]
type: tool
run: ./run.sh
args: ["--url", "https://example.com"]
input: args
output: stdout
events_out: ["scrape-result"]
tier: 3
author: 무펭이 🐧
---

웹 데이터 수집. URL → 텍스트 추출 → stdout 출력.
상세 가이드: GUIDE.md
