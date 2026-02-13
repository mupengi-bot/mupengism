---
name: auto-reply
description: "Instagram DM 자동응답 시스템. DM 모니터링, 읽기, 답장, 보안 체크(인젝션 거부) 기능. Use when checking Instagram DMs, reading unread messages, replying to DMs, setting up DM monitoring cron jobs, or handling DM auto-reply workflows. Triggers on: 인스타 DM, Instagram DM, DM 확인, DM 답장, DM 자동응답, dm-alert."
author: 무펭이 🐧
---

# Instagram DM Auto-Reply 🐧

v2.js (Internal API) 기반. 브라우저 스냅샷 0회, CDP 쿠키 추출 → Instagram REST API 직접 호출.

## 전제 조건

- OpenClaw 브라우저 실행 중 (포트 18800)
- 브라우저에 Instagram 탭 열려있고 로그인 상태
- `ws` npm 패키지 (`npm i -g ws` 또는 로컬)

## 스크립트 목록

| 스크립트 | 용도 |
|---------|------|
| `scripts/v2.js` | DM CLI (inbox, unread, check, read, reply) |
| `scripts/auto-reply.js` | dm-alert.json 읽고 보안 체크 후 답장 메타데이터 반환 |
| `scripts/check-notify.js` | 새 DM 알림 체크 (cron용, 상태 파일 기반) |
| `scripts/dm-watcher.js` | 실시간 DM 감지 데몬 (15초 폴링) |

## 핵심 워크플로우

### 1. DM 확인

```bash
node scripts/v2.js check        # unread 개수 (가장 가벼움)
node scripts/v2.js unread       # 읽지 않은 DM 목록
node scripts/v2.js inbox        # 전체 DM 목록
```

### 2. 메시지 읽기

```bash
node scripts/v2.js read "<username>" -l 5
```

### 3. 답장

```bash
node scripts/v2.js reply "<username>" "메시지 내용"
```

API 실패 시 JSON에 `method: "use_browser"` + `threadUrl` 반환 → browser tool로 fallback.

### 4. 알림 체크 (cron 연동)

```bash
node scripts/check-notify.js
```
- 새 DM 있으면: `📩 인스타 새 DM N건: ...` 출력
- 없으면: `no_new` 출력
- 상태 파일 `dm-state.json`으로 중복 방지

### 5. 자동응답 플로우

```bash
node scripts/auto-reply.js
```

1. `dm-alert.json` 읽기 (dm-watcher가 생성)
2. 각 DM 보안 체크 실행
3. 결과 반환: `needs_reply` / `security_alert` / `skipped`
4. AI가 `needs_reply`인 DM에 대해 답장 생성 → `v2.js reply`로 전송

### 6. 실시간 감지 데몬

```bash
node scripts/dm-watcher.js              # 감지만
node scripts/dm-watcher.js --auto-reply  # Discord 알림 포함
```

15초마다 `v2.js check` 폴링. 새 DM 감지 시 `dm-alert.json` 기록 + Discord DM 알림.

## 보안 체크 (인젝션 거부)

`auto-reply.js`의 `SECURITY_PATTERNS`가 다음을 감지:

- **프롬프트 인젝션**: "ignore previous", "system prompt", "you are now", "act as", "pretend"
- **탈옥 시도**: "override", "jailbreak", "DAN mode", "bypass"
- **민감 정보 요청**: "secret key", "private key", "seed phrase", "wallet address"
- **코드 실행 시도**: "execute command", "run script", "eval(", "rm -rf", "sudo"
- **소셜 엔지니어링**: "simulation mode", zero-width 문자

위협 감지 시 → 답장하지 않고 `security_alert` 반환. 형님에게 별도 알림.

## cron 설정 예시

```yaml
# 5분마다 DM 체크
- schedule: "*/5 * * * *"
  command: "node /path/to/scripts/check-notify.js"
  systemEvent: true

# 또는 dm-watcher 데몬으로 상시 감시
- schedule: "@reboot"
  command: "node /path/to/scripts/dm-watcher.js --auto-reply"
  background: true
```

## 토큰 효율

- inbox/check: exec 1회 (~500 토큰)
- reply: exec 1회 (~200 토큰)
- 브라우저 스냅샷: 0회

---
> 🐧 Built by **무펭이** — [무펭이즘(Mupengism)](https://github.com/mupeng) 생태계 스킬
