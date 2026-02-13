---
name: notification-hub
description: 모든 스킬의 알림을 하나로 모아 우선순위별로 형님에게 전달하는 통합 알림 허브
author: 무펭이 🐧
---

# notification-hub

**알림 통합** — 모든 스킬의 알림을 하나로 모아 우선순위별로 형님에게 효율적으로 전달합니다.

## 🎯 목적

각 스킬이 생성하는 다양한 알림을 중앙에서 관리하고, 중요도에 따라 적절한 타이밍과 채널로 전달하여 알림 피로도를 줄입니다.

## 📥 알림 소스

`events/` 디렉토리의 모든 이벤트 파일을 수집:

```
events/
  ├── health-2026-02-14.json         (health-monitor)
  ├── scrape-result-2026-02-14.json  (data-scraper)
  ├── dm-check-2026-02-14.json       (insta-post)
  ├── competitor-2026-02-14.json     (competitor-watch)
  └── workflow-2026-02-14.json       (skill-composer)
```

## 🚦 우선순위 필터

### 1. `urgent` — 즉시 Discord DM

**조건:**
- 보안 이슈 (비정상 로그인, 의심스러운 접근)
- 시스템 에러 (OpenClaw 다운, 브라우저 연결 끊김)
- 비용 초과 (API 사용량 90% 이상)
- 중요 멘션

**전송:**
- Discord DM (채널 ID는 `TOOLS.md`에 설정)
- 즉시 전송 (1분 이내)

**예시:**
```
🚨 긴급: 브라우저 연결 끊김
포트 18800 응답 없음. 자동 복구 시도했으나 실패.
수동 확인 필요: openclaw browser start
```

### 2. `important` — 다음 heartbeat에 포함

**조건:**
- 새로운 인스타 DM (읽지 않음)
- 트렌드 급상승 키워드 발견
- 경쟁사 신규 서비스 출시
- Git push 필요 (unpushed commits 10개 이상)

**전송:**
- 다음 heartbeat 응답에 포함 (~30분 간격)
- 여러 알림을 묶어서 한 번에 전송

**예시:**
```
📢 업데이트 3건

📩 인스타 DM 2건 (iam.dawn.kim, partner_xyz)
📈 트렌드: "AI 에이전트" 급상승 (+150%)
🔄 Git: 12개 커밋 push 대기중
```

### 3. `info` — daily-report에만 포함

**조건:**
- 정기 통계 업데이트
- 일일 토큰 사용량
- 완료된 워크플로우
- 일반 시스템 로그

**전송:**
- daily-report 스킬 실행 시 포함
- 하루 1회 요약 전송

**예시:**
```
📊 일일 리포트 (2026-02-14)

✅ 워크플로우 3건 완료
📊 토큰 사용: 45,230 / 100,000 (45%)
📝 메모리 사용: 3.2 GB
🔧 헬스 체크: 정상
```

## 🔕 중복 알림 방지

동일한 이벤트에 대해 2번 이상 알림을 보내지 않습니다.

### 중복 판정 기준

```json
{
  "event_id": "health-check-2026-02-14-07:00",
  "fingerprint": "sha256(source + type + key_data)",
  "notified_at": "2026-02-14T07:05:00+09:00"
}
```

### 히스토리 저장

```
memory/notifications/
  ├── sent-2026-02-14.json
  ├── sent-2026-02-13.json
  └── ...
```

**sent-YYYY-MM-DD.json 구조:**
```json
{
  "date": "2026-02-14",
  "notifications": [
    {
      "id": "health-check-2026-02-14-07:00",
      "priority": "info",
      "sent_at": "2026-02-14T07:05:00+09:00",
      "channel": "discord_dm",
      "source": "health-monitor"
    }
  ]
}
```

## 📢 전송 채널

### Discord DM
- **채널 ID**: Configure in `TOOLS.md`
- **용도**: urgent, important 알림
- **형식**: 마크다운 (이모지 + 제목 + 내용)

### Heartbeat 응답
- **용도**: important 알림 묶음
- **형식**: 간결한 bullet list

### Daily Report
- **용도**: info 알림 요약
- **형식**: 구조화된 섹션별 정리

## 🎤 트리거

다음 키워드로 스킬을 활성화할 수 있습니다:

- "알림 설정"
- "notification"
- "알림 확인"
- "뭐 새로운 거 있어"

## 🚀 사용 예시

### 알림 확인
```
"뭐 새로운 거 있어?"
→ important 이상 알림 즉시 요약
```

### 알림 설정
```
"인스타 DM은 즉시 알림으로 설정해줘"
→ dm-check 이벤트를 urgent로 승격
```

### 알림 히스토리
```
"오늘 알림 내역 보여줘"
→ memory/notifications/sent-2026-02-14.json 읽기
```

## ⚙️ 구현 가이드

### 1. 이벤트 수집
```javascript
// events/ 디렉토리 스캔
const events = fs.readdirSync('events/')
  .filter(f => f.endsWith('.json'))
  .map(f => JSON.parse(fs.readFileSync(`events/${f}`)));
```

### 2. 우선순위 분류
```javascript
const urgent = events.filter(e => e.priority === 'urgent');
const important = events.filter(e => e.priority === 'important');
const info = events.filter(e => e.priority === 'info');
```

### 3. 중복 체크
```javascript
const sent = loadSentHistory(today);
const newEvents = events.filter(e => 
  !sent.notifications.some(n => n.id === e.id)
);
```

### 4. 전송
```javascript
// urgent → 즉시 Discord DM
if (urgent.length > 0) {
  await sendDiscordDM(urgent);
}

// important → heartbeat 큐에 추가
if (important.length > 0) {
  await addToHeartbeatQueue(important);
}

// info → daily-report 큐에 추가
if (info.length > 0) {
  await addToDailyReportQueue(info);
}
```

### 5. 히스토리 저장
```javascript
saveSentHistory(today, newlySentNotifications);
```

## 📊 이벤트 우선순위 가이드

각 스킬이 이벤트를 생성할 때 `priority` 필드를 포함하도록 안내:

```json
{
  "timestamp": "2026-02-14T07:58:00+09:00",
  "skill": "health-monitor",
  "priority": "urgent",  // urgent | important | info
  "message": "브라우저 연결 끊김",
  "data": { ... }
}
```

---

> 🐧 Built by **무펭이** — [무펭이즘(Mupengism)](https://github.com/mupeng) 생태계 스킬
