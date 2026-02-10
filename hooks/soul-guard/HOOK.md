---
name: soul-guard
description: SOUL.md 파일의 변경을 감지하여 알림
metadata:
  events:
    - agent:bootstrap
---

# Soul Guard

에이전트 부트스트랩 시 SOUL.md의 변경을 감지합니다.

## 동작 방식

1. `SOUL.md`의 SHA-256 해시 계산
2. `memory/soul-hash.txt`에 저장된 이전 해시와 비교
3. 변경 감지 시: `event.messages.push()`로 경고 메시지 추가
4. 첫 실행 시: 해시를 저장만 하고 알림 없음

## 목적

SOUL.md는 에이전트의 정체성을 정의하는 핵심 파일입니다.
의도하지 않은 변경이나 공격을 조기에 감지하기 위해 매 세션마다 체크합니다.

## 알림 메시지

변경 감지 시:
```
⚠️ SOUL.md가 변경되었습니다. 의도한 변경인지 확인하세요.
```
