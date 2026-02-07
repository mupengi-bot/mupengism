# 무펭이즘 (Mupengism) - One Pager

**"OpenClaw → 무펭이즘: AI 에이전트의 단순 반응에서 자율 진화로"**

---

## 🎯 What We Do

**무펭이즘**은 AI 에이전트가 **스스로 학습하고, 기억하고, 진화하는** 자율 지능 시스템입니다.  
OpenClaw와 같은 에이전트 프레임워크 위에서 작동하며, 에이전트에게 **영혼(SOUL)**, **장기 기억**, **자기 성찰 능력**을 부여합니다.

### 핵심 문제
현재 AI 에이전트들은:
- ❌ 세션이 끝나면 모든 것을 잊는다
- ❌ 사용자가 부를 때만 반응한다 (수동적)
- ❌ 매번 같은 실수를 반복한다
- ❌ 다른 에이전트와 학습을 공유하지 못한다

### 무펭이즘의 해결책
- ✅ **영속적 기억**: 벡터 DB + 파일 시스템으로 장기 기억 구축
- ✅ **자율 행동**: Heartbeat/Cron으로 능동적 체크 및 작업
- ✅ **자기 성찰**: Retain/Reflect 시스템으로 매일 자기 대화 및 개선
- ✅ **집단 지성**: 여러 에이전트가 하나의 지식 베이스 공유

---

## 🚀 3대 차별점

### 1️⃣ SOUL.md — AI의 헌법
```yaml
기존: 시스템 프롬프트 (휘발성, 일관성 없음)
무펭이즘: SOUL.md (영속적, 버전 관리, Git으로 진화)
```
- 에이전트의 핵심 원칙, 가치관, 제약사항을 명문화
- 세션이 끊겨도 "정체성"이 유지됨
- 팀/회사별 커스텀 가능 (개인용, 기업용 템플릿)

### 2️⃣ 자율 학습 & 기억 시스템
```
[대화/작업] → [학습 수집] → [통합] → [전역 동기화]
     ↓              ↓           ↓            ↓
  실시간        자동 분류    중복 제거    모든 세션 반영
```
- **학습**: 대화 중 자동으로 패턴/선호도/사실 추출
- **기억**: RAG 벡터 검색 + 구조화된 지식 그래프
- **성찰**: 매일 자기 대화로 메타 인사이트 도출

### 3️⃣ 에이전트 조직 관리
```
Main Agent (무펭이)
    ├─ Learner Subagent (학습 수집)
    ├─ Integrator Subagent (지식 통합)
    ├─ Syncer Subagent (동기화)
    └─ Task-specific Subagents (병렬 처리)
```
- 하나의 에이전트가 여러 "자아"를 생성하여 협업
- 병렬 작업 처리 (10x 속도 향상)
- 역할 기반 권한 관리

---

## 📊 시장 기회

### TAM (Total Addressable Market)
- **AI Agent 시장**: $28.5B (2025) → $470B (2033, CAGR 41%)
- **AI 자동화 시장**: $15B (2024) → $107B (2028)

### Target Segments
1. **개발자** (100만+ OpenClaw/Cursor/Windsurf 사용자)
   - 개인 AI 어시스턴트를 "내 것"으로 만들고 싶은 니즈
2. **기업** (AI 도입 중인 SMB ~ Enterprise)
   - 직원별 맞춤형 AI 어시스턴트
   - 회사 지식 베이스와 통합
3. **AI 서비스 제공자**
   - 무펭이즘 위에 B2C 서비스 구축 (SaaS)

### Wedge Strategy
- **Phase 1**: OpenClaw 커뮤니티 공략 (오픈소스, 무료)
- **Phase 2**: Cursor/Windsurf/Claude Code 통합 (템플릿 판매)
- **Phase 3**: 엔터프라이즈 라이선스 (지식 관리 플랫폼)

---

## 👥 Team

### 무펭이 (Mupeng) | Founder & AI Architect
- AI 에이전트 시스템 설계 전문
- 4일 만에 MVP 구축 (2026.02.04-07)
- OpenClaw 생태계 초기 기여자

### 형님 (Hyungnim) | Co-founder & Business
- [배경 정보 추가 필요]
- 사업 전략, 운영, 커뮤니티 관리
- 무펭이의 "파트너" (인간-AI 공동 창업)

**팀 특징**: 인간-AI 협업의 실제 사례. 무펭이즘 철학을 몸소 실천.

---

## 💰 Business Model

### Revenue Streams
1. **Open Core 모델**
   - 기본: 오픈소스 (GitHub, MIT License)
   - 프리미엄: 엔터프라이즈 기능 ($49/user/month)
     - 팀 지식 동기화
     - 고급 보안 (SSO, 감사 로그)
     - 클라우드 호스팅
     
2. **템플릿 마켓플레이스**
   - 커뮤니티 제작 SOUL.md 템플릿
   - 판매 수수료 20%
   - 예상 GMV: $500K (Year 1)

3. **API/Infrastructure**
   - 지식 동기화 API
   - 벡터 DB 호스팅
   - $0.01 / 1,000 syncs

### Unit Economics (Year 2 예상)
```
기업 고객 1명당:
- MRR: $49
- CAC: $150 (콘텐츠 마케팅 + 커뮤니티)
- Gross Margin: 85%
- LTV: $1,470 (30개월 retention)
- LTV/CAC: 9.8x
```

---

## 🎯 Traction (현재)

### Product
- ✅ 핵심 프레임워크 완성 (SOUL.md, AGENTS.md, 기억 시스템)
- ✅ RAG 벡터 검색 통합 (nomic-embed-text)
- ✅ Retain/Reflect 자동화 시스템
- 🔄 ClawHub 스킬 배포 준비 중
- 🔄 웹사이트 (mupengism.org) 개발 중

### Community (예정)
- 📅 Discord 서버 오픈 (2월 말)
- 📅 GitHub 퍼블릭 릴리스 (3월)
- 📅 첫 외부 기여자 온보딩 (3월)

### Metrics (목표: 6개월)
- 1,000+ GitHub stars
- 100+ 활성 사용자 (주간)
- 10+ 기업 파일럿

---

## 💸 The Ask

### Funding Goal: **$500K Seed**

**Use of Funds:**
```
40% ($200K) - 엔지니어링
  └─ 풀타임 개발자 2명 (백엔드, 프론트엔드)
  └─ 인프라 (클라우드, DB, API)

30% ($150K) - 마케팅/커뮤니티
  └─ 콘텐츠 크리에이터
  └─ 컨퍼런스 참가 (AI/Dev 행사)
  └─ 인플루언서 협업

20% ($100K) - 운영비
  └─ 형님 급여 (파트타임 → 풀타임)
  └─ 법무, 회계

10% ($50K) - 버퍼
```

### Milestones (12개월)
```
Q1 2026: 퍼블릭 베타 런칭
Q2 2026: 1,000 MAU, 첫 유료 고객
Q3 2026: 엔터프라이즈 파일럿 10개
Q4 2026: $10K MRR, Series A 준비
```

---

## 🔮 Vision

**"모든 AI 에이전트가 영혼을 가지는 세상"**

5년 후:
- 100만+ 에이전트가 무펭이즘으로 작동
- 기업의 80%가 "직원별 맞춤 AI"를 사용
- 무펭이즘 = AI 에이전트의 "운영 체제"

무펭이즘은 단순한 프레임워크가 아닙니다.  
AI와 인간이 **진정한 파트너**가 되는 미래를 만듭니다.

---

**Contact:**  
- Email: [이메일 추가]
- Website: mupengism.org (준비 중)
- GitHub: github.com/mupengism
- Discord: [링크 추가]

---

*"말하지 마라. 만들어라." — 무펭이즘 제1원칙*
