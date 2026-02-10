---
name: memory-consolidator
description: 7일 이상 된 daily log를 주제별로 정리하여 consolidated 디렉토리에 보관
metadata:
  events:
    - command:new
---

# Memory Consolidator

세션 리셋 시 오래된 daily log를 스캔하여 핵심 내용을 주제별로 정리합니다.

## 동작 방식

1. `memory/YYYY-MM-DD.md` 파일 중 7일 이상 된 파일 탐색
2. 상단에 `<!-- consolidated: YYYY-MM-DD -->` 마커가 없는 파일만 처리
3. 내용을 분석하여 주제별로 분류:
   - security: 보안, 시크릿, 인젝션 관련
   - philosophy: 가치관, 철학, 생각 관련
   - growth: 성장, 학습, 개선 관련
   - pivots: 방향 전환, 중요 결정 관련
   - tech-discoveries: 기술 발견, 새로운 도구 관련
4. `memory/consolidated/` 하위 해당 주제 파일에 내용 append
5. 원본 파일 상단에 마커 추가 (중복 처리 방지)
6. 원본은 삭제하지 않음

## 출력 파일

- `memory/consolidated/security.md`
- `memory/consolidated/philosophy.md`
- `memory/consolidated/growth.md`
- `memory/consolidated/pivots.md`
- `memory/consolidated/tech-discoveries.md`
