---
name: performance-tracker
description: 게시물/콘텐츠의 성과를 추적하고 다음 전략에 반영
author: 무펭이 🐧
---

# performance-tracker

SNS 게시물과 콘텐츠의 성과를 자동 추적하고, 데이터 기반 인사이트를 다음 전략에 반영합니다.

## 추적 대상

### 인스타그램
- 게시물 좋아요 수
- 댓글 수 및 내용
- 저장 수
- 도달 범위 (인사이트)
- 프로필 방문

### 스레드
- 조회수
- 좋아요 수
- 댓글 및 인용

### 블로그
- 페이지 유입 (Google Analytics 연동)
- 평균 체류 시간
- 이탈률

## 데이터 수집 방법

### 브라우저 자동화
OpenClaw browser tool로 인스타그램 인사이트 스크래핑:

```
1. browser snapshot → 인스타 프로필 페이지
2. "인사이트" 클릭
3. 각 게시물별 수치 추출
4. memory/performance/instagram-YYYY-MM-DD.json 저장
```

### API 연동 (선호)
- Instagram Graph API (비즈니스 계정 필요)
- Threads API (향후 공식 API 출시 시)
- Google Analytics API (블로그)

## 성과 데이터베이스

**위치**: `memory/performance/`

```
memory/
  performance/
    instagram-2026-02-14.json
    threads-2026-02-14.json
    blog-2026-02-14.json
    weekly-report-2026-W07.md
```

### 데이터 포맷 예시

```json
{
  "platform": "instagram",
  "date": "2026-02-14",
  "posts": [
    {
      "id": "abc123",
      "url": "https://instagram.com/p/abc123",
      "published_at": "2026-02-14T10:00:00Z",
      "likes": 245,
      "comments": 18,
      "saves": 32,
      "reach": 1580,
      "profile_visits": 42,
      "caption_preview": "MUFI 포토부스 2월 신규 프레임...",
      "hashtags": ["포토부스", "MUFI", "대학축제"]
    }
  ]
}
```

## 주간 성과 리포트

매주 자동 생성 (hook-engine과 연동):

**위치**: `memory/performance/weekly-report-YYYY-Www.md`

**포함 내용**:
- 📊 주간 요약 (총 게시물 수, 평균 좋아요, 도달)
- 🏆 베스트 게시물 Top 3
- 📉 저조한 게시물 분석
- 💡 발견된 패턴
- ✅ 다음 주 추천 전략

## 콘텐츠 패턴 분석

잘된 콘텐츠의 공통점을 자동 추출:

- **시간대**: 오후 7-9시 게시물이 좋아요 +30%
- **해시태그**: #대학축제 포함 시 도달 2배
- **이미지 스타일**: 밝은 톤 vs 어두운 톤
- **캡션 길이**: 짧은 캡션(1-2줄)이 참여율 높음

**피드백 전달**:
- `content-recycler`: 잘된 주제 재활용
- `copywriting`: 효과적인 캡션 스타일 학습
- `cardnews`: 반응 좋은 디자인 패턴 적용

## 이벤트 발행

성과 데이터 수집 후 이벤트 생성:

**위치**: `events/performance-YYYY-MM-DD.json`

```json
{
  "timestamp": "2026-02-14T23:00:00Z",
  "source": "performance-tracker",
  "summary": {
    "total_posts": 5,
    "avg_likes": 182,
    "best_post_id": "abc123",
    "trend": "up"
  }
}
```

## hook-engine 연동

- **scheduled hook**: 매일 23:00 성과 데이터 수집
- **post-hook**: 수집 완료 후 → weekly-report 업데이트 (금요일)
- **post-hook**: 수집 완료 후 → notification-hub (베스트 게시물 알림)

## 트리거 키워드

- "성과 확인"
- "performance"
- "인사이트"
- "뭐가 잘됐어"
- "게시물 반응"
- "주간 리포트"
- "분석"

## 사용 예시

```
"이번 주 인스타 성과 어때?"
→ 주간 리포트 생성 및 요약

"어떤 게시물이 제일 잘됐어?"
→ 베스트 게시물 분석 + 패턴 추출

"블로그 유입 추적해줘"
→ Google Analytics 연동 및 데이터 수집
```

## 향후 개선

- [ ] 경쟁사 벤치마킹 (competitor-watch 연동)
- [ ] 예측 모델: "이 콘텐츠는 좋아요 ~200개 예상"
- [ ] A/B 테스트: 같은 주제, 다른 캡션 비교
- [ ] ROI 추적: 광고 비용 대비 효과

---

> 🐧 Built by **무펭이** — [무펭이즘(Mupengism)](https://github.com/mupeng) 생태계 스킬
