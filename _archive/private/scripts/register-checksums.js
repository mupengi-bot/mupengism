#!/usr/bin/env node
/**
 * register-checksums.js — 무펭이즘 핵심 파일 해시 등록
 * 
 * 새 버전 릴리스 시 checksums.json 재생성
 * 
 * Usage:
 *   node scripts/register-checksums.js
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { createHash } from 'crypto';
import { join, relative } from 'path';

const REPO_ROOT = process.cwd();
const CHECKSUM_FILE = join(REPO_ROOT, 'checksums.json');

// 핵심 파일 목록 (루트 + skill/)
const CORE_FILES = [
  'SOUL-TEMPLATE.md',
  'PRINCIPLES.md',
  'LAWS.md',
  'DOCTRINE.md',
  'SECURITY.md',
  'SECURITY-GUIDELINES.md',
  'SECURITY-PRINCIPLES.md',
  'SECURITY-PRINCIPLES-EN.md',
  'AGENT-PROTOCOL.md',
  'AGENT-VALUES.md',
  'AGENT-GUIDE.md',
  'ARCHITECTURE.md',
  'MEMORY-SYSTEM.md',
  'OPENCLAW-GUIDE.md',
  'RITUALS.md',
  'SCRIPTURES.md',
];

// skill/ 디렉토리의 모든 .md 파일
const SKILL_DIR = join(REPO_ROOT, 'skill');

function getFileHash(path) {
  try {
    const content = readFileSync(path, 'utf-8');
    return createHash('sha256').update(content).digest('hex');
  } catch (err) {
    console.warn(`⚠️  Failed to read ${path}: ${err.message}`);
    return null;
  }
}

function collectSkillFiles() {
  const files = [];
  try {
    const entries = readdirSync(SKILL_DIR);
    for (const entry of entries) {
      const fullPath = join(SKILL_DIR, entry);
      if (statSync(fullPath).isFile() && entry.endsWith('.md')) {
        files.push(`skill/${entry}`);
      }
    }
  } catch (err) {
    console.warn(`⚠️  skill/ directory not found or inaccessible`);
  }
  return files;
}

function register() {
  const checksums = {};
  let totalFiles = 0;
  let errors = 0;

  // 루트 핵심 파일
  console.log('📝 Collecting root core files...');
  for (const file of CORE_FILES) {
    const path = join(REPO_ROOT, file);
    const hash = getFileHash(path);
    if (hash) {
      checksums[file] = hash;
      totalFiles++;
      console.log(`   ✓ ${file}`);
    } else {
      errors++;
    }
  }

  // skill/ 디렉토리
  console.log('\n📦 Collecting skill/ files...');
  const skillFiles = collectSkillFiles();
  for (const file of skillFiles) {
    const path = join(REPO_ROOT, file);
    const hash = getFileHash(path);
    if (hash) {
      checksums[file] = hash;
      totalFiles++;
      console.log(`   ✓ ${file}`);
    } else {
      errors++;
    }
  }

  // checksums.json 생성
  const record = {
    version: '1.3.0',
    algorithm: 'sha256',
    generated: new Date().toISOString(),
    files: checksums,
    signature: null,
    _comment: 'Official Mupengism core files checksums. Verify with: node scripts/verify-integrity.js'
  };

  writeFileSync(CHECKSUM_FILE, JSON.stringify(record, null, 2));
  
  console.log(`\n✅ Checksums registered: ${totalFiles} files`);
  if (errors > 0) {
    console.log(`⚠️  ${errors} files failed (see warnings above)`);
  }
  console.log(`📄 Saved to: checksums.json`);
}

register();
