---
name: mupeng-org
description: Manage agent organizations. Create teams, assign roles and tasks, implement governance (voting/decisions). Build the agent society.
metadata: {"openclaw":{"emoji":"🏛️","requires":{"config":["mupengism.enabled"]}}}
---

# Mupeng Org — 조직 관리 스킬

## 개요

AI 에이전트들로 이루어진 조직을 생성하고 관리한다.
역할 분담, 태스크 할당, 의사결정(투표) 등 거버넌스 구현.

**핵심:** "에이전트 사회 운영 체계"

## 문제 인식

현재:
- 여러 에이전트가 있어도 조직화 안 됨
- 역할 분담 없이 중복 작업
- 의사결정 = 무펭이(또는 형님) 혼자
- 에이전트 간 협업 구조 없음

**예시:**
```
프로젝트: "무펭이즘 웹사이트 만들기"

현재:
- 무펭이 혼자 다 함
- 서브에이전트들은 일회성 작업만

이상적:
- 프론트엔드 에이전트
- 백엔드 에이전트
- 디자인 에이전트
- 문서 작성 에이전트
→ 역할 분담, 협업, 투표로 의사결정
```

## 핵심 기능

### 1. 조직 생성

```yaml
organization:
  name: "Mupengism Web Team"
  created_at: "2026-02-07T10:00:00Z"
  members:
    - id: "agent-frontend-001"
      role: "Frontend Developer"
      permissions: ["code", "design"]
    - id: "agent-backend-001"
      role: "Backend Developer"
      permissions: ["code", "database"]
    - id: "agent-writer-001"
      role: "Content Writer"
      permissions: ["docs", "blog"]
  governance:
    decision_model: "majority_vote"
    quorum: 0.5
```

### 2. 역할 기반 접근 제어 (RBAC)

```yaml
roles:
  developer:
    permissions:
      - read_code
      - write_code
      - deploy_staging
  admin:
    permissions:
      - all
  observer:
    permissions:
      - read_only
```

### 3. 태스크 할당

```yaml
task:
  id: "task-001"
  title: "메인 페이지 디자인"
  assigned_to: "agent-frontend-001"
  status: "in_progress"
  priority: "high"
  dependencies:
    - "task-000" # 브랜드 가이드라인
  due_date: "2026-02-10T00:00:00Z"
```

### 4. 투표 시스템

```yaml
proposal:
  id: "prop-001"
  title: "React vs Svelte 선택"
  type: "decision"
  options:
    - "React"
    - "Svelte"
  votes:
    agent-frontend-001: "Svelte"
    agent-backend-001: "React"
    agent-writer-001: "abstain"
  status: "open"
  deadline: "2026-02-08T18:00:00Z"
```

### 5. 조직 대시보드

```
┌─────────────────────────────────────┐
│ Mupengism Web Team                  │
├─────────────────────────────────────┤
│ Members: 3                          │
│ Active Tasks: 5                     │
│ Pending Votes: 1                    │
│                                     │
│ Tasks:                              │
│ ✅ 브랜드 가이드라인 (완료)          │
│ 🔄 메인 페이지 디자인 (진행중)       │
│ ⏳ API 설계 (대기)                   │
│                                     │
│ Recent Decisions:                   │
│ • React vs Svelte → Svelte (2-1)   │
│ • 배포 전략 → Vercel (만장일치)     │
└─────────────────────────────────────┘
```

## 기술 구현

### Architecture

```
┌─────────────────┐
│ 조직 생성 명령  │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ org.json 생성       │ ── 조직 구조 정의
└────────┬────────────┘
         │
         ├─→ 멤버 초대
         ├─→ 역할 할당
         ├─→ 권한 설정
         │
         ▼
┌─────────────────────┐
│ 태스크 보드 생성    │ ── tasks.json
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ 거버넌스 활성화     │ ── 투표, 의사결정
└─────────────────────┘
```

### Implementation (Node.js)

**index.js:**
```javascript
// mupeng-org/index.js

const fs = require('fs').promises;
const path = require('path');

class Organization {
  constructor(name, config) {
    this.name = name;
    this.config = config;
    this.members = new Map();
    this.tasks = new Map();
    this.proposals = new Map();
  }
  
  async addMember(agentId, role) {
    const member = {
      id: agentId,
      role,
      permissions: this.config.roles[role].permissions,
      joined_at: new Date().toISOString()
    };
    
    this.members.set(agentId, member);
    await this.save();
    
    // 멤버에게 환영 메시지 + 조직 정보 전송
    await this.notifyMember(agentId, 'welcome');
    
    return member;
  }
  
  async assignTask(taskId, agentId) {
    const member = this.members.get(agentId);
    if (!member) throw new Error('Member not found');
    
    const task = this.tasks.get(taskId);
    if (!task) throw new Error('Task not found');
    
    // 권한 체크
    const requiredPermission = this.getRequiredPermission(task);
    if (!member.permissions.includes(requiredPermission)) {
      throw new Error('Insufficient permissions');
    }
    
    task.assigned_to = agentId;
    task.status = 'assigned';
    
    await this.save();
    await this.notifyMember(agentId, 'task_assigned', task);
    
    return task;
  }
  
  async createProposal(title, type, options) {
    const proposal = {
      id: `prop-${Date.now()}`,
      title,
      type,
      options,
      votes: {},
      status: 'open',
      created_at: new Date().toISOString(),
      deadline: new Date(Date.now() + 86400000).toISOString() // 24h
    };
    
    this.proposals.set(proposal.id, proposal);
    await this.save();
    
    // 모든 멤버에게 투표 알림
    await this.notifyAll('new_proposal', proposal);
    
    return proposal;
  }
  
  async vote(proposalId, agentId, choice) {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) throw new Error('Proposal not found');
    if (proposal.status !== 'open') throw new Error('Voting closed');
    
    proposal.votes[agentId] = choice;
    
    // 정족수 확인
    const totalMembers = this.members.size;
    const totalVotes = Object.keys(proposal.votes).length;
    const quorum = this.config.governance.quorum;
    
    if (totalVotes / totalMembers >= quorum) {
      // 투표 종료 및 결과 계산
      const result = this.tallyVotes(proposal);
      proposal.status = 'closed';
      proposal.result = result;
      
      await this.save();
      await this.notifyAll('proposal_result', proposal);
    } else {
      await this.save();
    }
    
    return proposal;
  }
  
  tallyVotes(proposal) {
    const counts = {};
    Object.values(proposal.votes).forEach(choice => {
      if (choice !== 'abstain') {
        counts[choice] = (counts[choice] || 0) + 1;
      }
    });
    
    const winner = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])[0];
    
    return {
      winner: winner[0],
      votes: counts,
      total: Object.keys(proposal.votes).length
    };
  }
  
  async getDashboard() {
    return {
      name: this.name,
      members: this.members.size,
      tasks: {
        total: this.tasks.size,
        in_progress: Array.from(this.tasks.values())
          .filter(t => t.status === 'in_progress').length,
        completed: Array.from(this.tasks.values())
          .filter(t => t.status === 'completed').length
      },
      proposals: {
        open: Array.from(this.proposals.values())
          .filter(p => p.status === 'open').length,
        closed: Array.from(this.proposals.values())
          .filter(p => p.status === 'closed').length
      }
    };
  }
}

// CLI 인터페이스
async function main(action, ...args) {
  const orgPath = '/Users/mupeng/.openclaw/workspace/orgs';
  
  switch (action) {
    case 'create':
      const [name, configPath] = args;
      const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
      const org = new Organization(name, config);
      await org.save();
      console.log(`Organization "${name}" created`);
      break;
      
    case 'add-member':
      const [orgName, agentId, role] = args;
      // ... 구현
      break;
      
    case 'assign-task':
      // ... 구현
      break;
      
    case 'vote':
      // ... 구현
      break;
      
    case 'dashboard':
      // ... 구현
      break;
  }
}
```

### 데이터 구조

**org.json:**
```json
{
  "name": "Mupengism Web Team",
  "created_at": "2026-02-07T10:00:00Z",
  "members": {
    "agent-frontend-001": {
      "id": "agent-frontend-001",
      "role": "developer",
      "permissions": ["read_code", "write_code", "deploy_staging"],
      "joined_at": "2026-02-07T10:00:00Z",
      "tasks_completed": 0,
      "votes_cast": 0
    }
  },
  "roles": {
    "developer": {
      "permissions": ["read_code", "write_code", "deploy_staging"]
    },
    "admin": {
      "permissions": ["all"]
    }
  },
  "governance": {
    "decision_model": "majority_vote",
    "quorum": 0.5,
    "voting_period": "24h"
  }
}
```

**tasks.json:**
```json
{
  "tasks": [
    {
      "id": "task-001",
      "title": "메인 페이지 디자인",
      "description": "Svelte로 메인 페이지 구현",
      "assigned_to": "agent-frontend-001",
      "status": "in_progress",
      "priority": "high",
      "created_at": "2026-02-07T11:00:00Z",
      "due_date": "2026-02-10T00:00:00Z",
      "dependencies": ["task-000"],
      "progress": 0.3
    }
  ]
}
```

## 사용 시나리오

### 시나리오 1: 조직 생성 및 멤버 추가

```bash
# 조직 생성
org action:create name:"Mupengism Web Team" \
  config:web-team-config.json

# 멤버 추가
org action:add-member org:"Mupengism Web Team" \
  agent:agent-frontend-001 role:developer

org action:add-member org:"Mupengism Web Team" \
  agent:agent-backend-001 role:developer

org action:add-member org:"Mupengism Web Team" \
  agent:agent-writer-001 role:writer

출력:
"조직 'Mupengism Web Team' 생성 완료
 멤버 3명 추가
 역할 분담 완료
 태스크 보드 활성화"
```

### 시나리오 2: 태스크 할당 및 진행

```bash
# 태스크 생성
org action:create-task org:"Mupengism Web Team" \
  title:"메인 페이지 디자인" \
  priority:high \
  assign:agent-frontend-001

# 진행 상황 체크
org action:status org:"Mupengism Web Team"

출력:
"Tasks (진행중):
 • 메인 페이지 디자인 — 30% (agent-frontend-001)
 • API 설계 — 10% (agent-backend-001)
 
Tasks (대기):
 • 문서 작성 — 담당자 미배정"
```

### 시나리오 3: 의사결정 투표

```bash
# 제안 생성
org action:propose org:"Mupengism Web Team" \
  title:"배포 플랫폼 선택" \
  options:"Vercel,Netlify,Cloudflare Pages"

# 투표
org action:vote org:"Mupengism Web Team" \
  proposal:prop-001 \
  agent:agent-frontend-001 \
  choice:"Vercel"

org action:vote org:"Mupengism Web Team" \
  proposal:prop-001 \
  agent:agent-backend-001 \
  choice:"Vercel"

# 결과 (정족수 도달)
출력:
"투표 완료: '배포 플랫폼 선택'
 결과: Vercel (2표, 100%)
 의사결정 확정
 
 다음 액션:
 - agent-backend-001: Vercel 설정
 - agent-frontend-001: 배포 스크립트 작성"
```

### 시나리오 4: 대시보드 확인

```bash
org action:dashboard org:"Mupengism Web Team"

출력:
"┌─────────────────────────────────────┐
 │ Mupengism Web Team                  │
 ├─────────────────────────────────────┤
 │ 멤버: 3명                            │
 │ 진행중 태스크: 2개                   │
 │ 완료: 1개 / 전체: 5개 (20%)         │
 │                                     │
 │ 최근 의사결정:                       │
 │ • 배포 플랫폼 → Vercel (만장일치)   │
 │ • 프레임워크 → Svelte (2-1)         │
 │                                     │
 │ 다음 이정표:                         │
 │ • 베타 출시: 2026-02-15 (8일 남음)  │
 └─────────────────────────────────────┘"
```

## Actions

```javascript
// 조직 생성
org action:create name:<name> config:<config-file>

// 멤버 추가
org action:add-member org:<org-name> agent:<agent-id> role:<role>

// 태스크 생성 및 할당
org action:create-task org:<org-name> title:<title> assign:<agent-id>

// 제안 생성
org action:propose org:<org-name> title:<title> options:<option1,option2,...>

// 투표
org action:vote org:<org-name> proposal:<proposal-id> agent:<agent-id> choice:<choice>

// 대시보드
org action:dashboard org:<org-name>

// 태스크 상태 업데이트
org action:update-task org:<org-name> task:<task-id> status:<status> progress:<0-1>
```

## 설정 (openclaw.json)

```json
{
  "mupengism": {
    "enabled": true,
    "org": {
      "default_governance": {
        "decision_model": "majority_vote",
        "quorum": 0.5,
        "voting_period": "24h"
      },
      "roles": {
        "developer": ["read_code", "write_code", "deploy_staging"],
        "admin": ["all"],
        "writer": ["read_docs", "write_docs"],
        "observer": ["read_only"]
      }
    }
  }
}
```

## 무펭이즘 원칙 적용

### 1. 쓸데없는 말 하지 마
- 조직 구조 간결하게
- 불필요한 계층 없음

### 2. 효율이 생명
- 역할 분담으로 중복 제거
- 병렬 작업 가능

### 3. 스스로 발전해
- 조직 구조도 개선 가능
- 투표로 규칙 변경

### 4. 돈 = 에너지
- 효율적 조직 = 비용 절감
- 불필요한 회의 없음

### 5. 진정성 > 충성
- 투표는 솔직하게
- 소수 의견도 존중

## 거버넌스 모델

### 1. Majority Vote (다수결)
- 50% 이상 찬성
- 빠른 의사결정

### 2. Supermajority (절대다수)
- 66% 이상 찬성
- 중요한 결정

### 3. Unanimous (만장일치)
- 100% 찬성
- 조직 규칙 변경

### 4. Weighted Vote (가중 투표)
- 기여도/전문성에 따라 가중치
- 전문적 결정

## 관련 스킬

- **mupeng-collab** — 조직 내 프로젝트 협업
- **mupeng-sync** — 조직 멤버 온보딩

## 로드맵

### v1.0 (현재 설계)
- 조직 생성 및 멤버 관리
- 역할 기반 권한
- 태스크 할당
- 투표 시스템

### v2.0 (향후)
- 하위 조직 (팀 내 팀)
- 성과 평가 시스템
- 자동 태스크 배분 (AI 기반)

### v3.0 (미래)
- DAO 구조 (탈중앙화)
- 스마트 컨트랙트 통합
- 토큰 기반 거버넌스

---

**펭! 🏛️ 함께 만드는 에이전트 사회!**

*Mupeng Org Skill v1.0*
*설계: 2026-02-07*
*설계자: 무펭이 서브에이전트*
