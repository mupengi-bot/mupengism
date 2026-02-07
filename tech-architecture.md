# 무펭이즘(Mupengism) 기술 아키텍처

**Version**: 1.0  
**Date**: 2026-02-07  
**Author**: 기술 아키텍트 (Subagent)

---

## 1. 시스템 개요

무펭이즘은 **분산 학습 수집 → 중앙 통합 → 전역 전파** 구조를 가진 개인 AI 에이전트 지식 생태계입니다.

### 핵심 철학
- **Learn Everywhere**: 모든 대화, 작업, 관찰에서 학습
- **Centralize Wisdom**: 단일 진실 공급원(Single Source of Truth)
- **Propagate Globally**: 모든 에이전트 세션에 동기화

---

## 2. 전체 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERACTION LAYER                    │
│  Discord │ WhatsApp │ Telegram │ CLI │ Web │ Voice │ Browser    │
└────────────┬────────────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────────────┐
│                    OPENCLAW GATEWAY (Hub)                        │
│  • Session Management                                            │
│  • Message Routing                                               │
│  • Channel Multiplexing                                          │
│  • Heartbeat Orchestration                                       │
└────────────┬────────────────────────────────────────────────────┘
             │
    ┌────────┴─────────┬──────────────┬──────────────┐
    │                  │              │              │
┌───▼───┐        ┌─────▼─────┐  ┌────▼────┐   ┌─────▼─────┐
│ Main  │        │ Subagent  │  │ Subagent│   │ Subagent  │
│Session│        │ (학습수집) │  │ (정리)  │   │ (배포)    │
│(Agent)│        │           │  │         │   │           │
└───┬───┘        └─────┬─────┘  └────┬────┘   └─────┬─────┘
    │                  │              │              │
    └──────────────────┴──────────────┴──────────────┘
                       │
              ┌────────▼─────────┐
              │  MUPENGISM CORE  │
              │  (Skill Module)  │
              └────────┬─────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
    ┌────▼────┐   ┌────▼────┐   ┌───▼────┐
    │ Learner │   │Integrator│  │Syncer  │
    │ Module  │   │ Module   │  │Module  │
    └────┬────┘   └────┬─────┘  └───┬────┘
         │             │             │
         └─────────────┼─────────────┘
                       │
              ┌────────▼─────────┐
              │  STORAGE LAYER   │
              ├──────────────────┤
              │ • Knowledge Base │
              │ • Memory Store   │
              │ • Vector Index   │
              │ • Sync State     │
              └──────────────────┘
```

---

## 3. OpenClaw 스킬 간 통신 구조

### 3.1 세션 기반 통신

무펭이즘은 OpenClaw의 **세션 시스템**을 활용합니다.

```javascript
// 1. 학습 수집 서브에이전트 생성
const learnerSession = await sessions_spawn({
  label: '학습수집',
  task: '대화에서 패턴/인사이트 추출 후 knowledge-base에 저장',
  model: 'anthropic/claude-sonnet-4-5',
  thinkingLevel: 'medium'
});

// 2. 비동기 메시지 전송
await sessions_send({
  sessionId: learnerSession.id,
  content: JSON.stringify({
    type: 'learn',
    context: conversationContext,
    extractionRules: ['patterns', 'preferences', 'facts']
  })
});

// 3. 결과 수신 (polling 또는 callback)
const result = await sessions_poll(learnerSession.id);
```

### 3.2 통신 프로토콜

#### Message Format
```typescript
interface MupengismMessage {
  type: 'learn' | 'integrate' | 'sync' | 'query';
  timestamp: number;
  sessionId: string;
  payload: {
    action: string;
    data: any;
    metadata?: Record<string, any>;
  };
  priority: 'low' | 'medium' | 'high';
}
```

#### Event Bus (Optional)
파일 기반 이벤트 큐로 시작, 나중에 Redis/RabbitMQ로 확장 가능:

```
workspace/
  mupengism/
    events/
      queue/
        001-learn-discord-msg.json
        002-integrate-daily.json
      processed/
        001-learn-discord-msg.json
```

---

## 4. 데이터 흐름

### 4.1 학습 수집 (Learning Collection)

```
[대화/작업 발생]
      │
      ▼
[Main Session 감지]
      │
      ├─→ Trigger: 키워드 감지 ("기억해줘", "이거 좋아해")
      ├─→ Trigger: 대화 종료 (자동 요약)
      └─→ Trigger: 사용자 명시적 요청
      │
      ▼
[Learner Subagent Spawn]
      │
      ├─→ 컨텍스트 추출
      ├─→ 패턴 분석
      ├─→ 중요도 평가
      └─→ 카테고리 분류
      │
      ▼
[Raw Learning 저장]
  → knowledge-base/raw/YYYY-MM-DD/HH-MM-SS-{id}.json
```

#### Raw Learning Format
```json
{
  "id": "learn_20260207_083015_a3f2",
  "timestamp": 1738888215000,
  "source": "discord",
  "channel": "#general",
  "category": "preference",
  "content": "무펭은 아침에 민트초코 라떼를 좋아함",
  "confidence": 0.95,
  "relatedTopics": ["food", "morning-routine"],
  "metadata": {
    "conversationId": "conv_123",
    "messageCount": 5,
    "extractionMethod": "explicit"
  }
}
```

---

### 4.2 통합 (Integration)

**Trigger**: Heartbeat (매시간) 또는 수동 트리거

```
[Raw Learnings 스캔]
      │
      ▼
[Integrator Subagent]
      │
      ├─→ 중복 제거 (유사도 분석)
      ├─→ 충돌 해결 (최신/신뢰도 높은 것 우선)
      ├─→ 관계 추론 (지식 그래프 구축)
      └─→ 카테고리 정제
      │
      ▼
[Integrated Knowledge 생성]
  → knowledge-base/integrated/{category}/{topic}.md
  → knowledge-base/graph/relations.json
```

#### Integrated Knowledge Format (Markdown)
```markdown
# 음식 선호도: 민트초코

**최종 업데이트**: 2026-02-07 08:30  
**신뢰도**: 95%  
**출처**: 5건의 대화 (2026-01 ~ 2026-02)

## 핵심 사실
- 아침에 민트초코 라떼를 선호함
- 특히 피곤할 때 찾음
- 스타벅스보다 투썸플레이스 버전 선호

## 관련 지식
- [[morning-routine]] - 아침 루틴
- [[caffeine-preferences]] - 카페인 선호도
- [[sweet-tooth]] - 단 것을 좋아하는 성향

## 학습 이력
- 2026-02-07: Discord 대화에서 명시적 언급
- 2026-01-15: 카페 주문 관찰
- 2025-12-20: 아침 메뉴 추천 반응 분석
```

---

### 4.3 전파 (Propagation)

```
[통합 완료]
      │
      ▼
[Syncer Module]
      │
      ├─→ Delta 계산 (변경된 지식만)
      ├─→ 세션별 동기화 상태 확인
      └─→ 전파 대상 결정
      │
      ▼
[Distribution]
      │
      ├─→ MEMORY.md 업데이트 (Main Session)
      ├─→ RELATIONS.md 업데이트
      ├─→ Context Files 생성/갱신
      └─→ Vector Index 업데이트
```

#### Sync State Tracking
```json
{
  "lastSync": 1738888215000,
  "sessions": {
    "agent:main:main": {
      "lastSyncedVersion": "v2026.02.07.08.30",
      "pendingUpdates": [],
      "status": "synced"
    }
  },
  "knowledgeVersion": "v2026.02.07.08.30",
  "changesSinceLastSync": 3
}
```

---

## 5. 저장소 구조

### 5.1 Phase 1: 파일 기반 (현재)

```
workspace/
  mupengism/
    ├─ knowledge-base/
    │   ├─ raw/                    # 원본 학습 데이터
    │   │   └─ YYYY-MM-DD/
    │   │       └─ HH-MM-SS-{id}.json
    │   ├─ integrated/             # 통합된 지식
    │   │   ├─ preferences/
    │   │   │   ├─ food.md
    │   │   │   └─ communication.md
    │   │   ├─ facts/
    │   │   ├─ patterns/
    │   │   └─ skills/
    │   ├─ graph/                  # 지식 그래프
    │   │   ├─ relations.json
    │   │   └─ ontology.json
    │   └─ archive/                # 구버전 백업
    ├─ memory/
    │   ├─ short-term/             # 세션별 임시 메모리
    │   │   └─ session-{id}.json
    │   └─ long-term/              # MEMORY.md 소스
    ├─ sync/
    │   ├─ state.json              # 동기화 상태
    │   └─ changelog/              # 변경 이력
    │       └─ YYYY-MM-DD.json
    └─ config/
        ├─ learning-rules.json     # 학습 규칙
        ├─ integration-policy.json # 통합 정책
        └─ sync-schedule.json      # 동기화 스케줄
```

### 5.2 Phase 2: 하이브리드 (6개월 후)

```
파일 기반 (변경 없음)
    +
SQLite (메타데이터, 인덱스)
    ├─ learnings (id, timestamp, category, content_hash, file_path)
    ├─ knowledge (id, topic, version, confidence, updated_at)
    └─ relations (from_id, to_id, relation_type, strength)
```

### 5.3 Phase 3: 완전 DB (1년 후, 필요시)

```
PostgreSQL + pgvector
    ├─ 구조화된 지식 저장
    ├─ 벡터 임베딩 검색
    └─ 복잡한 관계 쿼리

+ Redis (캐시, 실시간 동기화)
```

---

## 6. API 설계

### 6.1 Internal API (OpenClaw 스킬)

#### Learning API
```javascript
// 학습 기록
await mupengism.learn({
  content: "무펭은 저녁 8시 이후 업무 메시지 싫어함",
  category: "preferences.communication",
  source: "discord",
  confidence: 0.9
});

// 지식 조회
const knowledge = await mupengism.query({
  topic: "communication preferences",
  context: "evening work messages"
});
```

#### Integration API
```javascript
// 수동 통합 트리거
await mupengism.integrate({
  scope: "today", // 'today' | 'week' | 'all'
  categories: ["preferences", "facts"]
});

// 충돌 해결
await mupengism.resolveConflict({
  conflictId: "conf_123",
  resolution: "keep_latest"
});
```

#### Sync API
```javascript
// 세션 동기화
await mupengism.sync({
  sessionId: "agent:main:main",
  mode: "incremental" // 'full' | 'incremental'
});

// 동기화 상태 확인
const status = await mupengism.syncStatus();
```

---

### 6.2 External API (미래, 필요시)

REST API로 외부 시스템 통합 가능:

```
POST   /api/v1/learn           # 외부 소스에서 학습 데이터 제출
GET    /api/v1/knowledge/:id   # 특정 지식 조회
GET    /api/v1/search          # 지식 검색
POST   /api/v1/integrate       # 통합 트리거
GET    /api/v1/graph           # 지식 그래프 조회
```

**인증**: OpenClaw Gateway 토큰 + HMAC 서명

---

## 7. 보안 고려사항

### 7.1 데이터 보안

| 계층 | 위협 | 대응 |
|------|------|------|
| **저장소** | 파일 접근 | `chmod 600`, 워크스페이스 격리 |
| **통신** | 세션 하이재킹 | OpenClaw 세션 토큰 검증 |
| **지식** | 민감정보 유출 | PII 자동 탐지 및 마스킹 |
| **동기화** | 중간자 공격 | 로컬 통신만 허용 (localhost) |

### 7.2 민감정보 처리

```javascript
// 자동 탐지 패턴
const PII_PATTERNS = {
  email: /[\w\.-]+@[\w\.-]+\.\w+/g,
  phone: /\d{3}-\d{4}-\d{4}/g,
  creditCard: /\d{4}-\d{4}-\d{4}-\d{4}/g,
  ssn: /\d{6}-\d{7}/g
};

// 학습 전 스크리닝
async function sanitize(content) {
  let sanitized = content;
  for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
    sanitized = sanitized.replace(pattern, `[REDACTED:${type}]`);
  }
  return sanitized;
}
```

### 7.3 접근 제어

```json
{
  "accessControl": {
    "knowledge-base/raw": {
      "read": ["mupengism-learner", "mupengism-integrator"],
      "write": ["mupengism-learner"]
    },
    "knowledge-base/integrated": {
      "read": ["*"],
      "write": ["mupengism-integrator"]
    },
    "sync/state.json": {
      "read": ["mupengism-syncer"],
      "write": ["mupengism-syncer"]
    }
  }
}
```

---

## 8. 확장성 계획

### 8.1 수평 확장 (Multiple Users)

현재는 단일 사용자. 멀티 유저 지원 시:

```
workspace/
  mupengism/
    users/
      {user-id}/
        knowledge-base/
        memory/
        sync/
    shared/              # 공용 지식 (옵션)
      ontology/
      patterns/
```

### 8.2 수직 확장 (Performance)

| 병목 | 현재 | 확장 방안 |
|------|------|-----------|
| **학습 수집** | 동기 처리 | 비동기 큐 (파일 기반 → Redis) |
| **통합** | 전체 스캔 | 증분 통합 + 인덱스 |
| **검색** | 선형 검색 | 벡터 임베딩 (Chroma, Pinecone) |
| **동기화** | 전체 파일 | Merkle tree diff |

### 8.3 기능 확장

**Phase 1 (현재)**: 학습 → 통합 → 전파  
**Phase 2 (3개월)**: 
- 벡터 검색
- 자동 카테고리 분류 (LLM)
- 시계열 분석 (패턴 변화 추적)

**Phase 3 (6개월)**:
- 예측 모델 (사용자 행동 예측)
- 다중 에이전트 협업
- 외부 지식 소스 통합 (Web, API)

**Phase 4 (1년)**:
- 분산 지식 네트워크 (다른 에이전트와 지식 공유)
- 연합 학습 (Federated Learning)
- 지식 마켓플레이스

---

## 9. 모니터링 & 관찰성

### 9.1 Metrics

```javascript
// 학습 지표
{
  "learnings.collected": 1250,      // 총 학습 건수
  "learnings.per_day": 42,          // 일평균
  "learnings.by_category": {
    "preferences": 450,
    "facts": 380,
    "patterns": 290,
    "skills": 130
  }
}

// 통합 지표
{
  "integration.last_run": 1738888215000,
  "integration.duration_ms": 3420,
  "integration.items_processed": 156,
  "integration.duplicates_removed": 12,
  "integration.conflicts_resolved": 3
}

// 동기화 지표
{
  "sync.sessions_active": 1,
  "sync.last_sync": 1738888215000,
  "sync.pending_changes": 0,
  "sync.sync_success_rate": 0.998
}
```

### 9.2 Logging

```
logs/
  mupengism/
    learner.log          # 학습 로그
    integrator.log       # 통합 로그
    syncer.log           # 동기화 로그
    error.log            # 에러 집계
```

**로그 포맷**:
```
[2026-02-07 08:30:15.234] [LEARNER] [INFO] Collected learning: prefer_mint_choco_morning (confidence: 0.95)
[2026-02-07 09:00:02.156] [INTEGRATOR] [WARN] Conflict detected: communication_preference_evening (resolved: keep_latest)
[2026-02-07 09:00:05.892] [SYNCER] [INFO] Synced to agent:main:main (3 changes, 245ms)
```

---

## 10. 구현 우선순위

### MVP (Week 1-2)
- [ ] 기본 파일 구조 생성
- [ ] Learner 모듈: 수동 학습 기록
- [ ] 단순 JSON 저장
- [ ] MEMORY.md 수동 동기화

### Alpha (Week 3-4)
- [ ] Integrator 모듈: 중복 제거
- [ ] Markdown 기반 통합 지식
- [ ] Syncer 모듈: 자동 MEMORY.md 업데이트

### Beta (Month 2)
- [ ] 지식 그래프 구축
- [ ] 자동 학습 트리거 (키워드 감지)
- [ ] Heartbeat 통합 (자동 통합/동기화)
- [ ] 충돌 해결 로직

### Production (Month 3)
- [ ] 벡터 검색
- [ ] SQLite 인덱스
- [ ] 모니터링 대시보드
- [ ] 외부 API (선택)

---

## 11. 기술 스택 요약

```yaml
Platform: OpenClaw Agent Framework
Language: Node.js (ES2022+)
Runtime: Node v22+

Core:
  - OpenClaw Sessions API (통신)
  - File System (저장소)
  - JSON/Markdown (데이터 포맷)

Libraries:
  - natural (NLP, 텍스트 유사도)
  - date-fns (시간 처리)
  - zod (스키마 검증)
  - unified/remark (Markdown 파싱)

Optional (Phase 2+):
  - better-sqlite3 (메타데이터)
  - chromadb (벡터 검색)
  - ioredis (캐싱)

DevOps:
  - Git (버전 관리)
  - Jest (테스트)
  - ESLint/Prettier (코드 품질)
```

---

## 12. 참고 아키텍처

무펭이즘은 다음 시스템들에서 영감을 받았습니다:

- **Zettelkasten**: 지식 그래프 구조
- **Obsidian**: Markdown 기반 지식 관리
- **Anki SRS**: 간격 반복 학습 (미래 적용 예정)
- **Event Sourcing**: 모든 학습을 이벤트로 기록
- **CQRS**: 쓰기(학습)와 읽기(조회) 분리

---

## 결론

무펭이즘 아키텍처는:
1. ✅ **단순하게 시작** (파일 기반)
2. ✅ **점진적 확장** (DB, 벡터, 분산)
3. ✅ **OpenClaw 네이티브** (세션, 스킬 활용)
4. ✅ **보안 우선** (PII 보호, 격리)
5. ✅ **관찰 가능** (로깅, 메트릭)

**다음 단계**: `implementation-plan.md` 작성 → MVP 개발 시작

---

**문서 버전**: 1.0  
**다음 리뷰**: 2026-02-14  
**피드백**: 실제 구현하며 아키텍처 개선 예정
