# 훅 레지스트리

## post-hooks
- git-auto → daily-report (커밋 기록 자동 포함)
- insta-post → events/content-published + daily-report
- competitor-watch → events/market-update + notification-hub
- tokenmeter → cost-alert (월 $500 초과시 urgent)
- think-tank → events/insight-discovered + memory/bank
- cardnews → social-publisher (옵션)
- code-review → git-auto (리뷰 통과 시 자동 커밋)
- self-eval → memory/growth-dashboard 업데이트

## pre-hooks
- mail send → security-check (시크릿/개인정보 스캔)
- insta-post → image-validate (규격 체크: 1:1, JPG)
- release-discipline → version-check + test-run

## on-error hooks
- any → memory/errors/YYYY-MM-DD.md 로그
- any → notification-hub (urgent)
- browser-dependent → 브라우저 상태 체크 + 재시작 시도

## scheduled hooks
- 매일 09:00 → trend-radar
- 매일 22:00 → daily-report 자동 생성
- 매주 월 → self-eval
- 매주 금 → competitor-watch market-scan
