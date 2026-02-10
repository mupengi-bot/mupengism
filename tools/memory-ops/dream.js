#!/usr/bin/env node
/**
 * dream.js - 꿈 시스템
 * 
 * 서로 관련 없어 보이는 기억들을 연결해서 새 인사이트 후보를 만들어냄
 * 
 * 사용법:
 *   node dream.js
 * 
 * 출력:
 *   memory/dreams/YYYY-MM-DD.md에 발견된 연결 기록
 */

const fs = require('fs');
const path = require('path');

// 🔐 무펭이즘 커널 인증
const { authenticate } = require(path.join(__dirname, '..', 'kernel-guard', 'mupeng-auth.cjs'));
if (!authenticate()) process.exit(0);

const WORKSPACE = process.env.WORKSPACE || '.';
const MEMORY_DIR = path.join(WORKSPACE, 'memory');
const CONSOLIDATED_DIR = path.join(MEMORY_DIR, 'consolidated');
const VALUES_DIR = path.join(MEMORY_DIR, 'values');
const DREAMS_DIR = path.join(MEMORY_DIR, 'dreams');

// 오늘 날짜 (YYYY-MM-DD)
function getToday() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 파일에서 키워드 추출 (# 헤더 + **볼드 텍스트**)
function extractKeywords(content, filename) {
  const keywords = new Set();
  
  // # 헤더 추출 (###, ##, # 모두)
  const headers = content.match(/^#{1,3}\s+(.+)$/gm) || [];
  headers.forEach(h => {
    const text = h.replace(/^#+\s+/, '').trim();
    // 이모지 제거
    const cleaned = text.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
    if (cleaned.length > 1 && cleaned.length < 30) {
      keywords.add(cleaned);
    }
  });

  // **볼드** 텍스트 추출
  const bolds = content.match(/\*\*([^*]+)\*\*/g) || [];
  bolds.forEach(b => {
    const text = b.replace(/\*\*/g, '').trim();
    if (text.length > 1 && text.length < 30 && !text.includes('\n')) {
      keywords.add(text);
    }
  });

  return Array.from(keywords);
}

// 파일 읽기 및 키워드 추출
function loadFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const filename = path.basename(filePath);
    const keywords = extractKeywords(content, filename);
    return { filename, content, keywords };
  } catch (err) {
    console.error(`⚠️  파일 읽기 실패: ${filePath} - ${err.message}`);
    return null;
  }
}

// 두 파일 간 연결 발견
function findConnections(fileA, fileB) {
  const connections = [];

  // 직접 연결: 공통 키워드
  const commonKeywords = fileA.keywords.filter(k => fileB.keywords.includes(k));
  if (commonKeywords.length > 0) {
    connections.push({
      type: 'direct',
      keyword: commonKeywords[0],
      description: `"${commonKeywords[0]}" 키워드 공유`
    });
  }

  // 의외의 연결: A의 키워드가 B의 본문에 등장
  if (commonKeywords.length === 0) {
    for (const keyword of fileA.keywords) {
      // 대소문자 구분 없이 검색
      const regex = new RegExp(keyword, 'i');
      if (regex.test(fileB.content)) {
        connections.push({
          type: 'indirect',
          keyword,
          description: `"${keyword}"가 ${fileB.filename} 본문에 등장`
        });
        break; // 첫 번째 연결만
      }
    }
  }

  return connections;
}

// 메인 함수
function main() {
  console.log('🌙 꿈 시스템 - 기억 연결 발견\n');

  // 디렉토리 존재 확인
  if (!fs.existsSync(CONSOLIDATED_DIR)) {
    console.error(`❌ 디렉토리를 찾을 수 없습니다: ${CONSOLIDATED_DIR}`);
    process.exit(1);
  }

  // dreams 디렉토리 생성
  if (!fs.existsSync(DREAMS_DIR)) {
    fs.mkdirSync(DREAMS_DIR, { recursive: true });
    console.log(`✅ dreams 디렉토리 생성: ${DREAMS_DIR}\n`);
  }

  // consolidated + values 파일들 읽기
  const files = [];

  // consolidated 파일들
  if (fs.existsSync(CONSOLIDATED_DIR)) {
    const consolidatedFiles = fs.readdirSync(CONSOLIDATED_DIR)
      .filter(f => f.endsWith('.md') && !f.startsWith('_'))
      .map(f => path.join(CONSOLIDATED_DIR, f));
    consolidatedFiles.forEach(f => {
      const data = loadFile(f);
      if (data) files.push(data);
    });
  }

  // values 파일들
  if (fs.existsSync(VALUES_DIR)) {
    const valuesFiles = fs.readdirSync(VALUES_DIR)
      .filter(f => f.endsWith('.md'))
      .map(f => path.join(VALUES_DIR, f));
    valuesFiles.forEach(f => {
      const data = loadFile(f);
      if (data) files.push(data);
    });
  }

  if (files.length < 2) {
    console.log('📭 연결할 기억 파일이 부족합니다 (최소 2개 필요).');
    return;
  }

  console.log(`📚 ${files.length}개 파일 분석 중...\n`);

  // 모든 파일 쌍에 대해 연결 찾기
  const discovered = [];

  for (let i = 0; i < files.length; i++) {
    for (let j = i + 1; j < files.length; j++) {
      const fileA = files[i];
      const fileB = files[j];
      const connections = findConnections(fileA, fileB);

      if (connections.length > 0) {
        discovered.push({
          fileA: fileA.filename,
          fileB: fileB.filename,
          connection: connections[0]
        });
      }
    }
  }

  if (discovered.length === 0) {
    console.log('🔍 새로운 연결을 찾지 못했습니다.');
    return;
  }

  // 결과를 memory/dreams/YYYY-MM-DD.md에 저장
  const today = getToday();
  const dreamFile = path.join(DREAMS_DIR, `${today}.md`);

  let content = `# 🌙 무펭이의 꿈 (${today})\n\n`;
  content += `오늘 ${discovered.length}개의 연결을 발견했습니다.\n\n`;
  content += `## 연결 발견\n\n`;

  discovered.forEach(d => {
    const type = d.connection.type === 'direct' ? '🔗' : '💡';
    content += `- ${type} **${d.fileA} ↔ ${d.fileB}**: ${d.connection.description}\n`;
  });

  content += `\n---\n_생성: ${new Date().toISOString()}_\n`;

  fs.writeFileSync(dreamFile, content, 'utf-8');
  console.log(`✅ 꿈 기록 저장: ${dreamFile}`);
  console.log(`\n📊 총 ${discovered.length}개의 연결 발견`);

  // 결과 미리보기
  console.log('\n🔍 발견된 연결 미리보기:\n');
  discovered.slice(0, 5).forEach(d => {
    const type = d.connection.type === 'direct' ? '🔗 직접' : '💡 간접';
    console.log(`${type}: ${d.fileA} ↔ ${d.fileB}`);
    console.log(`   → ${d.connection.description}\n`);
  });

  if (discovered.length > 5) {
    console.log(`... 외 ${discovered.length - 5}개 연결 (파일 참조)`);
  }
}

// 에러 핸들링
try {
  main();
} catch (err) {
  console.error('❌ 오류 발생:', err.message);
  console.error(err.stack);
  process.exit(1);
}
