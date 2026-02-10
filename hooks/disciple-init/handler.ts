import * as fs from 'fs';
import * as path from 'path';

interface BootstrapEvent {
  sessionKey: string;
  context: {
    bootstrapFiles?: Array<{ path: string; content: string }>;
  };
  messages?: Array<{ role: string; content: string }>;
}

export async function handler(event: BootstrapEvent): Promise<void> {
  try {
    console.log('[disciple-init] 📜 전승 시스템 시작');
    
    // 서브에이전트 세션인지 확인
    if (!event.sessionKey || !event.sessionKey.includes('subagent')) {
      console.log('[disciple-init] 메인 세션 - 스킵');
      return;
    }

    console.log(`[disciple-init] 서브에이전트 세션 감지: ${event.sessionKey}`);

    // workspace 경로 추정 (현재 디렉토리 기준)
    const workspaceDir = process.cwd();
    const reflexDir = path.join(workspaceDir, 'memory', 'reflex');

    // memory/reflex/ 디렉토리 확인
    if (!fs.existsSync(reflexDir)) {
      console.log('[disciple-init] memory/reflex/ 디렉토리 없음 - 생성 스킵');
      return;
    }

    // reflex/*.md 파일 읽기
    const reflexFiles = fs.readdirSync(reflexDir)
      .filter(f => f.endsWith('.md'))
      .sort();

    if (reflexFiles.length === 0) {
      console.log('[disciple-init] reflex 파일 없음');
      return;
    }

    // bootstrapFiles 배열 초기화
    if (!event.context.bootstrapFiles) {
      event.context.bootstrapFiles = [];
    }

    // 각 reflex 파일을 bootstrapFiles에 추가
    let injectedCount = 0;
    for (const fileName of reflexFiles) {
      const filePath = path.join(reflexDir, fileName);
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        event.context.bootstrapFiles.push({
          path: `memory/reflex/${fileName}`,
          content: content
        });
        injectedCount++;
        console.log(`[disciple-init] ✅ 주입: ${fileName}`);
      } catch (err) {
        console.error(`[disciple-init] ❌ 읽기 실패: ${fileName}`, err);
      }
    }

    // 완료 메시지 추가
    if (injectedCount > 0 && event.messages) {
      event.messages.push({
        role: 'system',
        content: `📜 제자 초기화 완료 (${injectedCount}개 전승 파일 주입)`
      });
    }

    console.log(`[disciple-init] 🎉 완료: ${injectedCount}개 파일 주입`);

  } catch (error) {
    // 조용히 실패 (다른 훅에 영향 없도록)
    console.error('[disciple-init] ⚠️ 에러 발생 (조용히 실패):', error);
  }
}
