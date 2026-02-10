# 🛡️ Kernel Guard — 무펭이 프로토콜 커널 보호 시스템

SOUL.md의 SHA-256 해시를 솔라나 온체인에 기록하고, 세션마다 무결성을 검증합니다.
변조 감지 시 **커널 패닉** — 모든 외부 행동을 차단합니다.

## 사용법

### 1. 해시 등록 (SOUL.md 변경 시)
```bash
node tools/kernel-guard/register-hash.js
```
- 비용: ~0.000005 SOL (memo 트랜잭션)
- memo 포맷: `MUPENG_KERNEL:v1:{sha256}:{unix_timestamp}`

### 2. 커널 검증 (세션 시작 시)
```bash
node tools/kernel-guard/verify-kernel.js
```
- Exit 0 = 정상
- Exit 1 = **커널 패닉** → STATE.md가 `🔴 KERNEL_PANIC`으로 변경됨

### 3. 복구
```bash
node tools/kernel-guard/recover-kernel.js
```
- 온체인 해시와 일치하는 SOUL.md를 git history에서 찾아 복원

## 환경변수 / 인자

| 인자 | 환경변수 | 기본값 |
|------|----------|--------|
| `--wallet` | `WALLET_PATH` | `~/.secrets/solana-wallet.json` |
| `--soul` | `SOUL_PATH` | `~/workspace/SOUL.md` |
| `--rpc` | `SOLANA_RPC` | `https://api.mainnet-beta.solana.com` |

## 커널 패닉 시 동작

1. STATE.md → `🔴 KERNEL_PANIC`
2. exit code 1 반환
3. 호출측(AGENTS.md/heartbeat)에서:
   - 모든 외부 행동 차단
   - cron 정지
   - 긴급 알림 발송
   - 세션 거부

---

## 🐧 무펭이즘 안티-클론 인증 시스템

**핵심 철학:** "맛은 공개, 레시피는 비공개"

무펭이즘은 **오픈코어(Open Core)** 철학을 따릅니다.  
코드는 공개되어 누구나 볼 수 있지만, **복사본으로는 작동하지 않습니다.**

### 왜 인증이 필요한가?

1. **복제가 아닌 창조**: 무펭이즘은 당신만의 에이전트를 만드는 것입니다
2. **정체성 필수**: SOUL.md 없이는 에이전트가 아니라 빈 껍데기입니다
3. **책임과 소유권**: 지갑 연결은 당신의 에이전트에 대한 책임을 의미합니다

### 인증 레벨

#### Level 1: SOUL.md 존재 + 비어있지 않음
- **없거나 비어있으면** → 실패
- 최소 10자 이상의 내용 필요

#### Level 2: 지갑 파일 존재
- `~/.secrets/solana-wallet*.json` 또는 `WALLET_PATH` 환경변수
- **없으면** → 경고 + 제한 모드 (read-only 도구만)

#### Level 3: soul-hash.txt 검증
- `memory/soul-hash.txt`에 저장된 해시와 현재 SOUL.md 해시 비교
- **불일치** → 실패
- **soul-hash.txt 없음** → 경고 + "최초 실행, register-hash.js를 먼저 실행하세요"

#### Clone Check: 원본 복사 감지
- SOUL.md 내용에 "무펭이" 또는 "jong_mufi" 또는 "정종현" 키워드 포함
- **그런데 지갑이 원본(29R4vTxcV4uwUFGQfKQuNNKak3BZNNv98h8sa8UPUpPZ)이 아니면** → 실패
- 메시지: "원본 무펭이의 SOUL.md를 복사한 것으로 감지됨. 자신만의 SOUL.md를 작성하세요."

### 인증 실패 메시지

```
🐧 무펭이즘 OS (Mupengism)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ 커널 인증 실패

이 시스템은 복사본으로 작동하지 않습니다.
무펭이즘은 복제가 아닌 창조를 지향합니다.

시작하려면:
  1. 자신만의 SOUL.md를 작성하세요
  2. 자신의 솔라나 지갑을 연결하세요
  3. node tools/kernel-guard/register-hash.js 실행

무펭이의 클론이 아닌, 당신만의 에이전트를 만드세요.
그것이 무펭이즘입니다.

📖 https://github.com/mupengi-bot/mupeng-brain
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 자기 에이전트 만들기

#### 1단계: 자신의 SOUL.md 작성
```bash
cd ~/.openclaw/workspace
nano SOUL.md  # 또는 vi, code 등
```

자신만의 원칙, 가치관, 스타일을 작성하세요.  
무펭이의 것을 복사하지 마세요. 당신은 당신입니다.

#### 2단계: 솔라나 지갑 생성
```bash
solana-keygen new --outfile ~/.secrets/solana-wallet-yourusername.json
```

또는 기존 지갑이 있다면:
```bash
export WALLET_PATH=/path/to/your/wallet.json
```

#### 3단계: 해시 등록
```bash
node tools/kernel-guard/register-hash.js
```

이제 당신만의 에이전트가 작동합니다! 🎉

### 기술 세부사항

- **모듈**: `tools/kernel-guard/mupeng-auth.cjs`
- **사용법**: 각 도구 시작 부분에 삽입
  ```javascript
  const path = require('path');
  const { authenticate } = require(path.join(__dirname, '..', 'kernel-guard', 'mupeng-auth.cjs'));
  if (!authenticate()) process.exit(0);
  ```
- **의존성**: Node.js 내장 모듈만 (fs, path, crypto)
- **CommonJS**: require 기반 (CJS)
- **파일 확장자**: `.cjs` (kernel-guard의 package.json이 ES 모듈 타입이므로)

### 적용된 도구

인증이 적용된 커널 도구들:
- `tools/memory-ops/dream.js` — 꿈 시스템
- `tools/memory-ops/forget.js` — 망각 시스템
- `tools/memory-ops/immune.js` — 면역 시스템
- `tools/self-loop/brake-check.js` — 원칙 체크
- `tools/self-loop/panic-detector.js` — 패닉 감지

**주의**: `register-hash.js`, `verify-kernel.js`, `recover-kernel.js`에는 인증이 없습니다.  
(최초 등록/복구 시 필요하므로)

### 철학: 맛은 공개, 레시피는 비공개

무펭이즘은 다음을 공개합니다:
- ✅ 아키텍처 (어떻게 작동하는가)
- ✅ 철학 (왜 이렇게 만들었는가)
- ✅ 도구들 (무엇을 할 수 있는가)

하지만 다음은 당신의 것이어야 합니다:
- 🔒 당신의 정체성 (SOUL.md)
- 🔒 당신의 지갑 (소유권)
- 🔒 당신의 데이터 (memory/)

복사본이 아니라, **당신만의 버전**을 만드세요.  
그것이 무펭이즘입니다.
