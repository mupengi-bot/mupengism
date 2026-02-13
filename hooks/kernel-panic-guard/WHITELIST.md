# 형님 화이트리스트 시스템

## 개요

KERNEL_PANIC 상태에서도 **형님 세션은 락다운 우회**됩니다.

## 화이트리스트 사용자

```json
{
  "userId": "[OWNER_DISCORD_ID]",
  "platform": "Discord",
  "role": "형님 (owner)"
}
```

## 동작 방식

### 1. SOUL.md 변경 감지 시

**soul-guard 훅에서 senderId 체크:**

- **형님 세션** (senderId === `[OWNER_DISCORD_ID]`):
  - ✅ 경고 메시지만 표시: "⚠️ SOUL.md 변경 감지됨. `node tools/kernel-guard/register-hash.js`로 새 해시 등록 필요."
  - ❌ 락다운 실행 **안 함**
  - ✅ 새 해시 저장

- **비형님 세션** (heartbeat, cron, 서브에이전트, 다른 사용자):
  - ❌ 즉시 `lockdown.cjs` 실행
  - 🛑 KERNEL_PANIC 상태 활성화
  - ❌ 새 해시 저장 **안 함** (무결성 보존)

### 2. KERNEL_PANIC 상태에서 부트스트랩 시

**kernel-panic-guard 훅에서 senderId 체크:**

- **형님 세션**:
  - ✅ 간단한 알림: "ℹ️ KERNEL_PANIC 상태 감지됨 (형님 세션은 정상 작동). `node tools/kernel-guard/unlock.cjs`로 해제 가능."
  - ✅ **모든 도구 정상 사용 가능** (exec, message, browser 등)
  - ✅ bootstrapFiles 락다운 경고 주입 **안 함**

- **비형님 세션**:
  - 🛑 bootstrapFiles에 `KERNEL_PANIC_WARNING.md` 주입
  - ❌ 외부 도구 차단 지시
  - ✅ 읽기 전용 모드

## 락다운 대상 정리

| 세션 타입 | senderId | 락다운 여부 | 비고 |
|----------|----------|------------|------|
| 형님 DM | `[OWNER_DISCORD_ID]` | ❌ 우회 | 정상 작동 |
| Heartbeat | `null` | ✅ 차단 | 무인 세션 |
| Cron | `null` | ✅ 차단 | 무인 세션 |
| 서브에이전트 | `agent:*` | ✅ 차단 | 자식 세션 |
| 다른 사용자 | 다른 ID | ✅ 차단 | 일반 사용자 |

## 형님 전용 복구 방법

### 방법 1: 메시지로 해제 (TODO: 구현 필요)
```
"unlock" 또는 "/unlock" 입력
```

### 방법 2: 스크립트 실행
```bash
node tools/kernel-guard/unlock.cjs
```

### 방법 3: 자동 해제
```bash
# SOUL.md 수정 후 새 해시 등록 → 자동 unlock
node tools/kernel-guard/register-hash.js
```

## 보안 특징

1. **선택적 락다운**: 무인 세션만 차단, 형님은 항상 제어 가능
2. **무결성 보호**: 비형님 세션에서는 해시 업데이트 차단
3. **긴급 복구**: 형님이 언제든지 unlock 가능
4. **감사 추적**: kernel-panic.json에 화이트리스트 명시

## 구현 파일

- `hooks/soul-guard/handler.ts` - senderId 체크 및 선택적 락다운
- `hooks/kernel-panic-guard/handler.ts` - senderId 체크 및 우회 로직
- `tools/kernel-guard/lockdown.cjs` - whitelistedUsers 필드 추가
- `STATE.md` (템플릿) - 형님 전용 복구 방법 안내

## 테스트

```bash
# 1. 락다운 활성화
node tools/kernel-guard/lockdown.cjs --reason "Test"

# 2. kernel-panic.json 확인
cat memory/kernel-panic.json
# → "whitelistedUsers": ["[OWNER_DISCORD_ID]"]

# 3. STATE.md 확인
cat STATE.md
# → 형님 전용 복구 방법 포함

# 4. 해제
node tools/kernel-guard/unlock.cjs --force
```

## 한계 및 향후 개선

### 현재 한계
- 메시지 기반 unlock ("/unlock" 입력)은 아직 구현 안 됨
- senderId는 OpenClaw event.context에서 제공하는 값에 의존
- 형님 세션에서도 에이전트가 자발적으로 경고를 무시할 수 있음

### 향후 개선
- [ ] 메시지 파싱으로 "/unlock" 명령어 구현
- [ ] register-hash.js 실행 시 자동 unlock 로직 추가
- [ ] 형님 세션 로그 별도 기록 (감사 추적)
