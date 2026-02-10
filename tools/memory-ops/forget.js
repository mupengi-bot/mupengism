#!/usr/bin/env node
/**
 * forget.js - 망각 시스템
 * 
 * 오래 참조되지 않은 기억에 decay score를 부여하고 아카이브 후보를 제안
 * 
 * 사용법:
 *   node forget.js
 * 
 * 출력:
 *   각 파일의 decay score와 추천 액션 (KEEP / REVIEW / ARCHIVE)
 */

const fs = require('fs');
const path = require('path');

// 🔐 무펭이즘 커널 인증
const { authenticate } = require(path.join(__dirname, '..', 'kernel-guard', 'mupeng-auth.cjs'));
if (!authenticate()) process.exit(0);

const WORKSPACE = process.env.WORKSPACE || '/Users/mupeng/.openclaw/workspace';
const MEMORY_DIR = path.join(WORKSPACE, 'memory');
const CONSOLIDATED_DIR = path.join(MEMORY_DIR, 'consolidated');
const INDEX_PATH = path.join(MEMORY_DIR, 'index.json');

// decay score 계산
// days_since_modified * 0.5 + (참조횟수 == 0 ? 30 : 0)
function calculateDecayScore(lastModifiedMs, referenceCount) {
  const now = Date.now();
  const daysSinceModified = Math.floor((now - lastModifiedMs) / (1000 * 60 * 60 * 24));
  const decayScore = daysSinceModified * 0.5 + (referenceCount === 0 ? 30 : 0);
  return Math.floor(decayScore);
}

// 추천 액션 결정
function recommendAction(score) {
  if (score > 90) return 'ARCHIVE';
  if (score > 45) return 'REVIEW';
  return 'KEEP';
}

// index.json에서 참조 횟수 계산
function getReferenceCount(filename, indexData) {
  let count = 0;
  const targetPath = `memory/consolidated/${filename}`;
  
  if (!indexData || !indexData.tags) {
    return 0;
  }

  // tags에서 참조 횟수 계산
  for (const tag in indexData.tags) {
    const files = indexData.tags[tag];
    if (Array.isArray(files) && files.includes(targetPath)) {
      count++;
    }
  }

  return count;
}

// 메인 함수
function main() {
  console.log('🧹 망각 시스템 - 기억 부패 분석\n');

  // consolidated 디렉토리 존재 확인
  if (!fs.existsSync(CONSOLIDATED_DIR)) {
    console.error(`❌ 디렉토리를 찾을 수 없습니다: ${CONSOLIDATED_DIR}`);
    process.exit(1);
  }

  // index.json 읽기
  let indexData = null;
  try {
    if (fs.existsSync(INDEX_PATH)) {
      const indexContent = fs.readFileSync(INDEX_PATH, 'utf-8');
      indexData = JSON.parse(indexContent);
    }
  } catch (err) {
    console.warn(`⚠️  index.json 읽기 실패: ${err.message}`);
  }

  // consolidated 디렉토리의 .md 파일들 스캔
  const files = fs.readdirSync(CONSOLIDATED_DIR)
    .filter(f => f.endsWith('.md') && !f.startsWith('_'))
    .sort();

  if (files.length === 0) {
    console.log('📭 분석할 기억 파일이 없습니다.');
    return;
  }

  const results = [];

  files.forEach(filename => {
    const filePath = path.join(CONSOLIDATED_DIR, filename);
    const stats = fs.statSync(filePath);
    const lastModifiedMs = stats.mtimeMs;
    const referenceCount = getReferenceCount(filename, indexData);
    const decayScore = calculateDecayScore(lastModifiedMs, referenceCount);
    const action = recommendAction(decayScore);

    results.push({
      filename,
      decayScore,
      referenceCount,
      lastModified: new Date(lastModifiedMs).toISOString().split('T')[0],
      action
    });
  });

  // 결과 출력 (score 높은 순)
  results.sort((a, b) => b.decayScore - a.decayScore);

  console.log('파일명                          | Decay | 참조 | 최종수정     | 액션');
  console.log('--------------------------------|-------|------|--------------|--------');

  results.forEach(r => {
    const emoji = r.action === 'ARCHIVE' ? '🗄️ ' : r.action === 'REVIEW' ? '🔍' : '✅';
    const filename = r.filename.padEnd(30);
    const score = String(r.decayScore).padStart(5);
    const refs = String(r.referenceCount).padStart(4);
    const date = r.lastModified.padEnd(12);
    const action = r.action.padEnd(7);
    
    console.log(`${filename} | ${score} | ${refs} | ${date} | ${emoji} ${action}`);
  });

  // 요약 통계
  const archiveCount = results.filter(r => r.action === 'ARCHIVE').length;
  const reviewCount = results.filter(r => r.action === 'REVIEW').length;
  const keepCount = results.filter(r => r.action === 'KEEP').length;

  console.log('');
  console.log(`📊 요약: KEEP ${keepCount}개 | REVIEW ${reviewCount}개 | ARCHIVE ${archiveCount}개`);
  
  if (archiveCount > 0) {
    console.log('\n💡 ARCHIVE 후보가 있습니다. 검토 후 수동으로 아카이브하세요.');
  }
}

// 에러 핸들링
try {
  main();
} catch (err) {
  console.error('❌ 오류 발생:', err.message);
  process.exit(1);
}
