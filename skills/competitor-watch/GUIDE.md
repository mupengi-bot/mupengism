# Competitor Watch 🐧

경쟁사 및 시장 동향을 모니터링하는 스킬. 웹 검색을 통해 특정 키워드, 경쟁사의 최신 뉴스, 제품 업데이트, 투자 소식, 기술 트렌드를 추적합니다.

## 기능

### 1. quick-check
단일 키워드/경쟁사의 최신 소식을 빠르게 확인합니다.

**사용법:**
```
경쟁사 quick-check: Lindy AI
최근 소식: n8n
```

**동작:**
- web_search 1-2회 호출
- 최신 뉴스/업데이트 요약
- 📢 [경쟁사] 소식 포맷으로 출력

### 2. deep-dive
특정 경쟁사에 대한 상세 분석을 수행합니다.

**분석 항목:**
- 제품/서비스 라인업
- 가격 정책
- 팀 구성 (공개된 정보)
- 투자/펀딩 현황
- 기술 스택
- 최근 주요 동향

**사용법:**
```
deep-dive: CrewAI
뤼튼 상세 분석
```

**동작:**
- 다각도 웹 검색 (5-10회)
- 구조화된 리포트 생성
- `memory/research/competitor-YYYY-MM-DD-[회사명].md` 저장

### 3. market-scan
여러 경쟁사를 동시 스캔하여 비교 분석합니다.

**사용법:**
```
market-scan: AI 에이전트 플랫폼
경쟁사 스캔: Lindy AI, AutoGPT, CrewAI
```

**동작:**
- 각 경쟁사별 quick-check
- 비교 테이블 생성
- 시장 포지셔닝 분석

**출력 예시:**
| 경쟁사 | 최신 소식 | 주요 특징 | 소스 |
|--------|-----------|-----------|------|
| Lindy AI | ... | ... | [링크] |
| CrewAI | ... | ... | [링크] |

### 4. trend-report
특정 분야의 트렌드 리포트를 생성합니다.

**사용법:**
```
trend-report: AI 에이전트 시장
트렌드 리포트: 한국 AI 스타트업
```

**동작:**
- 키워드별 웹 검색
- 시간대별 변화 추적
- 주요 인사이트 추출
- `memory/research/trend-YYYY-MM-DD-[주제].md` 저장

## 기본 워치리스트

### AI 에이전트 플랫폼 (글로벌)
- **Lindy AI** - AI 워크플로우 자동화
- **AutoGPT** - 자율 AI 에이전트
- **CrewAI** - 멀티 에이전트 협업
- **LangGraph** - LangChain 기반 에이전트
- **n8n** - 워크플로우 자동화

### AI 플랫폼 (한국)
- **뤼튼 (Wrtn)** - AI 콘텐츠 생성
- **캐럿 (Carrot)** - AI 어시스턴트
- **업스테이지** - 기업용 AI
- **네이버 에이전트N** - 네이버 AI 에이전트

### OpenClaw 경쟁사/관련
- **Langchain** - LLM 애플리케이션 프레임워크
- **Semantic Kernel** - Microsoft AI 오케스트레이터

## 출력 포맷

### 발견 시 (quick-check, market-scan)
```
📢 [Lindy AI] 소식
Series A 3000만 달러 투자 유치. Y Combinator 출신 팀.
https://example.com/news
```

### 리포트 저장
- **경로:** `memory/research/competitor-YYYY-MM-DD.md`
- **파일명 예시:**
  - `competitor-2026-02-14.md` (주간 스캔)
  - `competitor-2026-02-14-LinidyAI.md` (deep-dive)
  - `trend-2026-02-14-AI-agent-market.md` (트렌드)

## 검색 방법

**👉 통합 검색 스킬 사용 권장: `/skills/web-claude/`**

모든 검색은 `web-claude` 통합 검색 스킬을 통해 자동 fallback:
1. **web_search (Brave)** — 빠르고 안정적 (1차)
2. **duckduckgo-search** — 프라이버시 중심 (2차 fallback)
3. **claude.ai 브라우저** — 분석+검색 (3차 fallback)

검색 결과는 자동으로 `memory/research/` 폴더에 캐시됩니다.

### 사용 예시
```
"Lindy AI 최근 소식 검색"  # 자동으로 최적 방법 선택
```

### 수동 방법 지정 (필요 시)
```
# Brave만 사용
web_search(query="Lindy AI latest news", count=5)

# DuckDuckGo만 사용
python -c "from duckduckgo_search import DDGS; ..."

# claude.ai 브라우저만 사용 (분석 포함)
browser navigate → claude.ai → 질문 입력
```

## Cron 연동

주간/월간 자동 스캔 설정 가능:

```bash
# 주 1회 월요일 오전 9시, 워치리스트 전체 스캔
0 9 * * 1 competitor-watch market-scan --watchlist=all
```

**설정 방법:**
1. OpenClaw cron 스킬 사용
2. `competitor-watch market-scan` 명령 실행
3. 결과를 Discord DM으로 전송

## 사용 예시

```
# 단일 경쟁사 체크
경쟁사 소식: Lindy AI

# 상세 분석
deep-dive: 뤼튼

# 시장 스캔
market-scan: AI 에이전트

# 트렌드 리포트
trend-report: 한국 AI 스타트업 2026년 1분기

# 워치리스트 전체 스캔
경쟁사 모니터링 주간 리포트
```

## 팁

- **freshness 파라미터** 활용: `web_search(..., freshness="pw")` (지난 주)
- **한국어 검색**: `search_lang="ko"` 파라미터 추가
- **정기 모니터링**: heartbeat 또는 cron으로 자동화
- **알림 설정**: 중요 경쟁사는 주 1회 자동 체크 권장

## 저장 파일 구조

```
memory/
└── research/
    ├── competitor-2026-02-14.md          # 주간 스캔
    ├── competitor-2026-02-14-LinidyAI.md # deep-dive
    └── trend-2026-02-14-AI-agents.md     # 트렌드
```

## 이벤트 버스 연동

실행 완료 시 `events/market-update-YYYY-MM-DD.json` 자동 생성:

```json
{
  "type": "market-update",
  "source": "competitor-watch",
  "timestamp": "2026-02-14T10:30:00+09:00",
  "data": {
    "competitors": [
      {"name": "Lindy AI", "update": "Series A 3000만 달러 투자 유치"},
      {"name": "CrewAI", "update": "멀티 에이전트 v2.0 릴리스"}
    ],
    "summary": "AI 에이전트 시장 투자 활발, 경쟁 심화"
  },
  "consumers": ["daily-report", "strategy"]
}
```

이 이벤트는 daily-report가 자동으로 수집하여 "📢 시장 동향" 섹션에 포함합니다.

---
> 🐧 Built by **무펭이** — [무펭이즘(Mupengism)](https://github.com/mupeng) 생태계 스킬
