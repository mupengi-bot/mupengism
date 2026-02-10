# memory-ops - 기억 운영 도구

무펭이의 기억 시스템을 관리하는 순수 Node.js 도구 모음

## 📁 구조

```
tools/memory-ops/
├── forget.js    # 망각 시스템
├── dream.js     # 꿈 시스템
└── README.md    # 이 문서
```

---

## 🧹 망각 시스템 (forget.js)

오래 참조되지 않은 기억에 **decay score**를 부여하고 아카이브 후보를 제안합니다.

### 사용법

```bash
node tools/memory-ops/forget.js
```

### 동작 원리

1. `memory/consolidated/*.md` 파일들을 스캔
2. 각 파일의 `lastModified` 날짜 확인
3. `memory/index.json`에서 태그 참조 횟수 확인
4. **Decay Score** 계산:
   ```
   score = days_since_modified * 0.5 + (참조횟수 == 0 ? 30 : 0)
   ```
5. 추천 액션 결정:
   - `score > 90` → **ARCHIVE** (아카이브 후보)
   - `score > 45` → **REVIEW** (검토 필요)
   - `score ≤ 45` → **KEEP** (유지)

### 출력 예시

```
🧹 망각 시스템 - 기억 부패 분석

파일명                          | Decay | 참조 | 최종수정     | 액션
--------------------------------|-------|------|--------------|--------
old-topic.md                    |    95 |    0 | 2025-11-15   | 🗄️  ARCHIVE
growth.md                       |    12 |    5 | 2026-02-08   | ✅ KEEP
security.md                     |     8 |    2 | 2026-02-10   | ✅ KEEP

📊 요약: KEEP 2개 | REVIEW 0개 | ARCHIVE 1개

💡 ARCHIVE 후보가 있습니다. 검토 후 수동으로 아카이브하세요.
```

### 주의사항

- **실제 삭제나 이동은 하지 않습니다** (제안만)
- 아카이브는 수동으로 진행하세요
- `index.json`이 없으면 참조 횟수는 0으로 계산됩니다

---

## 🌙 꿈 시스템 (dream.js)

서로 관련 없어 보이는 기억들을 연결해서 **새 인사이트 후보**를 만들어냅니다.

### 사용법

```bash
node tools/memory-ops/dream.js
```

### 동작 원리

1. `memory/consolidated/*.md` + `memory/values/*.md` 파일들을 읽음
2. 각 파일에서 키워드/주제 추출:
   - `# 헤더` (1-3단계)
   - `**볼드 텍스트**`
3. 파일 간 연결 찾기:
   - **직접 연결** 🔗: 공통 키워드가 있는 경우
   - **간접 연결** 💡: 파일A의 키워드가 파일B 본문에 등장하는 경우
4. 발견된 연결을 `memory/dreams/YYYY-MM-DD.md`에 기록

### 출력 예시

```
🌙 꿈 시스템 - 기억 연결 발견

📚 6개 파일 분석 중...

✅ 꿈 기록 저장: memory/dreams/2026-02-10.md

📊 총 8개의 연결 발견

🔍 발견된 연결 미리보기:

🔗 직접: security.md ↔ growth.md
   → "브레이커" 키워드 공유

💡 간접: philosophy.md ↔ pivots.md
   → "존재"가 pivots.md 본문에 등장

💡 간접: growth.md ↔ 형님-가치관.md
   → "자율성"가 형님-가치관.md 본문에 등장

... 외 5개 연결 (파일 참조)
```

### 생성되는 파일 형식

`memory/dreams/2026-02-10.md`:

```markdown
# 🌙 무펭이의 꿈 (2026-02-10)

오늘 8개의 연결을 발견했습니다.

## 연결 발견

- 🔗 **security.md ↔ growth.md**: "브레이커" 키워드 공유
- 💡 **philosophy.md ↔ pivots.md**: "존재"가 pivots.md 본문에 등장
- 💡 **growth.md ↔ 형님-가치관.md**: "자율성"가 형님-가치관.md 본문에 등장

---
_생성: 2026-02-10T14:55:23.123Z_
```

### 주의사항

- `memory/dreams/` 디렉토리가 없으면 자동 생성됩니다
- 같은 날 여러 번 실행하면 파일이 **덮어쓰기**됩니다
- 최소 2개 이상의 파일이 필요합니다

---

## 🔧 기술 사양

### 공통 제약

- **순수 Node.js**: 외부 의존성 없음 (`fs`, `path`만 사용)
- **LLM 호출 없음**: 순수 텍스트 패턴 분석
- **에러 핸들링**: 모든 파일 I/O에 try-catch 적용

### 실행 환경

- Node.js 14+ 권장
- 작업 디렉토리: `/Users/mupeng/.openclaw/workspace/`
- 환경변수 `WORKSPACE` 지원 (기본값: 위 경로)

### 실행 권한 부여 (옵션)

```bash
chmod +x tools/memory-ops/*.js
```

실행 권한을 부여하면 `./forget.js` 형태로 직접 실행 가능합니다.

---

## 🎯 사용 시나리오

### 주간 기억 정리

```bash
# 1. 부패한 기억 확인
node tools/memory-ops/forget.js

# 2. ARCHIVE 후보 수동 검토
# 3. 필요시 consolidated/_archive/ 폴더로 이동
```

### 새로운 인사이트 발견

```bash
# 정기적으로 꿈 시스템 실행
node tools/memory-ops/dream.js

# memory/dreams/ 디렉토리 확인
# 의미있는 연결이 있으면 MEMORY.md나 consolidated에 반영
```

### Heartbeat에 통합

`HEARTBEAT.md`에 추가:

```markdown
## 주간 기억 관리 (매주 일요일)

- [ ] `node tools/memory-ops/forget.js` 실행
- [ ] ARCHIVE 후보 검토
- [ ] `node tools/memory-ops/dream.js` 실행
- [ ] dreams 파일 확인 및 인사이트 통합
```

---

## 🚀 확장 아이디어

### 추가 기능 후보

- **consolidate.js**: 일일 메모리를 주제별로 자동 통합
- **prune.js**: ARCHIVE 액션을 자동 실행 (백업 후)
- **index-rebuild.js**: index.json을 파일 내용 기반으로 재생성
- **meta.js**: 기억 시스템 전체 통계 (파일 수, 키워드 분포 등)

### 메타인지 루프

```
daily notes → consolidate → index → forget/dream → insights → MEMORY.md
```

---

## 📝 변경 이력

- **2026-02-10**: 초기 구현 (forget.js, dream.js)

---

**Made with 🧠 by 무펭이**
