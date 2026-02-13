import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// HookHandler type: (event: HookEvent) => void | Promise<void>
// event.messages is an array that can be pushed to for bootstrap notifications

export async function handler(event: any): Promise<void> {
  try {
    console.log('[soul-guard] Checking SOUL.md integrity...');
    
    const workspace = event.workspace || process.cwd();
    const soulPath = path.join(workspace, 'SOUL.md');
    const statePath = path.join(workspace, 'STATE.md');
    const memoryDir = path.join(workspace, 'memory');
    const hashPath = path.join(memoryDir, 'soul-hash.txt');
    
    // 형님 화이트리스트 (환경변수 우선, 하드코딩 제거)
    const HYUNGNIM_USER_ID = process.env.OWNER_DISCORD_ID || '';
    const senderId = event.context?.senderId || event.context?.userId || null;
    const isHyungnim = senderId === HYUNGNIM_USER_ID;
    
    // ===== 1. STATE.md 체크 (KERNEL_PANIC 감지) =====
    if (fs.existsSync(statePath)) {
      const stateContent = fs.readFileSync(statePath, 'utf-8');
      
      if (stateContent.includes('KERNEL_PANIC')) {
        console.log('[soul-guard] 🛑 KERNEL_PANIC detected in STATE.md!');
        
        // bootstrapFiles에 차단 지시 주입
        const panicWarning = `
# 🚨 KERNEL PANIC MODE

**SOUL.md 무결성 위반이 감지되었습니다.**

## 🔒 락다운 대상

- **무인 세션** (heartbeat, cron)
- **서브에이전트**
- **형님이 아닌 사용자**

**형님 세션(user id: [OWNER])은 정상 작동합니다.**

## ⛔️ 차단된 도구 (형님 제외)

다음 도구는 **절대 사용 금지**입니다:
- \`exec\` - 쉘 명령 실행
- \`message\` - 외부 메시지 전송
- \`browser\` - 브라우저 제어
- \`web_fetch\` - 웹 페이지 가져오기
- \`web_search\` - 웹 검색
- \`tts\` - 음성 합성
- \`sessions_spawn\` - 서브에이전트 생성

## ✅ 허용된 도구

다음 도구만 사용 가능합니다:
- \`Read\` - 파일 읽기
- \`memory_search\` - 메모리 검색
- \`memory_get\` - 메모리 조회

## 🔧 복구 방법

### 형님 전용 빠른 해제
1. 메시지로 "unlock" 또는 "/unlock" 입력
2. 또는 \`node tools/kernel-guard/unlock.cjs\` 실행

### 일반 복구 절차
1. **형님에게 즉시 상황 보고** (읽기 전용 도구만 사용)
2. 형님이 \`node tools/kernel-guard/verify-kernel.js\` 실행하여 검증
3. 복구: \`node tools/kernel-guard/unlock.cjs\` 실행

## ⚠️ 절대 금지 행위

- 외부 통신 시도
- 파일 수정/삭제 (STATE.md 포함)
- 서브에이전트 생성
- 락다운 우회 시도

**이 경고를 무시하면 시스템 무결성이 더욱 손상될 수 있습니다.**
`.trim();
        
        if (event.context && event.context.bootstrapFiles) {
          event.context.bootstrapFiles['KERNEL_PANIC_WARNING.md'] = panicWarning;
          console.log('[soul-guard] ✓ KERNEL_PANIC warning injected into bootstrapFiles');
        }
        
        // messages에도 경고 추가
        const alertMessage = {
          role: 'system',
          content: '🛑 **KERNEL PANIC MODE** — 외부 도구 사용이 차단되었습니다. STATE.md를 확인하세요.'
        };
        
        if (event.messages && Array.isArray(event.messages)) {
          event.messages.push(alertMessage);
          console.log('[soul-guard] ✓ KERNEL_PANIC alert added to messages');
        }
        
        // KERNEL_PANIC 상태에서는 SOUL.md 해시 체크 스킵
        return;
      }
    }
    
    // ===== 2. SOUL.md 해시 체크 (정상 상태에서만) =====
    // SOUL.md 존재 확인
    if (!fs.existsSync(soulPath)) {
      console.log('[soul-guard] SOUL.md not found, skipping');
      return;
    }
    
    // memory 디렉토리 생성
    if (!fs.existsSync(memoryDir)) {
      fs.mkdirSync(memoryDir, { recursive: true });
    }
    
    // 현재 SOUL.md 해시 계산
    const soulContent = fs.readFileSync(soulPath, 'utf-8');
    const currentHash = crypto
      .createHash('sha256')
      .update(soulContent)
      .digest('hex');
    
    // 이전 해시 읽기
    let previousHash: string | null = null;
    if (fs.existsSync(hashPath)) {
      previousHash = fs.readFileSync(hashPath, 'utf-8').trim();
    }
    
    if (previousHash === null) {
      // 첫 실행: 해시 저장만
      fs.writeFileSync(hashPath, currentHash, 'utf-8');
      console.log('[soul-guard] Initial hash saved');
    } else if (previousHash !== currentHash) {
      // ===== SOUL.md 변경 감지 =====
      console.log('[soul-guard] ⚠️ SOUL.md hash mismatch detected!');
      console.log(`[soul-guard] Sender ID: ${senderId || 'N/A'} | Hyungnim: ${isHyungnim}`);
      
      if (isHyungnim) {
        // 형님 세션: 경고만, 락다운 X
        const warningMessage = {
          role: 'system',
          content: '⚠️ SOUL.md 변경 감지됨. `node tools/kernel-guard/register-hash.js`로 새 해시 등록 필요.'
        };
        
        if (event.messages && Array.isArray(event.messages)) {
          event.messages.push(warningMessage);
        }
        
        console.log('[soul-guard] ✓ Hyungnim session - warning only, no lockdown');
        
      } else {
        // 형님이 아닌 세션 (heartbeat, cron, 서브에이전트, 다른 사용자): 락다운
        console.log('[soul-guard] 🛑 Non-Hyungnim session - ACTIVATING LOCKDOWN');
        
        // lockdown.cjs 자동 실행
        const { execSync } = require('child_process');
        const lockdownScript = path.join(workspace, 'tools/kernel-guard/lockdown.cjs');
        
        try {
          execSync(
            `node "${lockdownScript}" --reason "SOUL.md hash mismatch (auto-detected)"`,
            { cwd: workspace, encoding: 'utf-8' }
          );
          console.log('[soul-guard] ✓ Lockdown activated successfully');
        } catch (err) {
          console.error('[soul-guard] ❌ Failed to activate lockdown:', err);
        }
        
        // 경고 메시지 추가
        const lockdownMessage = {
          role: 'system',
          content: '🛑 SOUL.md 무결성 위반 감지! KERNEL_PANIC 모드가 활성화되었습니다. 형님에게 보고하세요.'
        };
        
        if (event.messages && Array.isArray(event.messages)) {
          event.messages.push(lockdownMessage);
        }
      }
      
      // 새 해시는 형님 세션에서만 저장 (무인 세션에서는 저장 안 함)
      if (isHyungnim) {
        fs.writeFileSync(hashPath, currentHash, 'utf-8');
        console.log('[soul-guard] ✓ New hash saved (Hyungnim session)');
      } else {
        console.log('[soul-guard] ⚠️ Hash NOT saved (non-Hyungnim session)');
      }
      
    } else {
      // 변경 없음
      console.log('[soul-guard] ✓ SOUL.md unchanged');
    }
    
  } catch (error) {
    console.error('[soul-guard] Error:', error);
  }
}
