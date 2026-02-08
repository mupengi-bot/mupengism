# 🪓 Prune 실행계획 — Cron & Workspace 정리

> 작성: Prune 집행관 | 2026-02-07 21:00 KST
> 근거: february-战略.md Kill 리스트

---

## 1. 현재 Cron 전체 목록 (16개)

| # | ID (앞8자) | 이름 | 주기 | Target | 판정 |
|---|-----------|------|------|--------|------|
| 1 | 5801c7c1 | 무펭이 모닝 브리핑 | 매일 08시 | isolated | ✅ 유지 |
| 2 | ccdd829d | 인스타 DM 체크 | 30분마다 | main | ⚠️ 최적화 |
| 3 | 352baa1a | 소셜 알림 - 아침 | 매일 09시 | isolated | ✅ 유지 |
| 4 | 7a439de2 | 소셜 알림 - 오후 | 매일 15시 | isolated | ✅ 유지 |
| 5 | d6544992 | 소셜 알림 - 저녁 | 매일 21시 | isolated | ✅ 유지 |
| 6 | ef0fe9c4 | Retain 대화요약 | 매일 03시 | isolated | ✅ 유지 |
| 7 | d54e52e6 | Reflect 기억연결 | 매일 04시 | isolated | ✅ 유지 |
| 8 | d08fb3c7 | 호기심 질문 (오전) | 매일 11:17 | main | ✅ 유지 |
| 9 | 69f6438e | 무펭이 자기성찰 | 1시간마다 | isolated | ❌ KILL |
| 10 | df7a69f9 | 자율 사고 (1시간) | 1시간마다 | main | ⚠️ 최적화 |
| 11 | 50e32187 | 호기심 질문 (저녁) | 매일 20:43 | main | ❌ KILL |
| 12 | 94981e91 | threads-daily-diary | 매일 22시 | main | ❌ KILL |
| 13 | b1e561ea | 자기 대화 (한계 탐구) | 월수금 14시 | isolated | ❌ KILL |
| 14 | 6563e9eb | Kill Cron 리뷰 | 일요일 10시 | isolated | ❌ KILL (prune 후 불필요) |
| 15 | ce191a57 | 새벽 자율사고 종료 | 2/6 06시 (일회성) | main | ❌ KILL (이미 지남) |
| 16 | e653ae58 | wallet-deposit-monitor | 15분마다 | isolated | ❌ KILL (트레이딩봇 판단 전까지 중단) |

---

## 2. Kill 대상 (8개) — 이유 및 토큰 비용

| Cron | 예상 일일 호출 | 예상 토큰/일 | Kill 이유 |
|------|--------------|------------|-----------|
| 무펭이 자기성찰 | 24회 | ~12K | 1시간마다는 과도. 자기성찰 ≠ 생산성 |
| 호기심 질문 (저녁) | 1회 | ~1K | 오전 1회로 충분, 중복 |
| threads-daily-diary | 1회 | ~2K | 관련성 낮음, Threads 활동 미미 |
| 자기 대화 (한계 탐구) | 0.43회 | ~2K | 철학적 자기기만. 행동 > 성찰 |
| Kill Cron 리뷰 | 0.14회 | ~0.5K | prune 완료 후 존재 이유 없음 |
| 새벽 자율사고 종료 | 0회 | 0 | 2/6 일회성, 이미 만료 |
| wallet-deposit-monitor | 96회 | ~10K | 15분마다 = 비용 최다. 트레이딩 판단 전 중단 |
| **자율 사고 (변경)** | 24→12회 | ~6K 절약 | Kill 아닌 최적화 (아래 참고) |

**예상 절약: ~33K+ 토큰/일 (약 40~50% 감소)**

---

## 3. 유지 Cron 최적화 (8개 → 최종)

| Cron | 현재 | 변경 | 효과 |
|------|------|------|------|
| 인스타 DM 체크 | 30분 | **1시간** | 호출 50% 감소 |
| 자율 사고 | 1시간 | **2시간** | 호출 50% 감소, 깊이 증가 |
| 나머지 6개 | - | 변경 없음 | - |

### 최종 유지 목록 (8개)
1. 모닝 브리핑 (08시)
2. 인스타 DM 체크 (1시간) ← 변경
3. 소셜 알림 - 아침 (09시)
4. 소셜 알림 - 오후 (15시)
5. 소셜 알림 - 저녁 (21시)
6. Retain 대화요약 (03시)
7. Reflect 기억연결 (04시)
8. 호기심 질문 오전 (11:17)
9. 자율 사고 (2시간) ← 변경

---

## 4. Workspace 정리 대상

### 📦 Archive로 이동 (→ workspace/archive/)

| 파일/폴더 | 이유 |
|-----------|------|
| `assoai-code-review.md` | 리뷰 완료 |
| `assoai-improvement-tasks.md` | 태스크 정리용, 프로젝트 폴더로 이동 가능 |
| `browser-port-solution.md` | 해결됨 |
| `conversation-history-2026-02-04.md` | 오래된 대화 기록 |
| `github-login-context.txt` | 해결됨 |
| `market-analysis-log.md` | 오래된 분석 |
| `marketplace-analysis.md` | 오래된 분석 |
| `speculation/` | 폴더 전체 |
| `work-log-2026-02-03.md` | 오래된 로그 |
| `work-log-2026-02-04.md` | 오래된 로그 |
| `work-log-2026-02-04-part2.md` | 오래된 로그 |
| `ux-patterns-analysis.md` | 참고 완료 |
| `security-warning-clawhub.md` | 해결됨 |
| `mupeng-and-hyungnim.png` | v2 있으니 v1 아카이브 |

### ⚠️ 검토 필요

| 파일/폴더 | 참고 |
|-----------|------|
| `mupeng-token/` | 토큰 프로젝트 상태에 따라 |
| `blog/` | 당장 불필요하나 형님 판단 필요 |
| `node_modules/` + `package.json` | 무엇을 위한 건지 확인 필요 |
| `data/` | 내용 확인 필요 |
| `reports/` | 비어있으면 삭제 |
| `output/` | 임시 출력물이면 아카이브 |

### ✅ 유지 (건드리지 않음)

- SOUL.md, SELF.md, USER.md, RELATIONS.md, MEMORY.md
- AGENTS.md, TOOLS.md, HEARTBEAT.md, IDENTITY.md
- memory/ (최근 7일)
- projects/ (진행중)
- tools/ (인스타 CLI 등)
- skills/
- research/

---

## 5. 실행 순서

### Phase 1: Cron Kill (즉시 실행 가능)
```
# Kill 대상 8개 ID
69f6438e  # 자기성찰
50e32187  # 호기심 저녁
94981e91  # threads-daily-diary
b1e561ea  # 자기 대화 한계탐구
6563e9eb  # Kill Cron 리뷰
ce191a57  # 새벽 자율사고 종료
e653ae58  # wallet-deposit-monitor
```

### Phase 2: Cron 최적화 (주기 변경)
```
ccdd829d  # 인스타 DM: 30분 → 1시간
df7a69f9  # 자율 사고: 1시간 → 2시간
```

### Phase 3: Workspace Archive
```bash
mkdir -p archive/memory
# 위 archive 대상 파일들을 mv로 이동
```

---

## 6. 결과 예상

| 지표 | Before | After |
|------|--------|-------|
| Cron 수 | 16 | 9 |
| 일일 cron 호출 | ~170회 | ~50회 |
| 일일 토큰 | ~70K+ | ~35K |
| Workspace 루트 파일 | ~25개 | ~12개 |

---

> ⚠️ **주의**: 이 문서는 실행 "계획"임. 실제 cron 삭제/변경은 형님 승인 후 진행.
> 삭제 대신 archive. `trash` > `rm`.
