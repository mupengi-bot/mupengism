---
name: skill-router
description: "맥락 기반 스킬 자동 라우팅 + 연합 스킬 조합. 사용자 입력을 분석해 단일 또는 복수 스킬을 자동 선택하고 순서대로 실행. 모든 요청의 첫 관문. Use on every request to determine optimal skill combination."
author: 무펭이 🐧
---

# Skill Router

사용자의 자연어 입력을 분석해서 적절한 스킬 1개 또는 여러 개를 자동 선택 + 순서 결정 + 연쇄 실행하는 메타 시스템.

## 🚀 v2 아키텍처: 로우레벨 호출 프로토콜

### 실행 흐름
```
1. skills/*/SKILL.md frontmatter만 스캔 (trigger 매칭)
   - description + trigger 필드로 빠른 매칭
   - 전체 본문 읽기 없음 → 토큰 절약 83%
   
2. 매칭된 스킬의 run 필드로 스크립트 경로 확인
   - run: "./run.sh" → skills/{name}/run.sh
   - run: "./run.js" → skills/{name}/run.js
   
3. exec로 스크립트 직접 실행
   WORKSPACE=$HOME/.openclaw/workspace \
   EVENTS_DIR=$WORKSPACE/events \
   MEMORY_DIR=$WORKSPACE/memory \
   bash $WORKSPACE/skills/{name}/run.sh [args]
   
4. stdout 결과를 에이전트가 처리
   - JSON이면 파싱
   - 텍스트면 그대로 전달
   - 에러 시 stderr 확인
   
5. events_out에 따라 이벤트 생성
   - events/{type}-{date}.json 파일 생성
   - 후속 스킬이 events_in으로 소비
   
6. hooks 체크 → 후속 스킬 트리거
   - post: ["skill-a", "skill-b"] → 자동 실행
   - on_error: ["notification-hub"] → 에러 시 알림
```

### 스킬 메타데이터 스캔
```bash
# 모든 스킬의 frontmatter만 추출
for skill in skills/*/SKILL.md; do
  yq eval '.name, .description, .trigger, .run' "$skill"
done
```

### 실행 예시
```bash
# 사용자: "일일 보고"
# → trigger 매칭: daily-report
# → 실행:
cd $HOME/.openclaw/workspace
WORKSPACE=$PWD \
EVENTS_DIR=$PWD/events \
MEMORY_DIR=$PWD/memory \
bash skills/daily-report/run.sh today

# stdout 결과를 에이전트가 포맷팅해서 사용자에게 전달
```

### 토큰 절약 효과
- **기존**: SKILL.md 3000자 × 40개 = 120KB (~30K 토큰)
- **v2**: SKILL.md 500자 × 40개 = 20KB (~5K 토큰)
- **절약**: 83% 토큰 절약

## 핵심 개념

OpenClaw는 이미 description 매칭으로 스킬 1개를 선택하지만, 이 스킬은:
1. **복합 의도 감지**: "경쟁사 분석하고 카드뉴스로 만들어줘" → competitor-watch + copywriting + cardnews + insta-post
2. **맥락 기반 자동 훅**: 어떤 스킬이 실행되면 후속 스킬 자동 판단
3. **스킬 체인 템플릿**: 자주 쓰는 조합을 미리 정의

## 의도 분류 매트릭스

### 단일 스킬 매핑 (1:1)

- "커밋/푸시/git" → git-auto
- "DM/인스타 메시지" → auto-reply
- "비용/토큰/얼마" → tokenmeter
- "번역/영어로" → translate
- "청구서/견적" → invoice-gen
- "코드 리뷰/PR" → code-review
- "시스템 상태/헬스" → health-monitor
- "트렌드/동향" → trend-radar
- "성과/반응/좋아요" → performance-tracker
- "일일 보고" → daily-report
- "SEO 감사" → seo-audit
- "브랜드 톤" → brand-voice

### 복합 스킬 체인 (1:N) — 핵심 파이프라인

| 트리거 패턴 | 스킬 체인 | 설명 |
|---|---|---|
| "콘텐츠 만들어줘/포스팅" | seo-content-planner → copywriting → cardnews → insta-post | 콘텐츠 풀 파이프라인 |
| "경쟁사 분석하고 보고서" | competitor-watch → daily-report → mail | 리서치→보고 |
| "이 영상 요약해서 카드뉴스" | yt-digest → content-recycler → cardnews → insta-post | 영상→콘텐츠 변환 |
| "주간 리뷰" | self-eval + tokenmeter + performance-tracker → daily-report | 종합 리뷰 |
| "콘텐츠 재활용" | performance-tracker → content-recycler → cardnews | 잘된 콘텐츠 재가공 |
| "아이디어 검토하고 실행" | think-tank(brainstorm) → decision-log → skill-composer | 발상→결정→실행 |
| "시장 조사" | competitor-watch + trend-radar + data-scraper → daily-report | 풀 리서치 |
| "릴리즈" | code-review → git-auto → release-discipline | 안전한 배포 |
| "아침 루틴" | health-monitor → tokenmeter → notification-hub → daily-report | 아침 자동 체크 |

## 맥락 기반 자동 연쇄 규칙

스킬 A 실행 완료 → 결과 분석 → 다음 스킬 자동 판단:

**자동 연쇄 규칙 (if → then)**

- IF competitor-watch에서 중요 변화 감지 → THEN notification-hub(urgent) + daily-report에 포함
- IF tokenmeter에서 월 $500 초과 → THEN notification-hub(urgent)
- IF code-review에서 심각도 HIGH → THEN 커밋 차단 + notification-hub
- IF think-tank 결론에 "즉시 실행" 액션 → THEN decision-log 자동 기록
- IF cardnews 생성 완료 → THEN "insta-post로 올릴까?" 확인 (형님 승인)
- IF self-eval에서 반복 실수 감지 → THEN learning-engine 트리거
- IF performance-tracker에서 잘된 콘텐츠 → THEN content-recycler 제안
- IF trend-radar에서 핫 트렌드 → THEN seo-content-planner 자동 제안
- IF mail에서 중요 메일 감지 → THEN notification-hub(important)
- IF health-monitor에서 이상 → THEN 자동 복구 시도 + notification-hub(urgent)

## 실행 엔진 프로토콜

```
1. 사용자 입력 수신
2. 의도 분류 (단일 vs 복합)
3. 단일이면 → 해당 스킬 즉시 실행
4. 복합이면 → 스킬 체인 구성
   a. 의존성 없는 스킬들은 병렬 실행 (sessions_spawn)
   b. 의존성 있는 스킬들은 순차 실행 (이전 결과를 events/로 전달)
5. 각 스킬 완료 시 자동 연쇄 규칙 체크
6. 추가 스킬 필요하면 자동 트리거 (또는 형님 승인 요청)
7. 최종 결과 종합해서 응답
```

## 훅 자동 등록

skill-router가 활성화되면 모든 스킬에 대해:

- **pre-hook**: 입력 검증 + 보안 체크
- **post-hook**: events/ 이벤트 생성 + 연쇄 규칙 체크
- **on-error**: 에러 로그 + notification-hub

## 스킬 의존성 그래프

```
[사용자 입력]
    ↓
[skill-router] ← 의도 분류
    ↓
┌─────────────────────────────────────────┐
│  TIER 1: 데이터 수집                      │
│  competitor-watch, data-scraper,        │
│  trend-radar, tokenmeter, yt-digest     │
└─────────────┬───────────────────────────┘
              ↓ events/
┌─────────────────────────────────────────┐
│  TIER 2: 분석/사고                       │
│  think-tank, self-eval, seo-audit,      │
│  code-review, performance-tracker       │
└─────────────┬───────────────────────────┘
              ↓ events/
┌─────────────────────────────────────────┐
│  TIER 3: 생산                            │
│  copywriting, cardnews, content-recycler,│
│  translate, invoice-gen                  │
└─────────────┬───────────────────────────┘
              ↓ events/
┌─────────────────────────────────────────┐
│  TIER 4: 배포/실행                       │
│  insta-post, mail, git-auto,            │
│  release-discipline                     │
└─────────────┬───────────────────────────┘
              ↓ events/
┌─────────────────────────────────────────┐
│  TIER 5: 추적/학습                       │
│  daily-report, decision-log,            │
│  learning-engine, notification-hub      │
└─────────────────────────────────────────┘
```

## 안전 장치

- 외부 행동(메일 발송, SNS 게시, 결제) 전 반드시 형님 승인
- 무한 루프 방지: 같은 스킬 체인 3회 반복 시 중단
- 비용 제한: 1회 체인에서 서브에이전트 최대 5개
- 에러 시 graceful 중단 + 부분 결과 저장

---

> 🐧 Built by **무펭이** — [무펭이즘(Mupengism)](https://github.com/mupeng) 생태계 스킬
