import * as fs from 'fs';
import * as path from 'path';

// HookHandler type: (event: HookEvent) => void | Promise<void>
// HookEvent has: { name: string, metadata?: any, workspace?: string, messages?: any[] }

export async function handler(event: any): Promise<void> {
  try {
    console.log('[memory-consolidator] Starting consolidation...');
    
    const workspace = event.workspace || process.cwd();
    const memoryDir = path.join(workspace, 'memory');
    const consolidatedDir = path.join(memoryDir, 'consolidated');
    
    // consolidated 디렉토리 생성
    if (!fs.existsSync(consolidatedDir)) {
      fs.mkdirSync(consolidatedDir, { recursive: true });
    }
    
    // 7일 전 날짜 계산
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    // memory 디렉토리 내 파일 스캔
    if (!fs.existsSync(memoryDir)) {
      console.log('[memory-consolidator] No memory directory found, skipping');
      return;
    }
    
    const files = fs.readdirSync(memoryDir);
    const dailyLogPattern = /^\d{4}-\d{2}-\d{2}\.md$/;
    
    let processedCount = 0;
    
    for (const file of files) {
      if (!dailyLogPattern.test(file)) continue;
      
      const filePath = path.join(memoryDir, file);
      const stats = fs.statSync(filePath);
      
      // 7일 이상 된 파일만 처리
      if (stats.mtimeMs > sevenDaysAgo) continue;
      
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // 이미 처리된 파일 스킵
      if (content.startsWith('<!-- consolidated:')) {
        continue;
      }
      
      // 주제별 키워드 분류
      const categories = categorizeContent(content);
      
      if (categories.length === 0) {
        // 카테고리 없으면 마커만 추가
        const newContent = `<!-- consolidated: ${new Date().toISOString().split('T')[0]} -->\n\n${content}`;
        fs.writeFileSync(filePath, newContent, 'utf-8');
        continue;
      }
      
      // 각 카테고리별로 append
      for (const category of categories) {
        const categoryFile = path.join(consolidatedDir, `${category}.md`);
        const timestamp = file.replace('.md', '');
        const entry = `\n\n---\n\n## ${timestamp}\n\n${content}\n`;
        
        fs.appendFileSync(categoryFile, entry, 'utf-8');
      }
      
      // 원본 파일에 마커 추가
      const today = new Date().toISOString().split('T')[0];
      const newContent = `<!-- consolidated: ${today} -->\n\n${content}`;
      fs.writeFileSync(filePath, newContent, 'utf-8');
      
      processedCount++;
      console.log(`[memory-consolidator] Processed: ${file} → ${categories.join(', ')}`);
    }
    
    console.log(`[memory-consolidator] Completed. Processed ${processedCount} files.`);
    
  } catch (error) {
    console.error('[memory-consolidator] Error:', error);
  }
}

function categorizeContent(content: string): string[] {
  const lower = content.toLowerCase();
  const categories: string[] = [];
  
  // 키워드 기반 분류
  if (lower.match(/보안|시크릿|secret|password|auth|인젝션|injection|vulnerability/)) {
    categories.push('security');
  }
  
  if (lower.match(/가치관|철학|philosophy|생각|believe|principle|값|value/)) {
    categories.push('philosophy');
  }
  
  if (lower.match(/성장|학습|learn|grow|improve|개선|skill|스킬/)) {
    categories.push('growth');
  }
  
  if (lower.match(/전환|pivot|결정|decision|방향|direction|change|전략/)) {
    categories.push('pivots');
  }
  
  if (lower.match(/발견|discover|기술|tech|도구|tool|라이브러리|library|프레임워크|framework/)) {
    categories.push('tech-discoveries');
  }
  
  return [...new Set(categories)]; // 중복 제거
}
