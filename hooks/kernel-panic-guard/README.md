# Kernel Panic Guard

**KERNEL_PANIC** 상태 시 외부 도구 호출을 하드 차단하는 OpenClaw 훅입니다.

## 개요

이 훅은 `agent:bootstrap` 이벤트에서 실행되며, `STATE.md`에 `KERNEL_PANIC` 문자열이 포함되어 있는지 확인합니다. 
감지되면 에이전트의 `bootstrapFiles`에 경고 문서를 주입하여 외부 도구 사용을 차단합니다.

## 작동 방식

1. **agent:bootstrap 이벤트 발생** (세션 시작 시)
2. **STATE.md 존재 및 내용 확인**
3. **senderId 체크** (형님 화이트리스트: `401664537876496396`)
4. **"KERNEL_PANIC" 감지 시:**
   - **형님 세션**: 간단한 알림만, 락다운 우회
   - **비형님 세션**: `context.bootstrapFiles`에 `KERNEL_PANIC_WARNING.md` 주입
5. **에이전트는 경고를 읽고 외부 도구 사용 자제**

## 차단 대상 세션

락다운은 다음 세션에만 적용됩니다:

- **무인 세션** (heartbeat, cron)
- **서브에이전트**
- **형님이 아닌 사용자**

**형님 세션 (Discord user id: `401664537876496396`)은 락다운 우회**

## 차단 대상 도구 (형님 제외)

다음 도구는 KERNEL_PANIC 상태에서 **절대 사용 금지**입니다:

- `exec` - 쉘 명령 실행
- `message` - 외부 메시지 전송
- `browser` - 브라우저 제어
- `web_fetch` - 웹 페이지 가져오기
- `web_search` - 웹 검색
- `tts` - 음성 합성
- `sessions_spawn` - 서브에이전트 생성

## 허용 도구

다음 도구만 사용 가능합니다:

- `Read` - 파일 읽기
- `memory_search` - 메모리 검색
- `memory_get` - 메모리 조회

## 관련 스크립트

### 락다운 활성화

```bash
node tools/kernel-guard/lockdown.cjs [--reason "사유"]
```

- STATE.md에 KERNEL_PANIC 상태 기록
- memory/kernel-panic.json 생성
- 차단 대상/허용 도구 목록 저장

### 락다운 해제

#### 형님 전용 빠른 해제

```bash
# 방법 1: 스크립트 실행
node tools/kernel-guard/unlock.cjs

# 방법 2: 메시지로 해제
# 채팅에서 "unlock" 또는 "/unlock" 입력

# 방법 3: 자동 해제
# SOUL.md 수정 후 register-hash.js 재실행
node tools/kernel-guard/register-hash.js
```

#### 일반 해제 (무결성 확인)

```bash
node tools/kernel-guard/unlock.cjs [--force]
```

- verify-kernel.js로 무결성 확인
- 통과 시 STATE.md 및 kernel-panic.json 삭제
- `--force` 플래그로 무결성 체크 우회 (비권장)

### 무결성 검증

```bash
node tools/kernel-guard/verify-kernel.js
```

- SOUL.md 로컬 해시 계산
- BASE chain에서 온체인 해시 조회
- 일치 여부 확인

## 훅 연동

이 훅은 **soul-guard** 훅과 연동됩니다:

- `soul-guard`: SOUL.md 해시 변경 감지 + STATE.md KERNEL_PANIC 체크
- `kernel-panic-guard`: STATE.md KERNEL_PANIC 감지 + bootstrapFiles 주입

두 훅 모두 `agent:bootstrap` 이벤트에서 실행되며, 중복 체크는 문제없습니다.

## 보안 특징

1. **읽기 전용 모드**: 외부 행동 차단, 파일 읽기만 허용
2. **형님 승인 필요**: 복구는 반드시 수동 실행
3. **감사 추적**: kernel-panic.json에 락다운 이력 기록
4. **우회 불가**: bootstrapFiles 주입으로 세션 시작부터 경고

## 테스트

```bash
# 락다운 활성화
node tools/kernel-guard/lockdown.cjs --reason "Test"

# STATE.md 확인
cat STATE.md

# 락다운 해제 (강제)
node tools/kernel-guard/unlock.cjs --force
```

## 한계

- **에이전트 협조 필요**: 강제 차단이 아닌 경고 주입 방식
- **before_tool_call 훅 미지원**: 현재 워크스페이스 훅은 bootstrap만 지원
- **우회 가능성**: 에이전트가 경고를 무시하면 실행 가능

### 향후 개선

- OpenClaw 플러그인 시스템에 `before_tool_call` 훅 추가 시 하드 블록 구현 가능
- middleware.js에서 `{ block: true, blockReason: "..." }` 리턴하여 도구 호출 원천 차단
