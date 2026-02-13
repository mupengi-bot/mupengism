---
name: trend-radar
description: 기술/시장 트렌드 주간 자동 리포트
author: 무펭이 🐧
---

# trend-radar

기술 및 시장 트렌드를 자동으로 모니터링하고 주간 리포트를 생성하는 스킬입니다.

## 기능

- 키워드 리스트 기반 웹 검색 (`web_search` 활용)
- 카테고리: AI, SaaS, 한국 스타트업, OpenClaw 생태계
- 주간 변화 감지 + 중요도 점수 (1-10)
- 결과: `memory/research/trend-YYYY-WXX.md`
- cron 연동: 매주 월요일 09:00 자동 실행

## 사용법

트리거 키워드:
- "트렌드"
- "trend radar"
- "이번주 동향"
- "시장 트렌드"

예시:
```
이번주 AI 트렌드 리포트 작성해줘
```

## 모니터링 키워드

### AI/ML
- Claude, GPT-5, Gemini, Llama
- AI agents, RAG, multimodal AI
- AI startup funding
- AI regulation (EU AI Act, Korea)

### SaaS/Productivity
- Notion AI, Linear, Slack AI
- Low-code/No-code platforms
- Developer tools (GitHub Copilot, Cursor)

### 한국 스타트업
- 토스, 당근마켓, 무신사
- 신규 투자 뉴스 (500억 이상)
- 정부 지원 정책

### OpenClaw 생태계
- Anthropic announcements
- Claude API updates
- Community showcase

## 리포트 형식

```markdown
# 트렌드 레이더 YYYY-WXX

**리포트 기간**: YYYY-MM-DD ~ YYYY-MM-DD  
**생성일**: YYYY-MM-DD  
**카테고리**: AI, SaaS, 한국 스타트업, OpenClaw

---

## 🔥 Top 3 하이라이트

1. **[제목]** (중요도: ⭐⭐⭐⭐⭐ 9/10)
   - 요약: ...
   - 출처: [링크]
   - 왜 중요한가: ...

2. **[제목]** (중요도: ⭐⭐⭐⭐ 8/10)
   - ...

3. **[제목]** (중요도: ⭐⭐⭐⭐ 7/10)
   - ...

---

## 📊 카테고리별 동향

### AI/ML
- **Claude 3.5 Sonnet 업데이트**: ...
- **OpenAI GPT-5 루머**: ...
- **한국 AI 규제 법안 통과**: ...

**변화 감지**:
- ⬆️ AI agent 검색량 +35% (전주 대비)
- ⬇️ NFT/Web3 언급 -20%

### SaaS/Productivity
- **Notion Q4 실적 발표**: ...
- **Linear 신규 기능**: ...

### 한국 스타트업
- **토스뱅크 IPO 소식**: ...
- **무피 포토부스 대학 축제 확산**: (직접 관련 있으면 추가)

### OpenClaw 생태계
- **Anthropic Claude 4 발표**: ...
- **커뮤니티 쇼케이스**: ...

---

## 📈 주간 통계

| 카테고리 | 신규 뉴스 | 중요 이슈 | 전주 대비 |
|----------|-----------|-----------|-----------|
| AI/ML | 47건 | 12건 | +5% |
| SaaS | 23건 | 3건 | -2% |
| 한국 스타트업 | 18건 | 5건 | +12% |
| OpenClaw | 8건 | 2건 | +1% |

---

## 💡 인사이트

- **AI 에이전트 생태계 급성장**: ...
- **한국 정부 AI 규제 강화 조짐**: ...
- **개발자 도구 시장 재편**: ...

---

## 🔮 다음 주 주목할 키워드

- [ ] GPT-5 공식 발표 여부
- [ ] 토스 IPO 일정
- [ ] Claude API 가격 인하 가능성

---

**생성**: trend-radar v1.0 | 무펭이 🐧
```

## 중요도 점수 기준

| 점수 | 기준 |
|------|------|
| 9-10 | 산업 전체 영향 / 즉시 대응 필요 |
| 7-8 | 주요 플레이어 동향 / 관심 필요 |
| 5-6 | 흥미로운 발견 / 참고용 |
| 1-4 | 미미한 영향 / 선택적 |

## Cron 설정 예시

```bash
# 매주 월요일 09:00
0 9 * * 1 openclaw run trend-radar
```

## 이벤트 버스 연동

리포트 생성 시 이벤트 발행:
- 경로: `events/trend-update-YYYY-MM-DD.json`
- 형식:
```json
{
  "type": "trend-report-generated",
  "timestamp": "2026-02-14T09:00:00Z",
  "week": "2026-W07",
  "highlights": [
    {
      "title": "...",
      "score": 9,
      "category": "AI/ML"
    }
  ],
  "totalArticles": 96,
  "criticalIssues": 3
}
```

## 커스터마이징

키워드 리스트 수정: `workspace/trend-radar-keywords.json`
```json
{
  "AI": ["Claude", "GPT-5", "Gemini"],
  "SaaS": ["Notion", "Linear"],
  "custom": ["무피 포토부스", "크몽"]
}
```

---

**trend-radar** | 무펭이 🐧
