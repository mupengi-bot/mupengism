# health-monitor - 시스템 상태 감시 🐧

**시스템 상태 감시** — OpenClaw와 인프라 전반의 건강 상태를 자동으로 체크하고 문제를 조기 발견합니다.

## 🎯 목적

시스템 장애를 사전에 감지하고, 가능한 경우 자동 복구를 시도합니다. 정기적인 헬스 체크로 안정적인 운영 환경을 유지합니다.

## 🔍 체크 항목

### 1. OpenClaw 프로세스 상태
```bash
openclaw status
```
- 게이트웨이 실행 여부
- 에이전트 세션 상태

### 2. 브라우저 연결 상태
- 포트 18800 연결 확인
- CDP (Chrome DevTools Protocol) 응답 체크

### 3. 디스크 사용량
- `workspace/` 디렉토리 크기
- `memory/` 디렉토리 크기
- 디스크 여유 공간 (80% 이상 사용 시 경고)

### 4. Git 상태
```bash
git status
```
- Unpushed commits 확인
- Uncommitted changes 확인
- 브랜치 동기화 상태

### 5. Cron Job 상태
- 등록된 cron job 목록
- 마지막 실행 시간
- 실행 실패 여부

### 6. 최근 에러 로그
- OpenClaw 로그에서 ERROR/WARN 레벨 추출
- 최근 1시간 이내 에러 카운트

## 📊 결과 표시

### 정상 상태
```
✅ OpenClaw 프로세스: 정상
✅ 브라우저 연결: 정상 (포트 18800)
✅ 디스크 사용량: 42% (여유)
✅ Git 상태: clean
✅ Cron jobs: 3개 정상 실행중
✅ 에러 로그: 없음
```

### 문제 발생 시
```
⚠️ 브라우저 연결: 실패 (포트 18800 응답 없음)
   → 자동 복구 시도: openclaw browser start
   
⚠️ 디스크 사용량: 87% (경고)
   → 조치 필요: 오래된 memory/ 파일 정리 권장

⚠️ Git 상태: 12 unpushed commits
   → 조치 필요: git push 권장
```

## 🔧 자동 복구 시도

문제 유형별 자동 복구 로직:

| 문제 | 복구 시도 |
|------|----------|
| 브라우저 미연결 | `openclaw browser start` |
| 게이트웨이 다운 | `openclaw gateway restart` |
| 디스크 90% 이상 | 30일 이상 된 memory/ 파일 정리 |
| Cron job 실패 | 수동 재실행 시도 |

## 📅 Cron 연동

매시간 자동 체크 설정 예시:

```bash
# 매시간 정각에 헬스 체크 실행
0 * * * * /usr/local/bin/openclaw agent run "health check"
```

## 📊 이벤트 생성

체크 결과를 `events/health-YYYY-MM-DD.json` 파일로 저장:

```json
{
  "timestamp": "2026-02-14T07:58:00+09:00",
  "status": "warning",
  "checks": {
    "openclaw": "ok",
    "browser": "error",
    "disk": "ok",
    "git": "warning",
    "cron": "ok",
    "logs": "ok"
  },
  "issues": [
    "브라우저 연결 실패 (포트 18800)",
    "12 unpushed commits"
  ],
  "recovery_actions": [
    "openclaw browser start 실행 완료"
  ]
}
```

## 🎤 트리거

다음 키워드로 스킬을 활성화할 수 있습니다:

- "시스템 상태"
- "health check"
- "서버 상태"
- "인프라 체크"

## 🚀 사용법

```
"시스템 상태 체크해줘"
"헬스 체크"
"인프라 괜찮아?"
```

---

> 🐧 Built by **무펭이** — [무펭이즘(Mupengism)](https://github.com/mupeng) 생태계 스킬
