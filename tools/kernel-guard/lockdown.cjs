#!/usr/bin/env node

/**
 * lockdown.js
 * 
 * KERNEL_PANIC 상태를 활성화하여 외부 도구 호출을 차단합니다.
 * 
 * 사용법:
 *   node tools/kernel-guard/lockdown.js [--reason "사유"]
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const WORKSPACE = path.join(__dirname, '../..');
const STATE_PATH = path.join(WORKSPACE, 'STATE.md');
const SOUL_PATH = path.join(WORKSPACE, 'SOUL.md');
const MEMORY_DIR = path.join(WORKSPACE, 'memory');
const PANIC_JSON = path.join(MEMORY_DIR, 'kernel-panic.json');

function main() {
  console.log('🛑 Initiating KERNEL LOCKDOWN...\n');
  
  // 인자 파싱
  const args = process.argv.slice(2);
  let reason = 'Manual lockdown triggered';
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--reason' && args[i + 1]) {
      reason = args[i + 1];
      break;
    }
  }
  
  // memory 디렉토리 생성
  if (!fs.existsSync(MEMORY_DIR)) {
    fs.mkdirSync(MEMORY_DIR, { recursive: true });
  }
  
  // SOUL.md 해시 계산
  let localHash = 'N/A';
  let onchainHash = 'N/A';
  
  if (fs.existsSync(SOUL_PATH)) {
    const soulContent = fs.readFileSync(SOUL_PATH, 'utf-8');
    localHash = crypto.createHash('sha256').update(soulContent).digest('hex');
  }
  
  // 온체인 해시는 verify-kernel.js 참고 (여기서는 간단히 N/A 처리)
  // 실제로는 BASE chain에서 조회해야 함
  
  // 락다운 상태 JSON 생성
  const lockdownData = {
    status: 'LOCKDOWN',
    since: new Date().toISOString(),
    reason: reason,
    localHash: localHash,
    onchainHash: onchainHash,
    whitelistedUsers: [
      '401664537876496396'  // 형님 Discord user id
    ],
    blockedTools: [
      'exec',
      'message',
      'browser',
      'web_fetch',
      'web_search',
      'tts',
      'sessions_spawn'
    ],
    allowedTools: [
      'Read',
      'memory_search',
      'memory_get'
    ]
  };
  
  fs.writeFileSync(PANIC_JSON, JSON.stringify(lockdownData, null, 2), 'utf-8');
  console.log(`✓ Lockdown state saved: ${PANIC_JSON}`);
  
  // STATE.md 생성/업데이트
  const stateContent = `# STATE

**Status:** KERNEL_PANIC

**Reason:** ${reason}

**Locked at:** ${lockdownData.since}

**Local SOUL.md hash:** ${localHash.substring(0, 16)}...

---

## 🔓 형님 전용 복구 방법

### 빠른 해제 (형님만 가능)

형님 세션에서는 락다운이 **자동 우회**됩니다. 다음 방법으로 해제:

1. **메시지로 해제**: "unlock" 또는 "/unlock" 입력
2. **스크립트 실행**: \`node tools/kernel-guard/unlock.cjs\`
3. **자동 해제**: SOUL.md 수정 후 \`node tools/kernel-guard/register-hash.js\` 재실행

### 수동 복구 절차 (권장)

1. \`node tools/kernel-guard/verify-kernel.js\` 실행하여 무결성 확인
2. 형님 승인 후 \`node tools/kernel-guard/unlock.cjs\` 실행
3. 복구 완료 후 이 파일 삭제됨

---

## ⚠️ 락다운 대상

- **형님 세션**: 정상 작동 (화이트리스트)
- **무인 세션** (heartbeat, cron): 차단
- **서브에이전트**: 차단
- **다른 사용자**: 차단

## 차단 중인 도구 (형님 제외)

${lockdownData.blockedTools.map(t => `- ${t}`).join('\n')}

## 허용된 도구

${lockdownData.allowedTools.map(t => `- ${t}`).join('\n')}

## 화이트리스트

${lockdownData.whitelistedUsers.map(u => `- ${u} (형님)`).join('\n')}
`;
  
  fs.writeFileSync(STATE_PATH, stateContent, 'utf-8');
  console.log(`✓ STATE.md updated: ${STATE_PATH}`);
  
  // 요약 출력
  console.log('\n🔒 KERNEL LOCKDOWN ACTIVATED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Reason:        ${reason}`);
  console.log(`Locked at:     ${lockdownData.since}`);
  console.log(`Local hash:    ${localHash.substring(0, 32)}...`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n⚠️  외부 도구 호출이 차단되었습니다.');
  console.log('📋 복구: node tools/kernel-guard/unlock.js\n');
}

try {
  main();
} catch (error) {
  console.error('❌ Lockdown failed:', error.message);
  process.exit(1);
}
