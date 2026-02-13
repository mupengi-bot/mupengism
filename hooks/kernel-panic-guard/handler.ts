import * as fs from 'fs';
import * as path from 'path';

/**
 * Kernel Panic Guard Hook
 * 
 * STATE.md에 KERNEL_PANIC이 감지되면 bootstrapFiles에 긴급 경고를 주입하여
 * 에이전트가 외부 도구 사용을 자제하도록 강제합니다.
 */

export async function handler(event: any): Promise<void> {
  try {
    console.log('[kernel-panic-guard] Checking for KERNEL_PANIC state...');
    
    const workspace = event.workspace || process.cwd();
    const statePath = path.join(workspace, 'STATE.md');
    
    // 형님 화이트리스트 (환경변수 우선, 하드코딩 제거)
    const HYUNGNIM_USER_ID = process.env.OWNER_DISCORD_ID || '';
    const senderId = event.context?.senderId || event.context?.userId || null;
    const isHyungnim = senderId === HYUNGNIM_USER_ID;
    
    // STATE.md 존재 확인
    if (!fs.existsSync(statePath)) {
      console.log('[kernel-panic-guard] STATE.md not found, skipping');
      return;
    }
    
    // STATE.md 읽기
    const stateContent = fs.readFileSync(statePath, 'utf-8');
    
    // KERNEL_PANIC 체크
    if (!stateContent.includes('KERNEL_PANIC')) {
      console.log('[kernel-panic-guard] ✓ No KERNEL_PANIC detected');
      return;
    }
    
    // ⚠️ KERNEL_PANIC 감지됨!
    console.log('[kernel-panic-guard] 🛑 KERNEL_PANIC DETECTED!');
    console.log(`[kernel-panic-guard] Sender ID: ${senderId || 'N/A'} | Hyungnim: ${isHyungnim}`);
    
    // 형님 세션이면 락다운 무시
    if (isHyungnim) {
      console.log('[kernel-panic-guard] ✓ Hyungnim session - lockdown bypassed');
      
      // 형님에게는 간단한 알림만
      const hyungnimAlert = {
        role: 'system',
        content: 'ℹ️ KERNEL_PANIC 상태 감지됨 (형님 세션은 정상 작동). `node tools/kernel-guard/unlock.cjs`로 해제 가능.'
      };
      
      if (event.messages && Array.isArray(event.messages)) {
        event.messages.push(hyungnimAlert);
      }
      
      return;
    }
    
    // 형님이 아닌 세션: 락다운 적용
    console.log('[kernel-panic-guard] 🔒 Non-Hyungnim session - injecting lockdown instructions...');
    
    const lockdownWarning = `
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
    
    // bootstrapFiles에 주입 (에이전트가 세션 시작 시 읽음)
    if (event.context && event.context.bootstrapFiles) {
      event.context.bootstrapFiles['KERNEL_PANIC_WARNING.md'] = lockdownWarning;
      console.log('[kernel-panic-guard] ✓ Lockdown warning injected into bootstrapFiles');
    }
    
    // messages에도 경고 추가 (즉시 표시)
    const alertMessage = {
      role: 'system',
      content: '🛑 **KERNEL PANIC MODE** — 외부 도구 사용이 차단되었습니다. STATE.md를 확인하세요.'
    };
    
    if (event.messages && Array.isArray(event.messages)) {
      event.messages.push(alertMessage);
      console.log('[kernel-panic-guard] ✓ Alert message added');
    }
    
    // memory/kernel-panic.json 로드 (lockdown.js가 생성)
    const memoryDir = path.join(workspace, 'memory');
    const panicJsonPath = path.join(memoryDir, 'kernel-panic.json');
    
    if (fs.existsSync(panicJsonPath)) {
      try {
        const panicData = JSON.parse(fs.readFileSync(panicJsonPath, 'utf-8'));
        console.log('[kernel-panic-guard] Lockdown details:', panicData);
      } catch (err) {
        console.error('[kernel-panic-guard] Failed to parse kernel-panic.json:', err);
      }
    }
    
  } catch (error) {
    console.error('[kernel-panic-guard] Error:', error);
  }
}
