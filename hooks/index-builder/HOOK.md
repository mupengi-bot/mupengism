---
name: index-builder
description: memory 디렉토리의 모든 .md 파일을 스캔하여 검색 가능한 인덱스 생성
metadata:
  events:
    - command:new
---

# Index Builder

세션 리셋 시 memory 디렉토리의 모든 마크다운 파일을 스캔하여 검색 인덱스를 생성합니다.

## 동작 방식

1. `memory/` 하위 모든 `.md` 파일을 재귀적으로 스캔
2. 각 파일에서 태그 추출:
   - `<!-- [태그] -->` 형식의 마커
   - `# 헤더` 에서 키워드 추출
3. `memory/index.json` 생성/갱신

## 인덱스 구조

```json
{
  "lastUpdated": "2026-02-10T14:48:00.000Z",
  "files": {
    "memory/consolidated/security.md": {
      "tags": ["보안", "시크릿", "인젝션"],
      "lastModified": "2026-02-10T14:48:00.000Z",
      "lines": 50
    }
  },
  "tags": {
    "보안": ["memory/consolidated/security.md", "memory/reflex/security.md"]
  }
}
```

## 활용

에이전트가 특정 주제의 과거 메모리를 빠르게 찾을 수 있습니다.
