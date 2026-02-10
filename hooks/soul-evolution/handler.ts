import * as fs from 'fs';
import * as path from 'path';

interface CommandEvent {
  sessionKey: string;
  messages?: Array<{ role: string; content: string }>;
}

interface EvolutionState {
  lastAnalysis: string | null; // ISO date string
}

interface KeywordCount {
  [keyword: string]: {
    count: number;
    sources: string[];
  };
}

export async function handler(event: CommandEvent): Promise<void> {
  try {
    console.log('[soul-evolution] 🧬 자기 진화 시스템 시작');

    const workspaceDir = process.cwd();
    const memoryDir = path.join(workspaceDir, 'memory');
    const stateFile = path.join(memoryDir, 'soul-evolution-state.json');
    const proposalsFile = path.join(memoryDir, 'soul-evolution-proposals.md');

    // memory 디렉토리 확인
    if (!fs.existsSync(memoryDir)) {
      fs.mkdirSync(memoryDir, { recursive: true });
    }

    // 상태 파일 읽기
    let state: EvolutionState = { lastAnalysis: null };
    if (fs.existsSync(stateFile)) {
      try {
        const stateContent = fs.readFileSync(stateFile, 'utf-8');
        state = JSON.parse(stateContent);
      } catch (err) {
        console.error('[soul-evolution] 상태 파일 파싱 실패, 새로 시작');
      }
    }

    // 마지막 분석 후 7일 경과 체크
    const now = new Date();
    if (state.lastAnalysis) {
      const lastDate = new Date(state.lastAnalysis);
      const daysSince = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSince < 7) {
        console.log(`[soul-evolution] 마지막 분석 후 ${daysSince.toFixed(1)}일 경과 - 스킵 (7일 미만)`);
        return;
      }
    }

    console.log('[soul-evolution] 7일 경과 또는 첫 실행 - 분석 시작');

    // 분석 대상 파일 목록
    const targetFiles = [
      path.join(memoryDir, 'brake-log.md'),
      path.join(memoryDir, 'consolidated', 'growth.md')
    ];

    // dreams/*.md 파일 추가
    const dreamsDir = path.join(memoryDir, 'dreams');
    if (fs.existsSync(dreamsDir)) {
      const dreamFiles = fs.readdirSync(dreamsDir)
        .filter(f => f.endsWith('.md'))
        .map(f => path.join(dreamsDir, f));
      targetFiles.push(...dreamFiles);
    }

    // 키워드 카운팅
    const keywords: KeywordCount = {};
    let totalFilesRead = 0;

    for (const filePath of targetFiles) {
      if (!fs.existsSync(filePath)) {
        continue;
      }

      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const fileName = path.basename(filePath);
        
        // 간단한 키워드 추출: 3글자 이상 단어, 소문자 변환
        const words = content
          .toLowerCase()
          .replace(/[^\w\sㄱ-ㅎ가-힣]/g, ' ')
          .split(/\s+/)
          .filter(w => w.length >= 3);

        // 불용어 제외 (선택적)
        const stopWords = new Set(['the', 'and', 'for', 'with', 'this', 'that', 'from', 'have', 'been']);

        for (const word of words) {
          if (stopWords.has(word)) continue;

          if (!keywords[word]) {
            keywords[word] = { count: 0, sources: [] };
          }
          keywords[word].count++;
          if (!keywords[word].sources.includes(fileName)) {
            keywords[word].sources.push(fileName);
          }
        }

        totalFilesRead++;
      } catch (err) {
        console.error(`[soul-evolution] 파일 읽기 실패: ${filePath}`, err);
      }
    }

    console.log(`[soul-evolution] ${totalFilesRead}개 파일 분석 완료`);

    // 3회 이상 등장한 키워드 필터링
    const candidates = Object.entries(keywords)
      .filter(([_, data]) => data.count >= 3)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10); // 상위 10개만

    if (candidates.length === 0) {
      console.log('[soul-evolution] 반복 패턴 없음 - 제안 없음');
      
      // 상태 업데이트
      state.lastAnalysis = now.toISOString();
      fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
      return;
    }

    // 제안 문서 생성
    const today = now.toISOString().split('T')[0];
    let proposalsContent = `# 🧬 SOUL.md 진화 제안 (${today})\n\n`;
    proposalsContent += `## 후보 원칙\n\n`;

    candidates.forEach(([keyword, data], idx) => {
      proposalsContent += `${idx + 1}. **"${keyword}" 패턴 발견** (${data.count}회 등장)\n`;
      proposalsContent += `   - 출처: ${data.sources.join(', ')}\n`;
      proposalsContent += `   - 제안: SOUL.md 원칙 후보로 검토\n\n`;
    });

    proposalsContent += `## 승인 대기\n\n`;
    proposalsContent += `형님 승인 시에만 SOUL.md 수정.\n`;

    fs.writeFileSync(proposalsFile, proposalsContent);
    console.log(`[soul-evolution] ✅ 제안 파일 생성: ${proposalsFile}`);

    // 상태 업데이트
    state.lastAnalysis = now.toISOString();
    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));

    // 이벤트 메시지 추가
    if (event.messages) {
      event.messages.push({
        role: 'system',
        content: `🧬 SOUL.md 진화 제안 ${candidates.length}건 — memory/soul-evolution-proposals.md 확인`
      });
    }

    console.log(`[soul-evolution] 🎉 완료: ${candidates.length}개 원칙 후보 제안`);

  } catch (error) {
    console.error('[soul-evolution] ⚠️ 에러 발생:', error);
  }
}
