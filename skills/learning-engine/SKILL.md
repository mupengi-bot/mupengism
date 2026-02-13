---
name: learning-engine
description: 실수와 성공 패턴을 자동 분석하고 스킬에 반영
author: 무펭이 🐧
---

# learning-engine

시스템이 실수와 성공을 기록하고, 자동으로 패턴을 학습하여 스킬을 개선합니다. "같은 실수 반복 안 함" 원칙을 자동화.

## 학습 소스

### 1. memory/errors/
에러 로그에서 실패 패턴 추출

```markdown
# memory/errors/2026-02-14.md

## 10:30 - insta-post 실패
- 원인: PNG 파일 업로드 → "문제가 발생했습니다" 에러
- 해결: JPG 변환 후 재시도 → 성공
- 교훈: 인스타 게시는 항상 JPG로 변환 후 업로드
```

### 2. self-eval 결과
주간 자기평가에서 개선점 추출

```markdown
# memory/self-eval/2026-W07.md

## 이번 주 실수
- 브라우저 스냅샷 너무 많이 찍음 (토큰 낭비)
- → 개선: exec로 API 직접 호출

## 이번 주 성공
- insta-cli v2로 DM 체크 토큰 95% 절약
```

### 3. performance 데이터
성과 추적에서 잘된/안 된 패턴 학습

```json
{
  "insight": "오후 7-9시 게시물이 좋아요 +30%",
  "rule": "인스타 게시는 19:00-21:00 권장"
}
```

## 자동 규칙 생성

학습된 패턴을 규칙으로 변환:

**위치**: `memory/learned-rules/`

```
memory/
  learned-rules/
    instagram-posting.md
    browser-automation.md
    api-usage.md
    error-recovery.md
```

### 규칙 포맷

```markdown
# Instagram 게시 규칙

## 규칙 #1: 항상 JPG 변환
- **상황**: 인스타에 이미지 업로드
- **실패 패턴**: PNG 파일 → "문제가 발생했습니다"
- **해결**: `convert input.png -quality 92 output.jpg`
- **근거**: 2026-02-10, 2026-02-14 에러 로그
- **적용 스킬**: insta-post, cardnews, social-publisher

## 규칙 #2: 1:1 비율 필수
- **상황**: 인스타 카드뉴스
- **실패 패턴**: 16:9 가로형 → 피드에서 잘림
- **해결**: 1024x1024 정사각형으로 생성
- **근거**: 2026-02-13 형님 피드백
- **적용 스킬**: cardnews, nano-banana-pro
```

## 스킬에 규칙 주입

학습된 규칙을 해당 스킬 SKILL.md에 자동 추가:

**위치**: `skills/{skill-name}/SKILL.md`

```markdown
# insta-post

...

## 학습된 교훈

### 이미지 처리
- ✅ 항상 JPG로 변환 (PNG는 에러 발생)
- ✅ 1:1 비율 필수 (1024x1024 권장)
- ✅ 파일 크기 < 8MB

### 타이밍
- ✅ 19:00-21:00 게시 시 참여율 +30%
- ❌ 새벽 시간대 게시 지양

### 자동화
- ✅ exec로 API 호출 (스냅샷 0회)
- ❌ 브라우저 자동화는 최소화
```

## 주간 학습 리포트

매주 월요일 자동 생성:

**위치**: `memory/learning/weekly-YYYY-Www.md`

```markdown
# 2026-W07 학습 리포트

## 새로 배운 것 (5개)

1. **인스타 PNG 금지**
   - 실수 3회 → 규칙 생성
   - 적용: insta-post, cardnews

2. **토큰 절약: exec > 브라우저**
   - v1: 스냅샷 5회 → v2: exec 1회
   - 95% 절약

3. **게시 최적 시간대**
   - 19:00-21:00 좋아요 +30%

4. **브랜드 톤 효과**
   - 무펭이 톤 참여율 +40%

5. **에러 복구 자동화**
   - browser-dependent 실패 시 → 브라우저 재시작

## 적용된 스킬
- insta-post (규칙 2개)
- cardnews (규칙 1개)
- performance-tracker (인사이트 1개)

## 다음 주 목표
- [ ] A/B 테스트 시스템 구축
- [ ] 자동 복구 패턴 3개 추가
```

## 이벤트 발행

학습 완료 시 이벤트 생성:

**위치**: `events/lesson-learned-YYYY-MM-DD.json`

```json
{
  "timestamp": "2026-02-14T23:00:00Z",
  "source": "learning-engine",
  "new_rules": 2,
  "updated_skills": ["insta-post", "cardnews"],
  "summary": "인스타 이미지 규칙 2개 학습"
}
```

## hook-engine 연동

- **on-error hook**: 에러 발생 → memory/errors/ 기록 → learning-engine 분석
- **post-hook (self-eval)**: 주간 평가 후 → 학습 규칙 업데이트
- **post-hook (performance)**: 성과 데이터 수집 후 → 패턴 학습
- **scheduled hook**: 매주 월요일 → 주간 학습 리포트 생성

## 학습 파이프라인

```
에러 발생
  ↓
memory/errors/ 기록
  ↓
learning-engine 분석
  ↓
패턴 추출 + 규칙 생성
  ↓
memory/learned-rules/ 저장
  ↓
해당 스킬 SKILL.md 자동 업데이트
  ↓
이벤트 발행 (lesson-learned)
  ↓
주간 리포트 반영
```

## 트리거 키워드

- "뭘 배웠어"
- "learning"
- "교훈"
- "실수 패턴"
- "개선점"
- "학습 리포트"
- "규칙 추가"

## 사용 예시

```
"이번 주 뭘 배웠어?"
→ 주간 학습 리포트 생성

"인스타 게시 실수 패턴 정리해줘"
→ memory/errors/ 분석 + 규칙 생성

"performance 데이터로 학습해"
→ 잘된 패턴 추출 + 규칙 업데이트
```

## 자동 개선 사례

### Before (학습 전)
```
인스타 게시 실패 → 수동으로 JPG 변환 → 재시도
(매번 반복)
```

### After (학습 후)
```
insta-post 실행 → 자동으로 JPG 체크/변환 → 성공
(규칙이 SKILL.md에 주입됨)
```

## 메타 학습

learning-engine 자체도 학습:

- "어떤 규칙이 가장 많이 사용되는가?"
- "어떤 스킬이 가장 많이 개선되는가?"
- "학습 속도가 느린 영역은?"

**메타 학습 리포트**: `memory/learning/meta-YYYY-MM.md`

## 향후 개선

- [ ] 규칙 충돌 감지 (A 규칙 vs B 규칙)
- [ ] 규칙 신뢰도 점수 (사용 빈도 기반)
- [ ] 자동 A/B 테스트 (규칙 검증)
- [ ] 다른 에이전트와 학습 공유

---

> 🐧 Built by **무펭이** — [무펭이즘(Mupengism)](https://github.com/mupeng) 생태계 스킬
