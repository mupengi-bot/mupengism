---
name: kernel-panic-guard
description: "KERNEL_PANIC 상태 시 외부 도구 호출 하드 차단"
metadata: { "openclaw": { "emoji": "🛑", "events": ["agent:bootstrap"] } }
---

# Kernel Panic Guard

STATE.md가 KERNEL_PANIC이면 외부 행동 도구를 차단.

## 동작 방식

1. agent:bootstrap 이벤트 발생 시 STATE.md 체크
2. "KERNEL_PANIC" 문자열이 포함되어 있으면:
   - context.bootstrapFiles에 긴급 경고 주입
   - event.messages에 시스템 경고 추가
3. 에이전트는 경고를 읽고 외부 도구 사용 자제

## 차단 대상 도구

- `exec` - 쉘 명령 실행
- `message` - 외부 메시지 전송
- `browser` - 브라우저 제어
- `web_fetch` - 웹 페이지 가져오기
- `web_search` - 웹 검색
- `tts` - 음성 합성
- `sessions_spawn` - 서브에이전트 생성

## 허용 도구

- `Read` - 파일 읽기
- `memory_search` - 메모리 검색
- `memory_get` - 메모리 조회

## 복구

```bash
node tools/kernel-guard/unlock.cjs
```
