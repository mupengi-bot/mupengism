---
name: web-claude
description: 통합 웹 검색 스킬. web_search(Brave) → duckduckgo → claude.ai 순서로 fallback. 검색 결과 자동 캐시(memory/research/에 저장)
author: 무펭이 🐧
---

# Unified Web Search — 통합 웹 검색 🐧

3단계 fallback 전략으로 안정적인 웹 검색 제공: **Brave API → DuckDuckGo → claude.ai 브라우저**

## 검색 전략

### 1차: web_search (Brave API) — ⚡ 빠르고 안정적 (권장)

OpenClaw 내장 `web_search` tool 사용.

```
web_search(query="검색어", count=5, freshness="pw")
```

**장점:**
- 빠른 응답 (1-2초)
- 구조화된 JSON 결과
- freshness 파라미터 지원 (pd=24h, pw=1주, pm=1개월)
- search_lang, country 파라미터로 한국어/지역 검색 가능

**단점:**
- Brave API 키 필요
- 키 없으면 `missing_brave_api_key` 에러

### 2차: duckduckgo-search — 🔒 프라이버시 중심 (fallback)

Brave 실패 시 DuckDuckGo API 사용.

```bash
python -c "
from duckduckgo_search import DDGS

with DDGS() as ddgs:
    results = list(ddgs.text('검색어', region='wt-wt', max_results=5))
    for r in results:
        print(f\"{r['title']}: {r['href']}\")
"
```

**장점:**
- API 키 불필요
- 프라이버시 친화적
- 다양한 검색 타입 (text, news, images, videos)

**단점:**
- 결과 품질이 Brave보다 낮음
- 요청 제한 있음 (너무 빠르게 연속 요청 시 차단)

### 3차: web-claude (브라우저) — 🧠 분석+검색 (최후 수단)

claude.ai 브라우저 탭에서 웹 검색 트리거.

```
1. browser navigate → https://claude.ai/new
2. browser act type → "검색 질문"
3. browser act press → Enter
4. sleep 15-30초
5. browser snapshot → 응답 추출
```

**장점:**
- API 키 불필요
- claude.ai가 자동으로 웹 검색 + 분석 + 요약
- 복잡한 리서치에 유용

**단점:**
- 느림 (15-30초)
- 브라우저 필요 (포트 18800, openclaw 프로필)
- 일일 메시지 제한 (무료 계정)
- 자동화 감지 리스크

## 자동 fallback 로직

```
if web_search available:
    try web_search(query)
    if success: return results
    
if web_search failed or unavailable:
    try duckduckgo-search
    if success: return results
    
if both failed:
    fallback to web-claude browser method
```

## 검색 결과 자동 캐시

모든 검색 결과는 `memory/research/` 폴더에 자동 저장:

**파일명 규칙:**
```
memory/research/search-YYYY-MM-DD-HH-MM-[키워드].md
```

**저장 내용:**
- 검색 쿼리
- 타임스탬프
- 사용된 검색 방법 (Brave/DuckDuckGo/claude.ai)
- 검색 결과 (링크 + 요약)
- 추출된 인사이트

**예시:**
```markdown
# Web Search: AI 에이전트 시장 규모

- **검색 시각:** 2026-02-14 07:56 KST
- **검색 방법:** web_search (Brave API)
- **쿼리:** "AI 에이전트 시장 규모 2026년"

## 결과

1. **AI Agent Market to Reach $47B by 2030** - TechCrunch
   https://techcrunch.com/...
   - CAGR 43.2% 성장 전망
   - 기업용 에이전트가 60% 차지

2. **한국 AI 시장 1조 원 돌파** - 조선일보
   https://chosun.com/...
   - 2026년 1분기 기준
   - 생성형 AI가 주도

...

## 인사이트

- AI 에이전트 시장은 빠르게 성장 중
- 기업용 자동화가 핵심 동력
- 한국 시장도 활발
```

## 사용법

### 일반 검색

```
"AI 에이전트 최신 동향 검색해줘"
"2026년 한국 SaaS 투자 현황 찾아봐"
```

→ 자동으로 1차 Brave → 2차 DDG → 3차 claude.ai 시도

### 특정 방법 강제 지정

```
# Brave만 사용
"web_search로 검색: AI 시장 규모"

# DuckDuckGo만 사용
"duckduckgo로 검색: 프라이버시 중심으로"

# claude.ai 브라우저만 사용
"web-claude로 분석: 복잡한 시장 리서치"
```

### freshness 파라미터 활용

```
# 최근 24시간 뉴스
web_search(..., freshness="pd")

# 최근 1주일
web_search(..., freshness="pw")

# 최근 1개월
web_search(..., freshness="pm")
```

### 한국어 검색

```
web_search(query="검색어", search_lang="ko", country="KR")
```

## 브라우저 방법 (web-claude) 상세

### 사전 조건

- OpenClaw 브라우저 실행 중 (포트 18800)
- claude.ai 로그인 상태 (openclaw 프로필)

### 자동화 스텝

```
1. browser navigate → https://claude.ai/new (또는 기존 탭)
2. browser snapshot → targetId 저장
3. 입력 필드 찾기 (contenteditable div 또는 textarea)
4. browser act type → 질문 입력
5. browser act press → Enter
6. sleep 15-30초 (응답 대기)
7. browser snapshot → 응답 텍스트 추출
8. 결과를 호출자에게 반환 + memory/research/ 저장
```

### 팁

- **검색 의도 명확히**: "최신 데이터로", "2026년 기준", "현재 시점에서" 등 시간 키워드 포함
- **직접 요청**: "검색해서 알려줘" 명시
- **새 대화 권장**: 이전 컨텍스트 오염 방지
- **자동화 감지 주의**: 너무 빠르게 연속 질문 X

## 타 스킬 연동

### competitor-watch

경쟁사 모니터링 시 이 통합 검색 스킬 사용:
- quick-check: web_search 우선
- deep-dive: web_search + duckduckgo 조합
- 복잡한 분석: web-claude fallback

### cardnews

카드뉴스 리서치 시 검색 결과 활용:
- 주제 리서치 → 통합 검색
- 검색 결과 → cardnews 콘텐츠 기획

### yt-digest

유튜브 요약 후 관련 정보 검색:
- 영상 주제 → 추가 웹 검색
- 검색 결과 → 보완 인사이트

## 언제 어떤 방법 쓰나

| 상황 | 권장 방법 |
|------|----------|
| 빠른 검색 필요 | web_search (Brave) |
| Brave 키 없음 | duckduckgo-search |
| 프라이버시 중요 | duckduckgo-search |
| 분석+요약 필요 | web-claude |
| 복잡한 리서치 | web-claude |
| 이미지/영상 검색 | duckduckgo-search |
| 최신 뉴스 (24h) | web_search (freshness="pd") |

## 주의사항

- **web_search**: Brave API 키 필요 (없으면 자동 fallback)
- **duckduckgo**: 너무 빠른 연속 요청 시 차단 (요청 사이 1초 대기)
- **web-claude**: 일일 메시지 제한, 브라우저 필요
- **검색 결과 캐시**: `memory/research/` 폴더는 자동 생성됨

---
> 🐧 Built by **무펭이** — [무펭이즘(Mupengism)](https://github.com/mupeng) 생태계 스킬
