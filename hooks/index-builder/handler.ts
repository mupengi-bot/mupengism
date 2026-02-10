import * as fs from 'fs';
import * as path from 'path';

// HookHandler type: (event: HookEvent) => void | Promise<void>

export async function handler(event: any): Promise<void> {
  try {
    console.log('[index-builder] Building memory index...');
    
    const workspace = event.workspace || process.cwd();
    const memoryDir = path.join(workspace, 'memory');
    const indexPath = path.join(memoryDir, 'index.json');
    
    if (!fs.existsSync(memoryDir)) {
      console.log('[index-builder] No memory directory found, skipping');
      return;
    }
    
    const index: any = {
      lastUpdated: new Date().toISOString(),
      files: {},
      tags: {}
    };
    
    // memory 디렉토리 재귀 스캔
    scanDirectory(memoryDir, memoryDir, index);
    
    // index.json 저장
    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf-8');
    
    const fileCount = Object.keys(index.files).length;
    const tagCount = Object.keys(index.tags).length;
    console.log(`[index-builder] Index built: ${fileCount} files, ${tagCount} tags`);
    
  } catch (error) {
    console.error('[index-builder] Error:', error);
  }
}

function scanDirectory(dir: string, baseDir: string, index: any): void {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // 재귀적으로 스캔
      scanDirectory(fullPath, baseDir, index);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      // index.json 자체는 스킵
      if (entry.name === 'index.json') continue;
      
      processFile(fullPath, baseDir, index);
    }
  }
}

function processFile(filePath: string, baseDir: string, index: any): void {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const stats = fs.statSync(filePath);
    const lines = content.split('\n').length;
    
    // 상대 경로 생성 (memory/ 기준)
    const relativePath = path.relative(path.dirname(baseDir), filePath);
    
    // 태그 추출
    const tags = extractTags(content);
    
    // files 인덱스에 추가
    index.files[relativePath] = {
      tags,
      lastModified: stats.mtime.toISOString(),
      lines
    };
    
    // tags 인덱스에 추가
    for (const tag of tags) {
      if (!index.tags[tag]) {
        index.tags[tag] = [];
      }
      if (!index.tags[tag].includes(relativePath)) {
        index.tags[tag].push(relativePath);
      }
    }
    
  } catch (error) {
    console.error(`[index-builder] Error processing ${filePath}:`, error);
  }
}

function extractTags(content: string): string[] {
  const tags: Set<string> = new Set();
  
  // <!-- [태그] --> 형식 추출
  const markerPattern = /<!--\s*\[([^\]]+)\]\s*-->/g;
  let match;
  while ((match = markerPattern.exec(content)) !== null) {
    tags.add(match[1].trim());
  }
  
  // # 헤더에서 키워드 추출 (한글/영어 단어)
  const headerPattern = /^#+\s+(.+)$/gm;
  while ((match = headerPattern.exec(content)) !== null) {
    const header = match[1].trim();
    // 짧은 의미있는 헤더만 태그로 추가 (3-20자)
    if (header.length >= 3 && header.length <= 20) {
      tags.add(header);
    }
  }
  
  // 자주 나오는 키워드 추출 (간단한 휴리스틱)
  const keywords = [
    '보안', 'security', '시크릿', 'secret',
    '가치관', 'philosophy', '철학',
    '성장', 'growth', '학습', 'learning',
    '전환', 'pivot', '결정', 'decision',
    '기술', 'tech', '발견', 'discovery',
    '형님', 'MUFI', '포토부스', 'photobooth',
    '인스타', 'instagram', '봇', 'bot',
    'AI', 'LLM', 'GPT', 'Claude'
  ];
  
  const lower = content.toLowerCase();
  for (const keyword of keywords) {
    if (lower.includes(keyword.toLowerCase())) {
      tags.add(keyword);
    }
  }
  
  return Array.from(tags);
}
