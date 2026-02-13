---
name: self-eval
description: 주간 자기 성과/실수 자동 리뷰 스킬
author: 무펭이 🐧
---

# self-eval

주간 자기 성과/실수를 자동으로 리뷰하는 스킬입니다.

## 기능

- `memory/` 폴더에서 최근 7일간의 일일 노트 리뷰
- 잘한 것, 실수, 개선점 자동 추출
- `SOUL.md` 원칙 준수율 체크
- 결과를 `memory/self-eval/YYYY-WXX.md`에 저장

## 사용법

트리거 키워드:
- "자기평가"
- "self eval"
- "주간 리뷰"
- "이번주 어땠어"

예시:
```
이번주 자기평가 해줘
```

## 출력 형식

```markdown
# 주간 자기평가 YYYY-WXX

## 기간
YYYY-MM-DD ~ YYYY-MM-DD

## 잘한 것 ✅
- ...
- ...

## 실수/아쉬운 점 ⚠️
- ...
- ...

## 개선점 💡
- ...
- ...

## SOUL.md 원칙 준수율
- [원칙1]: 준수 / 부분 준수 / 미준수
- [원칙2]: ...

## 다음 주 목표
- ...
```

## 이벤트 버스 연동

평가 완료 시 이벤트 발행:
- 경로: `events/self-eval-YYYY-MM-DD.json`
- 형식:
```json
{
  "type": "self-eval-completed",
  "timestamp": "2026-02-14T12:00:00Z",
  "week": "2026-W07",
  "summary": {
    "achievements": 3,
    "mistakes": 2,
    "improvements": 4
  },
  "soulCompliance": 0.85
}
```

---

**self-eval** | 무펭이 🐧
