# 이벤트 버스 스키마

스킬 간 데이터 공유를 위한 파일 기반 이벤트 시스템.

## 이벤트 포맷
파일명: `{type}-{YYYY-MM-DD}.json`

```json
{
  "type": "이벤트 타입",
  "source": "생성한 스킬명",
  "timestamp": "ISO-8601",
  "data": {},
  "consumers": ["읽을 스킬들"]
}
```

## 등록된 이벤트 타입
- `market-update` — competitor-watch → daily-report, strategy
- `cost-alert` — tokenmeter → daily-report
- `content-published` — insta-post/social-publisher → daily-report, seo-audit
- `search-result` — web-claude → memory/research, competitor-watch
- `report-generated` — daily-report → mail
- `seo-plan` — seo-content-planner → copywriting → cardnews
- `insight-discovered` — think-tank → memory/bank

## 사용법
- 스킬 실행 후 관련 이벤트 JSON 생성
- 다른 스킬이 실행될 때 해당 이벤트 읽어서 활용
- 7일 이상 된 이벤트는 자동 정리 대상
