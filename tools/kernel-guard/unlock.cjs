#!/usr/bin/env node

/**
 * unlock.js
 * 
 * KERNEL_PANIC 상태를 해제하여 정상 작동을 복구합니다.
 * verify-kernel.js로 무결성을 먼저 확인합니다.
 * 
 * 사용법:
 *   node tools/kernel-guard/unlock.js [--force]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACE = path.join(__dirname, '../..');
const STATE_PATH = path.join(WORKSPACE, 'STATE.md');
const PANIC_JSON = path.join(WORKSPACE, 'memory/kernel-panic.json');
const VERIFY_SCRIPT = path.join(__dirname, 'verify-kernel.js');

function main() {
  console.log('🔓 Starting KERNEL UNLOCK process...\n');
  
  // 인자 파싱
  const args = process.argv.slice(2);
  const forceUnlock = args.includes('--force');
  
  // STATE.md 존재 확인
  if (!fs.existsSync(STATE_PATH)) {
    console.log('✓ STATE.md not found (already unlocked or never locked)');
    cleanupPanicFiles();
    console.log('\n✅ System is clean. No lockdown detected.\n');
    return;
  }
  
  // STATE.md 내용 확인
  const stateContent = fs.readFileSync(STATE_PATH, 'utf-8');
  if (!stateContent.includes('KERNEL_PANIC')) {
    console.log('✓ STATE.md exists but no KERNEL_PANIC detected');
    cleanupPanicFiles();
    console.log('\n✅ System is normal.\n');
    return;
  }
  
  console.log('⚠️  KERNEL_PANIC state detected in STATE.md');
  
  // --force 없으면 verify-kernel.js 실행
  if (!forceUnlock) {
    console.log('\n🔍 Running integrity check (verify-kernel.js)...\n');
    
    try {
      // verify-kernel.js 실행
      const result = execSync(`node "${VERIFY_SCRIPT}"`, {
        cwd: WORKSPACE,
        encoding: 'utf-8',
        stdio: 'inherit'
      });
      
      console.log('\n✓ Integrity check passed');
      
    } catch (error) {
      console.error('\n❌ Integrity check FAILED!');
      console.error('해시 불일치가 감지되었습니다.');
      console.error('강제 해제하려면: node tools/kernel-guard/unlock.js --force');
      console.error('(권장하지 않음 — 형님 승인 필요)\n');
      process.exit(1);
    }
  } else {
    console.log('\n⚠️  --force flag detected, skipping integrity check');
    console.log('(This is not recommended unless approved by 형님)\n');
  }
  
  // 락다운 해제
  console.log('🔓 Removing KERNEL_PANIC state...\n');
  
  // STATE.md 삭제
  if (fs.existsSync(STATE_PATH)) {
    fs.unlinkSync(STATE_PATH);
    console.log('✓ STATE.md removed');
  }
  
  // kernel-panic.json 삭제
  cleanupPanicFiles();
  
  // 완료
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Kernel integrity restored');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔓 외부 도구 사용이 다시 허용되었습니다.\n');
}

function cleanupPanicFiles() {
  if (fs.existsSync(PANIC_JSON)) {
    fs.unlinkSync(PANIC_JSON);
    console.log('✓ kernel-panic.json removed');
  }
}

try {
  main();
} catch (error) {
  console.error('❌ Unlock failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}
