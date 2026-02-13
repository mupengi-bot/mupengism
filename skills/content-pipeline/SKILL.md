---
name: content-pipeline
description: 콘텐츠 생산 전체 흐름 오케스트레이션 (기획→작성→디자인→게시→추적). Use when automating full content workflow from planning to publishing.
author: 무펭이 🐧
---

# content-pipeline

콘텐츠 생산 전체 흐름을 오케스트레이션하는 메타 스킬.

## 파이프라인 단계

```
1. seo-content-planner → 키워드 분석 & 콘텐츠 기획
2. copywriting → 본문 작성
3. cardnews → 카드뉴스 이미지 생성
4. social-publisher → 인스타그램/SNS 게시
5. 성과 추적 → 일일 리포트로 피드백
```

## 사용법

### 전체 자동 실행
```bash
content-pipeline --auto --topic "포토부스 활용법"
```

### 개별 단계 실행
```bash
# 1단계: 기획
content-pipeline --step plan --topic "포토부스 트렌드"

# 2단계: 본문 작성 (이전 단계 이벤트 자동 로드)
content-pipeline --step write

# 3단계: 카드뉴스 생성
content-pipeline --step design

# 4단계: 게시
content-pipeline --step publish

# 5단계: 성과 확인
content-pipeline --step track
```

## 이벤트 연동

각 단계는 이전 단계의 결과를 `events/` 디렉토리에서 자동으로 읽어옵니다:

- `seo-plan-YYYY-MM-DD.json` → copywriting 입력
- `content-draft-YYYY-MM-DD.json` → cardnews 입력
- `content-published-YYYY-MM-DD.json` → daily-report 입력

## 옵션

- `--auto` — 전체 단계 자동 실행
- `--step <plan|write|design|publish|track>` — 특정 단계만 실행
- `--topic <주제>` — 콘텐츠 주제 지정
- `--skip-review` — 각 단계 승인 없이 진행 (위험)

## 실행 흐름

### 자동 모드 (`--auto`)
1. seo-content-planner 실행 → `events/seo-plan-YYYY-MM-DD.json` 생성
2. 생성된 키워드/주제로 copywriting 실행 → `events/content-draft-YYYY-MM-DD.json` 생성
3. 원고 기반 cardnews 생성 → `events/cardnews-ready-YYYY-MM-DD.json` 생성
4. 이미지 + 캡션으로 social-publisher 실행 → `events/content-published-YYYY-MM-DD.json` 생성
5. 게시 결과를 daily-report에 자동 포함

### 단계별 모드 (`--step`)
각 단계마다 승인 요청:
- 기획안 확인 → 승인 후 다음
- 원고 확인 → 승인 후 다음
- 카드뉴스 미리보기 → 승인 후 게시

## 예시

### 포토부스 활용 팁 콘텐츠 생성
```bash
content-pipeline --auto --topic "포토부스로 결혼식 추억 남기기"
```

결과:
- SEO 키워드: "포토부스 결혼식", "웨딩 포토부스" 등
- 블로그 원고 1200자
- 카드뉴스 5장 (1024x1024 정사각형)
- 인스타그램 자동 게시 (협업 계정 태그)
- 일일 리포트에 게시 결과 포함

### 단계별 수동 확인
```bash
# 1. 기획안 먼저 확인
content-pipeline --step plan --topic "대학 축제 포토부스"
# → events/seo-plan-2026-02-14.json 생성

# 2. 기획안 확인 후 원고 작성
content-pipeline --step write
# → events/content-draft-2026-02-14.json 생성

# 3. 원고 확인 후 디자인
content-pipeline --step design
# → 카드뉴스 5장 생성

# 4. 최종 확인 후 게시
content-pipeline --step publish
```

## 주의사항

- `--auto` 모드는 각 단계를 자동으로 진행하므로, 최종 게시 전 반드시 내용 확인
- 이미지는 반드시 JPG 포맷 (PNG는 인스타그램 에러 가능)
- 게시 후 `events/content-published-YYYY-MM-DD.json`을 daily-report가 자동 수집

## 구현 가이드

이 스킬은 메타 스킬이므로 실제 구현 시:
1. `events/seo-plan-*.json` 확인 → 있으면 로드
2. 없으면 seo-content-planner 실행
3. 결과를 다음 스킬 입력으로 전달
4. 각 단계마다 이벤트 파일 생성

---

**Author**: 무펭이 🐧  
**Created**: 2026-02-14  
**Status**: Production Ready
