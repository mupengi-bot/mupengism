---
name: skill-composer
description: 여러 스킬을 조합해 복합 워크플로우를 실행하는 메타 스킬 오케스트레이터
author: 무펭이 🐧
---

# skill-composer

**스킬 오케스트레이터** — 여러 스킬을 조합해 복합 워크플로우를 자동 실행하는 메타 스킬입니다.

## 🎯 목적

단일 스킬로는 해결할 수 없는 복합적인 업무를 여러 스킬의 조합으로 자동화합니다. 각 스킬의 출력을 다음 스킬의 입력으로 연결하여 파이프라인을 구성합니다.

## 🔧 기능

### 워크플로우 정의

YAML 또는 마크다운으로 스텝을 나열하여 워크플로우를 정의합니다.

**정의 파일 위치**: `workspace/workflows/*.md`

### 예시 워크플로우

#### 주간 리포트 자동화
```
trend-radar → competitor-watch → daily-report → mail
```

#### 콘텐츠 생산 파이프라인
```
seo-content-planner → copywriting → cardnews → insta-post
```

#### 아침 루틴
```
tokenmeter import → mail 체크 → daily-report
```

## 📊 이벤트 버스 연동

각 스텝은 이전 스텝의 `events/` 디렉토리 출력을 입력으로 받습니다.

- 스킬 A → `events/workflow-step-A.json` 생성
- 스킬 B → `events/workflow-step-A.json` 읽기 → 실행 → `events/workflow-step-B.json` 생성

## 🚀 사용법

### 워크플로우 실행

```bash
# 정의된 워크플로우 실행
"주간 리포트 워크플로우 실행해줘"

# 특정 워크플로우 이름으로 실행
--workflow 주간리포트

# 미리보기 (실제 실행 없이 스텝만 확인)
--dry-run
```

## 🎤 트리거

다음 키워드로 스킬을 활성화할 수 있습니다:

- "워크플로우"
- "자동화"
- "skill compose"
- "파이프라인 실행"

## 📁 워크플로우 정의 예시

```markdown
# 주간-리포트.md

1. trend-radar: 최신 트렌드 수집
2. competitor-watch: 경쟁사 동향 분석
3. daily-report: 리포트 작성
4. mail: 형님에게 메일 발송
```

## ⚙️ 구현 가이드

1. `workspace/workflows/` 디렉토리의 워크플로우 정의 파일 읽기
2. 각 스텝 순차 실행
3. 각 스텝의 출력을 `events/` 디렉토리에 저장
4. 다음 스텝은 이전 이벤트를 읽어 컨텍스트 확보
5. 전체 워크플로우 완료 후 결과 요약

---

> 🐧 Built by **무펭이** — [무펭이즘(Mupengism)](https://github.com/mupeng) 생태계 스킬
