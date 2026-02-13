---
name: saas-decomposer
description: "웹 SaaS 서비스 분해 및 AI 내재화 개발계획 생성. 기존 SaaS를 분석해 AI 에이전트로 대체 가능한 기능을 식별하고, 스킬 기반 내재화 로드맵을 수립. 'SaaS 분석', '서비스 분해', '내재화', 'decompose', 'SaaS 대체', '이 서비스 AI로 만들어줘' 등의 요청 시 트리거."
author: 무펭이 🐧
---

# saas-decomposer

> **SaaS → AIaaS 전환 분석 엔진**  
> 기존 SaaS 서비스를 분해하고, AI 에이전트 스킬로 대체 가능한 영역을 식별하여 내재화 로드맵을 수립합니다.

## 핵심 개념: SaaS → AIaaS 전환 분석

무펭이즘의 핵심 비전: **"SaaS의 종말 → AIaaS"**

- SaaS 시장 $200B가 통째로 뒤집힌다
- 소프트웨어를 파는 시대에서 **AI 노동력을 설치하는 시대로**
- 기존 SaaS의 기능을 분해하여 어떤 부분을 AI 에이전트 스킬로 대체할 수 있는지 분석

---

## 기능

### 1. SaaS 서비스 분해 (Decompose)

**입력**: SaaS 서비스 URL 또는 이름

**프로세스**:
1. `web_fetch`로 서비스 랜딩페이지/기능페이지 크롤링
2. 핵심 기능 목록 추출
3. 각 기능을 원자적 태스크로 분해
4. AI 대체 가능성 점수 (1-5) 부여
5. 기존 무펭이 스킬로 커버 가능한 부분 매핑

**출력 포맷**:
```
## [서비스명] 분해 결과

### 기능 목록
- 기능A (AI 대체: ⭐⭐⭐⭐⭐) → 기존 스킬: copywriting
- 기능B (AI 대체: ⭐⭐⭐) → 신규 스킬 필요
- 기능C (AI 대체: ⭐) → 인프라 개발 필요

### AI 대체율: 70%
### 필요 신규 스킬: 3개
### 예상 개발 기간: 2주
```

---

### 2. 내재화 계획 (Internalize)

분해 결과를 바탕으로 개발 로드맵 생성:

- 스킬 개발 우선순위 (대체 효과 높은 것부터)
- 기존 스킬 재활용 매핑
- 신규 스킬 스펙 초안 자동 생성
- **비용 비교**: SaaS 구독료 vs 자체 스킬 운영비

**예시**:
```
### 내재화 로드맵

#### Phase 1: Quick Wins (1주)
- [기존 스킬 활용] copywriting으로 이메일 템플릿 자동화
- [기존 스킬 활용] auto-reply로 고객 응답 자동화

#### Phase 2: 신규 스킬 개발 (2주)
- lead-scorer: 리드 스코어링 알고리즘
- campaign-optimizer: A/B 테스트 자동화

#### Phase 3: 인프라 (4주)
- 데이터 파이프라인 구축
- 실시간 동기화 시스템

### 비용 비교
- HubSpot Pro: $800/월 → 무펭이 스킬팩: $120/월 (85% 절감)
```

---

### 3. 경쟁 SaaS 비교 분석

같은 카테고리 SaaS 3-5개 동시 분해:

- 기능 교차 비교표
- AI 대체 가능 영역 오버랩 분석
- **"우리 스킬팩으로 이 SaaS들을 몇 % 대체 가능한가"** 산출

**예시**:
```
### 마케팅 SaaS 비교

| 기능 | HubSpot | Mailchimp | ActiveCampaign | 무펭이 대체 |
|------|---------|-----------|----------------|------------|
| 이메일 자동화 | ✅ | ✅ | ✅ | ⭐⭐⭐⭐⭐ auto-reply |
| 리드 스코어링 | ✅ | ❌ | ✅ | ⭐⭐⭐ (신규 스킬) |
| A/B 테스트 | ✅ | ✅ | ✅ | ⭐⭐⭐⭐ copywriting |
| CRM 통합 | ✅ | ⚠️ | ✅ | ⭐⭐ (인프라 필요) |

**종합 대체율**: 65%
```

---

### 4. 산업별 SaaS → AIaaS 전환 템플릿

미리 정의된 산업별 SaaS 분해 패턴:

#### 마케팅
- **SaaS**: HubSpot, Mailchimp
- **무펭이 대체**: `auto-reply` + `copywriting` + `mail` + `seo-content-planner`

#### 프로젝트 관리
- **SaaS**: Notion, Jira
- **무펭이 대체**: `decision-log` + `daily-report` + `git-auto`

#### 고객 관리
- **SaaS**: Salesforce, Zendesk
- **무펭이 대체**: `auto-reply` + `notification-hub` + `data-scraper`

#### 회계
- **SaaS**: QuickBooks
- **무펭이 대체**: `invoice-gen` + `tokenmeter`(비용추적)

#### 콘텐츠
- **SaaS**: Canva, Buffer
- **무펭이 대체**: `cardnews` + `social-publisher` + `content-recycler`

#### 학생회 (AssoAI 모델)
- **SaaS**: 에브리타임 + 노션 + CampusGroups
- **무펭이 대체**: 참고 → `memory/2026-02-09-insight-university-saas.md`

---

## 분석 프레임워크

```
1. Crawl      — 서비스 기능 수집 (web_fetch + data-scraper)
2. Decompose  — 원자적 태스크로 분해
3. Score      — AI 대체 가능성 점수 (1-5)
4. Map        — 기존 무펭이 스킬 매핑
5. Gap        — 부족한 스킬 식별
6. Plan       — 개발 로드맵 생성
7. Compare    — 비용 비교 (SaaS vs AIaaS)
```

---

## 사용 예시

### 기본 분해
```
사용자: "HubSpot을 분해해줘"
→ Crawl + Decompose + Score + Map 실행
→ 분해 결과 리포트 출력
```

### 내재화 계획 생성
```
사용자: "Notion을 AI로 대체하려면 뭐가 필요해?"
→ Decompose + Internalize 실행
→ 로드맵 + 비용 비교 출력
```

### 경쟁 분석
```
사용자: "마케팅 SaaS들 비교해줘"
→ HubSpot, Mailchimp, ActiveCampaign 동시 분석
→ 교차 비교표 + 대체율 산출
```

---

## 이벤트 버스

### 생성 이벤트
- `events/saas-analysis-YYYY-MM-DD.json` (분석 완료 시)

### 소비자
- `business-planner`: 사업계획서에 분석 결과 활용

---

## 참조 파일

분석 시 참고할 메모리:

- `memory/2026-02-09-insight-university-saas.md` — 대학 SaaS 시장 분석 (CampusGroups, 에브리타임)
- `memory/2026-02-09-assoai-pitchdeck.md` — AssoAI (학생회 SaaS → AI 자동화)
- `memory/consolidated/doyak-business-plan.md` — "SaaS 라이선스 50% 줄이고 AI로 대체" (Publicis Sapient)
- `memory/research/absorb-frameworks.md` — MetaGPT, OpenHands 등 프레임워크 분석
- `SOUL.md` — 무펭이즘 비전: "SaaS 시장 $200B가 통째로 뒤집힌다"

---

## AI 대체 가능성 점수 기준

| 점수 | 의미 | 예시 |
|------|------|------|
| ⭐⭐⭐⭐⭐ | 즉시 대체 가능 (기존 스킬 활용) | 이메일 자동 응답, 콘텐츠 생성 |
| ⭐⭐⭐⭐ | 경량 스킬 개발로 대체 가능 (1-2주) | 리드 스코어링, A/B 테스트 |
| ⭐⭐⭐ | 중규모 개발 필요 (2-4주) | 워크플로우 엔진, 대시보드 |
| ⭐⭐ | 인프라 개발 필요 (1-2개월) | 실시간 동기화, 데이터 파이프라인 |
| ⭐ | 장기 R&D 필요 (3개월+) | 고도화된 ML 모델, 복잡한 통합 |

---

## 트러블슈팅

### web_fetch 실패 시
- browser tool로 스냅샷 촬영 후 분석
- 공개 문서 (help center, pricing page) 우선 크롤링

### 경쟁사 정보 부족 시
- 산업별 템플릿 먼저 참조
- 유사 카테고리 SaaS 패턴 활용

### 비용 비교 데이터 없을 시
- Pricing 페이지 크롤링
- 업계 평균 구독료 추정

---

🐧 Built by **무펭이** — [무펭이즘(Mupengism)](https://github.com/mupeng) 생태계 스킬
