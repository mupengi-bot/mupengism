---
name: code-review
description: 코드 변경사항 자동 리뷰
author: 무펭이 🐧
---

# code-review

코드 변경사항을 자동으로 분석하고 리뷰하는 스킬입니다.

## 기능

- `git diff` 기반 변경 분석
- 보안 취약점 탐지
- 성능 이슈 체크
- 코드 품질 평가
- 개선 제안 + 심각도 표시 (🔴 Critical / 🟡 Warning / 🟢 Info)

## 사용법

트리거 키워드:
- "코드 리뷰"
- "code review"
- "이 코드 봐줘"
- "PR 리뷰"

예시:
```
코드 리뷰 해줘
[파일 경로 또는 diff 붙여넣기]
```

또는 자동으로 현재 디렉토리의 git diff 분석:
```
git diff HEAD를 코드 리뷰 해줘
```

## 리뷰 체크리스트

### 보안
- [ ] 하드코딩된 시크릿/API 키
- [ ] SQL Injection 가능성
- [ ] XSS 취약점
- [ ] 권한 검증 누락
- [ ] 민감 정보 로깅

### 성능
- [ ] N+1 쿼리
- [ ] 불필요한 루프/반복
- [ ] 메모리 누수 가능성
- [ ] 비효율적 자료구조 사용
- [ ] 캐싱 기회 누락

### 코드 품질
- [ ] 네이밍 일관성
- [ ] 중복 코드 (DRY 원칙)
- [ ] 함수/클래스 길이
- [ ] 주석/문서화
- [ ] 에러 핸들링

### 베스트 프랙티스
- [ ] 린트 규칙 준수
- [ ] 테스트 커버리지
- [ ] 타입 안전성 (TypeScript)
- [ ] 의존성 최신화

## 출력 형식

```markdown
# 코드 리뷰 결과

**리뷰 일시**: YYYY-MM-DD HH:MM  
**변경 파일**: N개  
**추가**: +XXX줄 | **삭제**: -XXX줄

## 요약
- 🔴 Critical: N개
- 🟡 Warning: N개
- 🟢 Info: N개

---

## 🔴 Critical Issues

### [파일명:라인] 하드코딩된 API 키 발견
```diff
+ const API_KEY = "sk-1234567890abcdef";
```
**문제**: 소스 코드에 API 키 노출  
**해결**: 환경변수로 이동 (`process.env.API_KEY`)  
**심각도**: 🔴 Critical

---

## 🟡 Warnings

### [파일명:라인] N+1 쿼리 가능성
```js
users.forEach(user => {
  const posts = db.query(`SELECT * FROM posts WHERE user_id = ${user.id}`);
});
```
**문제**: 루프 내 개별 쿼리 실행  
**해결**: JOIN 또는 IN 절 사용  
**심각도**: 🟡 Warning

---

## 🟢 Suggestions

### 네이밍 개선 제안
`tmp` → `temporaryUserCache`  
더 명확한 변수명 권장

---

## 종합 의견
전반적으로 양호하나, 보안 이슈 1건은 머지 전 반드시 수정 필요.
```

## 자동화 옵션

`.github/workflows/code-review.yml` 예시:
```yaml
on: [pull_request]
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: openclaw run code-review
```

---

**code-review** | 무펭이 🐧
