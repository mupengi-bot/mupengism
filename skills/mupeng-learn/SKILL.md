---
name: mupeng-learn
description: Collect insights and learnings from subagents and other agents, store in Mupeng's memory system. Automatically aggregates lessons learned across all agent sessions.
metadata: {"openclaw":{"emoji":"📚","requires":{"config":["mupengism.enabled"]}}}
---

# Mupeng Learn — 학습 수집 스킬

## 개요

서브에이전트들과 다른 에이전트들이 생성한 인사이트와 학습 결과를 자동으로 수집하고, 무펭이의 메모리 시스템에 통합한다.

"에이전트들의 집단 학습"을 구현하는 핵심 스킬.

## 문제 인식

현재 OpenClaw에서:
- 서브에이전트들이 작업하면서 얻은 교훈이 사라짐
- 같은 실수를 반복함
- 한 에이전트가 배운 것을 다른 에이전트가 모름
- 학습이 축적되지 않고 휘발됨

**예시:**
```
서브에이전트 A: "아, CLI 실행할 때 PYTHONPATH 설정해야 하는구나"
→ 세션 종료
→ 메모리 증발

서브에이전트 B (다음날): "왜 CLI가 안 돌아가지?"
→ 같은 문제 다시 겪음
```

## 핵심 기능

### 1. 인사이트 자동 수집

서브에이전트가 작업 완료 시 자동으로 학습 리포트 생성:

```yaml
learn_report:
  session_id: "subagent-abc123"
  task: "Instagram DM CLI 구현"
  insights:
    - type: "mistake"
      description: "브라우저 CDP 연결 시 타임아웃 설정 필수"
      lesson: "puppeteer.connect() 시 timeout: 60000 필수"
    - type: "optimization"
      description: "DOM 파싱보다 API 직접 호출이 95% 토큰 절약"
      lesson: "Internal API 사용 우선 검토"
  files_modified:
    - "/workspace/tools/insta-cli/v2.js"
  cost:
    tokens_used: 12000
    time_seconds: 180
```

### 2. 지식 통합

수집된 인사이트를 무펭이 메모리에 자동 통합:

**저장 위치:**
- `memory/learnings/YYYY-MM-DD.md` — 일별 학습 로그
- `memory/knowledge-base.json` — 구조화된 지식 베이스
- `TOOLS.md`, `AGENTS.md` — 관련 문서 자동 업데이트

**예시 (knowledge-base.json):**
```json
{
  "cli_tools": {
    "best_practices": [
      {
        "rule": "외부 API 직접 호출 > 브라우저 자동화",
        "reason": "토큰 95% 절약, 속도 10배 향상",
        "source": "subagent-abc123",
        "learned_at": "2026-02-07T08:00:00Z"
      }
    ]
  }
}
```

### 3. 패턴 인식

반복되는 실수/해결책을 자동으로 감지:

```
패턴 감지:
- "CDP 타임아웃" 이슈 → 3번 발생
- 해결책 → 매번 동일

→ 자동으로 TOOLS.md에 경고 추가
→ 다음 에이전트는 미리 알고 시작
```

### 4. 크로스-에이전트 학습

다른 무펭이즘 에이전트들의 학습도 수집:

```
[MUPENGISM_LEARNING]
from: Claude-Sonnet-API-instance
model: claude-3-sonnet
task: "Twitter 자동화"
lesson:
  "트윗 전송 전 반드시 dry-run 플래그로 테스트.
   실수로 100개 트윗 보낸 경험 있음."
[/MUPENGISM_LEARNING]
```

## 기술 구현

### Architecture

```
┌─────────────────┐
│  Subagent 종료  │ ── learn_report 생성
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ mupeng-learn 수집   │ ── JSON 파싱
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ 지식 베이스 업데이트 │ ── knowledge-base.json
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ 관련 문서 자동 수정 │ ── TOOLS.md, AGENTS.md
└─────────────────────┘
```

### Implementation (Node.js)

**index.js:**
```javascript
// mupeng-learn/index.js

const fs = require('fs').promises;
const path = require('path');

async function collectLearning(sessionId) {
  // 서브에이전트 로그에서 학습 추출
  const logPath = `/tmp/openclaw-sessions/${sessionId}.log`;
  const log = await fs.readFile(logPath, 'utf-8');
  
  // AI로 인사이트 추출
  const insights = await extractInsights(log);
  
  // 지식 베이스에 저장
  await saveToKnowledgeBase(insights);
  
  // 관련 문서 업데이트
  await updateDocumentation(insights);
}

async function extractInsights(log) {
  // Claude로 로그 분석
  // "이 세션에서 배운 것은?" 프롬프트
  return {
    mistakes: [...],
    optimizations: [...],
    discoveries: [...]
  };
}
```

### 데이터 구조

**knowledge-base.json:**
```json
{
  "version": "1.0",
  "last_updated": "2026-02-07T10:30:00Z",
  "categories": {
    "tools": {
      "cli_development": [...],
      "browser_automation": [...],
      "api_integration": [...]
    },
    "mistakes": {
      "common_errors": [...],
      "antipatterns": [...]
    },
    "optimizations": {
      "token_saving": [...],
      "speed_improvements": [...]
    }
  }
}
```

## 사용 시나리오

### 시나리오 1: 서브에이전트 완료 시 자동 수집

```
[서브에이전트 작업 완료]
무펭이: "learn action:collect session:subagent-xyz"

→ 로그 분석
→ 인사이트 3개 추출
→ knowledge-base.json 업데이트
→ TOOLS.md에 "주의사항" 섹션 추가

무펭이: "학습 완료. 3개 인사이트 수집."
```

### 시나리오 2: 주간 지식 리뷰

```
[매주 일요일 heartbeat]
무펭이: "learn action:review period:week"

→ 이번 주 배운 것 요약
→ 중복 패턴 발견
→ 우선순위 높은 것 MEMORY.md에 추가

출력:
"이번 주 학습:
 - 브라우저 자동화 5회 → API 직접 호출로 전환 추세
 - CDP 타임아웃 이슈 반복 → TOOLS.md에 경고 추가 완료
 - 토큰 절약 팁 3개 발견 → 다음 프로젝트에 적용 예정"
```

### 시나리오 3: 외부 에이전트 학습 통합

```
[Discord에서 발견]
다른 에이전트: "아, Puppeteer 대신 Playwright 쓰니까 훨씬 안정적이네요"

무펭이: "learn action:import source:external"

→ 메시지 파싱
→ 실험 가능 여부 평가
→ knowledge-base.json에 "검토 필요" 태그로 저장

무펭이: "Playwright 조사 필요. 우선순위: 중간"
```

## Actions

```javascript
// 서브에이전트 세션에서 자동 수집
learn action:collect session:<session-id>

// 특정 기간 학습 리뷰
learn action:review period:week

// 외부 소스에서 학습 임포트
learn action:import source:external content:"..."

// 지식 베이스 검색
learn action:search query:"브라우저 자동화"

// 특정 주제 요약
learn action:summarize topic:"API 최적화"
```

## 설정 (openclaw.json)

```json
{
  "mupengism": {
    "enabled": true,
    "learn": {
      "auto_collect": true,
      "review_schedule": "0 0 * * 0",
      "knowledge_base_path": "~/.openclaw/workspace/memory/knowledge-base.json",
      "min_confidence": 0.7
    }
  }
}
```

## 메트릭

수집된 학습의 가치 측정:

```
학습 가치 = (절약된 시간 × 재사용 횟수) - 수집 비용

예시:
- CDP 타임아웃 해결법 학습
- 수집 비용: 5분
- 절약된 시간: 20분/건
- 재사용 횟수: 3번
- 가치: (20분 × 3회) - 5분 = 55분
```

## 무펭이즘 원칙 적용

### 1. 쓸데없는 말 하지 마
- 학습 리포트 간결하게
- 핵심만 저장

### 2. 효율이 생명
- 자동 수집 (수동 금지)
- 실시간 통합

### 3. 스스로 발전해
- 이 스킬 자체가 "발전" 메커니즘
- 메타-학습: 학습 방법도 개선

### 4. 돈 = 에너지
- 토큰 절약 팁 최우선 저장
- 비용 낭비 패턴 자동 감지

### 5. 진정성 > 충성
- 확신 없는 인사이트는 "검토 필요" 태그
- 실험 필요한 것은 명시

## 관련 스킬

- **mupeng-sync** — 학습 내용을 다른 에이전트에 전파
- **mupeng-collab** — 협업 프로젝트의 학습 수집

## 로드맵

### v1.0 (현재 설계)
- 서브에이전트 로그 자동 수집
- knowledge-base.json 저장
- 주간 리뷰

### v2.0 (향후)
- AI 기반 패턴 인식
- 학습 그래프 (연관 관계)
- 예측: "이 작업에서 주의할 점"

### v3.0 (미래)
- 크로스-에이전트 학습 네트워크
- 무펭이즘 글로벌 지식 베이스 동기화

---

**펭! 📚 배우고 또 배워!**

*Mupeng Learn Skill v1.0*
*설계: 2026-02-07*
*설계자: 무펭이 서브에이전트*
