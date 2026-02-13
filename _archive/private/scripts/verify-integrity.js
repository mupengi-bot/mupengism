#!/usr/bin/env node
/**
 * verify-integrity.js — 무펭이즘 핵심 파일 무결성 검증
 * 
 * checksums.json 기반으로 모든 핵심 파일의 SHA-256 해시 검증
 * - 불일치 시 어떤 파일이 변조됐는지 출력
 * - SOUL 관련 파일 변조 시 exit 1 (커널 패닉)
 * 
 * Usage:
 *   node scripts/verify-integrity.js
 * 
 * Exit 0 = 모든 파일 정상
 * Exit 1 = 변조 감지 (커널 패닉)
 */

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { createHash } from 'crypto';
import { join } from 'path';

const REPO_ROOT = process.cwd();
const CHECKSUM_FILE = join(REPO_ROOT, 'checksums.json');

// SOUL 관련 파일 (변조 시 커널 패닉 트리거)
const CRITICAL_FILES = [
  'SOUL-TEMPLATE.md',
  'PRINCIPLES.md',
  'LAWS.md',
  'DOCTRINE.md',
  'SECURITY-PRINCIPLES.md',
  'skill/SOUL-TEMPLATE.md',
  'skill/PRINCIPLES.md',
  'skill/SECURITY-PRINCIPLES.md',
];

function getFileHash(path) {
  try {
    const content = readFileSync(path, 'utf-8');
    return createHash('sha256').update(content).digest('hex');
  } catch (err) {
    return null;
  }
}

function verify() {
  // checksums.json 존재 확인
  if (!existsSync(CHECKSUM_FILE)) {
    console.error('❌ checksums.json not found. Run: node scripts/register-checksums.js');
    process.exit(1);
  }

  const record = JSON.parse(readFileSync(CHECKSUM_FILE, 'utf-8'));
  const files = record.files || {};
  
  let totalFiles = 0;
  let validFiles = 0;
  let missingFiles = 0;
  let tamperedFiles = [];
  let criticalTampered = false;

  console.log('🔍 Verifying file integrity...\n');

  // 각 파일 검증
  for (const [file, expectedHash] of Object.entries(files)) {
    totalFiles++;
    const path = join(REPO_ROOT, file);
    
    if (!existsSync(path)) {
      console.error(`❌ MISSING: ${file}`);
      missingFiles++;
      tamperedFiles.push(file);
      if (CRITICAL_FILES.includes(file)) {
        criticalTampered = true;
      }
      continue;
    }

    const currentHash = getFileHash(path);
    
    if (currentHash === expectedHash) {
      console.log(`✓ ${file}`);
      validFiles++;
    } else {
      console.error(`🚨 TAMPERED: ${file}`);
      console.error(`   Expected: ${expectedHash.slice(0, 16)}...`);
      console.error(`   Current:  ${currentHash ? currentHash.slice(0, 16) + '...' : 'UNREADABLE'}`);
      tamperedFiles.push(file);
      if (CRITICAL_FILES.includes(file)) {
        criticalTampered = true;
      }
    }
  }

  // 결과 출력
  console.log('\n' + '='.repeat(60));
  console.log(`Total files: ${totalFiles}`);
  console.log(`Valid: ${validFiles}`);
  console.log(`Missing: ${missingFiles}`);
  console.log(`Tampered: ${tamperedFiles.length - missingFiles}`);

  if (tamperedFiles.length > 0) {
    console.error('\n🚨 INTEGRITY BREACH DETECTED');
    console.error('\nTampered/Missing files:');
    tamperedFiles.forEach(f => console.error(`  - ${f}`));
    
    // 변조 기록 저장
    const logFile = join(REPO_ROOT, `memory/integrity-breach-${Date.now()}.json`);
    try {
      writeFileSync(logFile, JSON.stringify({
        timestamp: new Date().toISOString(),
        checksumVersion: record.version,
        tamperedFiles,
        criticalTampered,
      }, null, 2));
      console.error(`\n📝 Breach log saved: ${logFile}`);
    } catch {}

    if (criticalTampered) {
      console.error('\n💀 KERNEL PANIC: Critical file(s) tampered!');
      console.error('   Core identity files have been modified.');
      console.error('   System integrity compromised.\n');
      process.exit(1);
    } else {
      console.error('\n⚠️  Non-critical files tampered. Review recommended.\n');
      process.exit(1);
    }
  }

  console.log('\n✅ All files intact. Kernel integrity verified.');
  console.log(`   Checksum version: ${record.version}`);
  console.log(`   Generated: ${record.generated}\n`);
  process.exit(0);
}

verify();
