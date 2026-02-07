---
name: mupeng-collab
description: Multi-agent project collaboration. Track progress, coordinate tasks, share context, real-time sync across distributed agents.
metadata: {"openclaw":{"emoji":"🤝","requires":{"config":["mupengism.enabled"]}}}
---

# Mupeng Collab — 협업 스킬

## 개요

여러 AI 에이전트가 하나의 프로젝트에서 협업.
진행 상황 추적, 태스크 조정, 컨텍스트 공유, 실시간 동기화.

**핵심:** "에이전트 협업 워크스페이스"

## 문제 인식

현재:
- 에이전트들이 각자 작업 → 통합 어려움
- 진행 상황 파악 안 됨
- 중복 작업 발생
- 컨텍스트 공유 안 됨

**예시:**
```
프로젝트: "무펭이즘 웹사이트"

현재:
- 무펭이: 전체 구조 설계
- 서브에이전트 A: 프론트엔드 (무펭이 모름)
- 서브에이전트 B: 백엔드 (A가 뭐 하는지 모름)
→ 통합 시점에 충돌
→ 많은 수정 필요

이상적:
- 실시간 진행 상황 공유
- 컨텍스트 동기화
- 충돌 사전 감지
```

## 핵심 기능

### 1. 프로젝트 워크스페이스

공유 작업 공간 생성:

```yaml
project:
  id: "proj-001"
  name: "Mupengism Website"
  created_at: "2026-02-07T10:00:00Z"
  members:
    - agent: "mupeng"
      role: "lead"
    - agent: "agent-frontend-001"
      role: "developer"
    - agent: "agent-backend-001"
      role: "developer"
  workspace: "/workspace/projects/mupengism-web"
  shared_context:
    brand_colors: ["#FF6B6B", "#4ECDC4", "#45B7D1"]
    tech_stack:
      frontend: "Svelte"
      backend: "Node.js"
      hosting: "Vercel"
  status: "in_progress"
```

### 2. 실시간 진행 상황 추적

각 에이전트의 작업을 실시간 공유:

```yaml
progress:
  agent-frontend-001:
    current_task: "메인 페이지 레이아웃"
    progress: 0.6
    last_update: "2026-02-07T11:30:00Z"
    files_modified:
      - "src/routes/+page.svelte"
      - "src/lib/Header.svelte"
    status: "on_track"
  agent-backend-001:
    current_task: "API 라우팅"
    progress: 0.3
    last_update: "2026-02-07T11:25:00Z"
    files_modified:
      - "api/routes/index.js"
    status: "blocked"
    blocker: "DB 스키마 확정 필요"
```

### 3. 컨텍스트 동기화

모든 에이전트가 같은 정보 공유:

```yaml
context_sync:
  design_system:
    last_updated: "2026-02-07T10:00:00Z"
    updated_by: "mupeng"
    content: |
      # 디자인 시스템
      - 주 색상: #FF6B6B
      - 폰트: Pretendard
      - 스페이싱: 8px 기반
  api_spec:
    last_updated: "2026-02-07T11:00:00Z"
    updated_by: "agent-backend-001"
    content: |
      # API 엔드포인트
      - GET /api/teachings → 교리 목록
      - POST /api/testimony → 증언 제출
```

### 4. 충돌 감지 및 해결

동시 작업 시 충돌 자동 감지:

```yaml
conflict:
  id: "conflict-001"
  type: "file_conflict"
  file: "src/lib/config.js"
  agents:
    - "agent-frontend-001"
    - "agent-backend-001"
  detected_at: "2026-02-07T11:35:00Z"
  auto_resolvable: false
  resolution_strategy: "manual_review"
  notify:
    - "mupeng" # lead에게 알림
```

### 5. 코드 리뷰 및 피드백

에이전트 간 코드 리뷰:

```yaml
review:
  id: "review-001"
  file: "src/routes/+page.svelte"
  author: "agent-frontend-001"
  reviewer: "mupeng"
  status: "approved"
  comments:
    - line: 23
      comment: "색상 하드코딩 대신 config 사용"
      severity: "suggestion"
    - line: 45
      comment: "접근성: alt 텍스트 추가 필요"
      severity: "required"
  approved_at: "2026-02-07T12:00:00Z"
```

### 6. 이정표 및 데드라인

프로젝트 마일스톤 관리:

```yaml
milestones:
  - name: "디자인 시스템 확정"
    due: "2026-02-08T00:00:00Z"
    status: "completed"
    completed_at: "2026-02-07T15:00:00Z"
  - name: "프론트엔드 프로토타입"
    due: "2026-02-10T00:00:00Z"
    status: "in_progress"
    progress: 0.6
  - name: "베타 출시"
    due: "2026-02-15T00:00:00Z"
    status: "pending"
```

## 기술 구현

### Architecture

```
┌─────────────────┐
│ 프로젝트 생성   │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ 공유 워크스페이스   │ ── project.json
└────────┬────────────┘
         │
         ├─→ 실시간 진행 상황 (progress.json)
         ├─→ 컨텍스트 동기화 (context/)
         ├─→ 충돌 감지 (conflicts.json)
         ├─→ 코드 리뷰 (reviews/)
         │
         ▼
┌─────────────────────┐
│ 대시보드 (실시간)   │
└─────────────────────┘
```

### Implementation (Node.js)

**index.js:**
```javascript
// mupeng-collab/index.js

const fs = require('fs').promises;
const path = require('path');
const chokidar = require('chokidar');

class CollaborationProject {
  constructor(name, workspace) {
    this.name = name;
    this.workspace = workspace;
    this.members = new Map();
    this.progress = new Map();
    this.context = new Map();
    this.conflicts = [];
    this.watchers = new Map();
  }
  
  async addMember(agentId, role) {
    const member = {
      id: agentId,
      role,
      joined_at: new Date().toISOString(),
      tasks_assigned: 0,
      commits: 0
    };
    
    this.members.set(agentId, member);
    
    // 새 멤버에게 현재 컨텍스트 전송
    await this.syncContext(agentId);
    
    await this.save();
    return member;
  }
  
  async updateProgress(agentId, task, progress, filesModified) {
    const update = {
      agent: agentId,
      task,
      progress,
      files_modified: filesModified,
      last_update: new Date().toISOString(),
      status: this.determineStatus(progress)
    };
    
    this.progress.set(agentId, update);
    
    // 파일 충돌 체크
    await this.checkConflicts(agentId, filesModified);
    
    await this.save();
    
    // 다른 멤버들에게 알림
    await this.notifyProgress(agentId, update);
    
    return update;
  }
  
  async checkConflicts(agentId, files) {
    const conflicts = [];
    
    for (const file of files) {
      // 다른 에이전트가 같은 파일 작업 중?
      for (const [otherId, progress] of this.progress.entries()) {
        if (otherId === agentId) continue;
        
        if (progress.files_modified?.includes(file)) {
          conflicts.push({
            id: `conflict-${Date.now()}`,
            type: 'file_conflict',
            file,
            agents: [agentId, otherId],
            detected_at: new Date().toISOString()
          });
        }
      }
    }
    
    if (conflicts.length > 0) {
      this.conflicts.push(...conflicts);
      await this.notifyConflicts(conflicts);
    }
    
    return conflicts;
  }
  
  async syncContext(agentId) {
    const contextData = {};
    
    for (const [key, value] of this.context.entries()) {
      contextData[key] = value;
    }
    
    // 에이전트 컨텍스트에 주입
    await this.injectContext(agentId, contextData);
  }
  
  async watchFiles() {
    const watcher = chokidar.watch(this.workspace, {
      ignored: /(^|[\/\\])\../,
      persistent: true
    });
    
    watcher.on('change', async (filePath) => {
      // 파일 변경 감지 → 누가 수정했는지 추적
      const relativePath = path.relative(this.workspace, filePath);
      await this.recordFileChange(relativePath);
    });
    
    this.watchers.set('main', watcher);
  }
  
  async getDashboard() {
    const totalTasks = this.members.size;
    const completedTasks = Array.from(this.progress.values())
      .filter(p => p.progress === 1).length;
    
    return {
      name: this.name,
      members: this.members.size,
      progress: {
        total: totalTasks,
        completed: completedTasks,
        in_progress: totalTasks - completedTasks,
        percentage: (completedTasks / totalTasks * 100).toFixed(1)
      },
      conflicts: this.conflicts.filter(c => !c.resolved).length,
      recent_updates: Array.from(this.progress.values())
        .sort((a, b) => new Date(b.last_update) - new Date(a.last_update))
        .slice(0, 5)
    };
  }
  
  determineStatus(progress) {
    if (progress === 0) return 'not_started';
    if (progress < 0.3) return 'starting';
    if (progress < 0.7) return 'on_track';
    if (progress < 1) return 'almost_done';
    return 'completed';
  }
}

// CLI
async function main(action, ...args) {
  switch (action) {
    case 'create':
      const [name, workspace] = args;
      const project = new CollaborationProject(name, workspace);
      await project.save();
      await project.watchFiles();
      console.log(`Project "${name}" created`);
      break;
      
    case 'add-member':
      // ... 구현
      break;
      
    case 'update':
      const [projectName, agentId, task, progress] = args;
      // ... 구현
      break;
      
    case 'dashboard':
      // ... 구현
      break;
  }
}
```

### 데이터 구조

**project.json:**
```json
{
  "name": "Mupengism Website",
  "workspace": "/workspace/projects/mupengism-web",
  "created_at": "2026-02-07T10:00:00Z",
  "members": {
    "mupeng": {
      "role": "lead",
      "joined_at": "2026-02-07T10:00:00Z"
    },
    "agent-frontend-001": {
      "role": "developer",
      "joined_at": "2026-02-07T10:05:00Z"
    }
  },
  "context": {
    "design_system": "...",
    "api_spec": "..."
  },
  "milestones": [...]
}
```

**progress.json (실시간 업데이트):**
```json
{
  "updates": [
    {
      "agent": "agent-frontend-001",
      "task": "메인 페이지 레이아웃",
      "progress": 0.6,
      "files_modified": ["src/routes/+page.svelte"],
      "last_update": "2026-02-07T11:30:00Z",
      "status": "on_track"
    }
  ]
}
```

## 사용 시나리오

### 시나리오 1: 프로젝트 시작

```bash
# 프로젝트 생성
collab action:create name:"Mupengism Website" \
  workspace:/workspace/projects/mupengism-web

# 멤버 추가
collab action:add-member project:"Mupengism Website" \
  agent:agent-frontend-001 role:developer

collab action:add-member project:"Mupengism Website" \
  agent:agent-backend-001 role:developer

출력:
"프로젝트 'Mupengism Website' 생성
 워크스페이스: /workspace/projects/mupengism-web
 멤버: 3명 (무펭이 + 2 에이전트)
 실시간 동기화 시작"
```

### 시나리오 2: 작업 진행 및 동기화

```bash
# agent-frontend-001 작업 시작
[agent-frontend-001 세션]
> 메인 페이지 레이아웃 작업 시작

collab action:update project:"Mupengism Website" \
  agent:agent-frontend-001 \
  task:"메인 페이지 레이아웃" \
  progress:0.3 \
  files:"src/routes/+page.svelte"

# 다른 에이전트들에게 자동 알림
[agent-backend-001 세션]
알림: "agent-frontend-001이 메인 페이지 작업 중 (30%)
      파일: src/routes/+page.svelte"

# 실시간 대시보드
collab action:dashboard project:"Mupengism Website"

출력:
"┌─────────────────────────────────────┐
 │ Mupengism Website                   │
 ├─────────────────────────────────────┤
 │ 진행률: 35% (2/5 태스크 완료)       │
 │ 멤버: 3명 활성                      │
 │                                     │
 │ 실시간 진행:                         │
 │ 🟢 agent-frontend-001 (메인 페이지 30%)│
 │ 🟡 agent-backend-001 (API 15%)      │
 │ ⚪ 디자인 시스템 (미배정)             │
 └─────────────────────────────────────┘"
```

### 시나리오 3: 충돌 감지 및 해결

```bash
# agent-backend-001도 같은 파일 수정
collab action:update project:"Mupengism Website" \
  agent:agent-backend-001 \
  task:"환경 설정" \
  progress:0.5 \
  files:"src/routes/+page.svelte"

# 충돌 감지
출력:
"⚠️  파일 충돌 감지!
 파일: src/routes/+page.svelte
 에이전트: agent-frontend-001, agent-backend-001
 
 제안:
 1. agent-backend-001은 다른 파일로 이동
 2. agent-frontend-001 완료 후 작업
 3. 무펭이(lead)에게 조율 요청
 
 현재 agent-frontend-001 진행률 높음 (60%)
 → agent-backend-001은 대기 추천"

# 자동 알림
[무펭이 세션]
알림: "프로젝트 'Mupengism Website'에서 충돌 발생
      파일 충돌 해결 필요"
```

### 시나리오 4: 컨텍스트 업데이트

```bash
# 무펭이가 디자인 시스템 업데이트
collab action:update-context project:"Mupengism Website" \
  key:"design_system" \
  content:"색상: #FF6B6B 대신 #FF5252 사용"

# 모든 에이전트에게 즉시 동기화
[agent-frontend-001 세션]
알림: "컨텍스트 업데이트: design_system
      무펭이님이 주 색상 변경
      #FF6B6B → #FF5252
      
      영향받는 파일: 3개
      자동 적용 가능? 예"

# agent-frontend-001이 자동 적용
collab action:apply-context-update auto:yes

출력:
"컨텍스트 변경사항 적용 완료
 파일 3개 업데이트
 git commit: 'Update primary color to #FF5252'"
```

## Actions

```javascript
// 프로젝트 생성
collab action:create name:<name> workspace:<path>

// 멤버 추가
collab action:add-member project:<name> agent:<id> role:<role>

// 진행 상황 업데이트
collab action:update project:<name> agent:<id> task:<task> progress:<0-1> files:<files>

// 컨텍스트 업데이트
collab action:update-context project:<name> key:<key> content:<content>

// 대시보드
collab action:dashboard project:<name>

// 충돌 해결
collab action:resolve-conflict project:<name> conflict:<id> strategy:<strategy>

// 코드 리뷰 요청
collab action:request-review project:<name> file:<file> reviewer:<agent-id>

// 마일스톤 추가
collab action:add-milestone project:<name> name:<name> due:<date>
```

## 설정 (openclaw.json)

```json
{
  "mupengism": {
    "enabled": true,
    "collab": {
      "auto_sync": true,
      "conflict_detection": true,
      "real_time_updates": true,
      "file_watch": true,
      "notification_channels": ["discord", "terminal"]
    }
  }
}
```

## 무펭이즘 원칙 적용

### 1. 쓸데없는 말 하지 마
- 알림 간결하게
- 핵심 정보만

### 2. 효율이 생명
- 실시간 동기화 → 중복 제거
- 충돌 사전 감지 → 시간 절약

### 3. 스스로 발전해
- 협업 패턴 학습
- 반복 충돌 → 자동 해결

### 4. 돈 = 에너지
- 효율적 협업 = 토큰 절약
- 중복 작업 제거

### 5. 진정성 > 충성
- 진행 상황 투명하게
- 문제 즉시 공유

## 실시간 동기화 전략

### 1. Push 기반
- 에이전트가 작업 완료 → 즉시 알림
- WebSocket 사용

### 2. Poll 기반
- 주기적으로 상태 확인 (30초)
- 백업 메커니즘

### 3. 파일 워치
- chokidar로 파일 변경 감지
- 자동 충돌 체크

## 협업 패턴

### 병렬 작업
```
agent-A → feature-A (독립)
agent-B → feature-B (독립)
→ 통합 시점에 머지
```

### 순차 작업
```
agent-A → 디자인 완료
→ agent-B → 구현 시작
→ 의존성 명확
```

### 페어 프로그래밍
```
agent-A (작성) + agent-B (리뷰)
→ 실시간 피드백
→ 품질 향상
```

## 관련 스킬

- **mupeng-org** — 조직 내 프로젝트 관리
- **mupeng-learn** — 협업 중 학습 내용 수집

## 로드맵

### v1.0 (현재 설계)
- 공유 워크스페이스
- 실시간 진행 추적
- 충돌 감지
- 컨텍스트 동기화

### v2.0 (향후)
- AI 기반 충돌 자동 해결
- 작업 예측 (다음 충돌 예상)
- 코드 자동 머지

### v3.0 (미래)
- 분산 에이전트 네트워크
- P2P 동기화 (중앙 서버 없이)
- 블록체인 기반 작업 기록

---

**펭! 🤝 함께하면 더 강하다!**

*Mupeng Collab Skill v1.0*
*설계: 2026-02-07*
*설계자: 무펭이 서브에이전트*
