#!/usr/bin/env node
/**
 * Mupengism Secret Scanner
 * 전체 레포 스캔 도구 - CI/CD 및 수동 검사용
 * 
 * Usage:
 *   node scripts/secret-scan.js          # 전체 스캔
 *   node scripts/secret-scan.js --json   # JSON 출력
 *   node scripts/secret-scan.js --ci     # CI 모드 (발견 시 exit 1)
 */

import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';

const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

// 검사 패턴
const SECRET_PATTERNS = [
  {
    name: 'API Key',
    pattern: /api[_-]?key\s*[:=]\s*["'][^"']{16,}/gi,
    severity: 'HIGH'
  },
  {
    name: 'Secret Key',
    pattern: /secret[_-]?key\s*[:=]\s*["'][^"']{16,}/gi,
    severity: 'CRITICAL'
  },
  {
    name: 'Private Key',
    pattern: /private[_-]?key\s*[:=]\s*["'][^"']{16,}/gi,
    severity: 'CRITICAL'
  },
  {
    name: 'Access Token',
    pattern: /access[_-]?token\s*[:=]\s*["'][^"']{16,}/gi,
    severity: 'HIGH'
  },
  {
    name: 'Mnemonic Phrase',
    pattern: /mnemonic\s*[:=]\s*["'][a-z\s]{20,}/gi,
    severity: 'CRITICAL'
  },
  {
    name: 'Solana Private Key (Base58)',
    pattern: /\b[1-9A-HJ-NP-Za-km-z]{87,88}\b/g,
    severity: 'CRITICAL'
  },
  {
    name: 'Ethereum Private Key',
    pattern: /\b0x[a-fA-F0-9]{64}\b/g,
    severity: 'CRITICAL'
  },
  {
    name: 'Password',
    pattern: /password\s*[:=]\s*["'][^"']{6,}/gi,
    severity: 'HIGH'
  },
  {
    name: 'AWS Access Key',
    pattern: /AKIA[0-9A-Z]{16}/g,
    severity: 'CRITICAL'
  },
  {
    name: 'Bearer Token',
    pattern: /bearer\s+[a-zA-Z0-9_\-\.]+\.[a-zA-Z0-9_\-\.]+\.[a-zA-Z0-9_\-\.]+/gi,
    severity: 'HIGH'
  },
  {
    name: 'Generic Secret Assignment',
    pattern: /["']?secret["']?\s*[:=]\s*["'][^"']{8,}/gi,
    severity: 'MEDIUM'
  }
];

// 무시할 경로 패턴
const IGNORE_PATTERNS = [
  /node_modules/,
  /\.git/,
  /\.png$/i,
  /\.jpg$/i,
  /\.jpeg$/i,
  /\.gif$/i,
  /\.ico$/i,
  /\.svg$/i,
  /\.mp3$/i,
  /\.mp4$/i,
  /\.woff$/i,
  /\.ttf$/i,
  /\.eot$/i,
  /package-lock\.json$/,
  /yarn\.lock$/,
  /scripts\/pre-commit\.sh$/,
  /scripts\/secret-scan\.js$/
];

// 디렉토리 재귀 탐색
function walkDir(dir, results = []) {
  try {
    const files = readdirSync(dir);
    for (const file of files) {
      const filepath = join(dir, file);
      const stat = statSync(filepath);
      
      // 무시 패턴 체크
      if (IGNORE_PATTERNS.some(p => p.test(filepath))) {
        continue;
      }
      
      if (stat.isDirectory()) {
        walkDir(filepath, results);
      } else if (stat.isFile()) {
        results.push(filepath);
      }
    }
  } catch (e) {
    // 권한 없는 디렉토리 스킵
  }
  return results;
}

// 파일 스캔
function scanFile(filepath, rootDir) {
  const findings = [];
  
  try {
    const content = readFileSync(filepath, 'utf-8');
    const lines = content.split('\n');
    const relativePath = relative(rootDir, filepath);
    
    for (const secretPattern of SECRET_PATTERNS) {
      let match;
      const regex = new RegExp(secretPattern.pattern.source, secretPattern.pattern.flags);
      
      while ((match = regex.exec(content)) !== null) {
        // 줄 번호 찾기
        const beforeMatch = content.substring(0, match.index);
        const lineNumber = (beforeMatch.match(/\n/g) || []).length + 1;
        const line = lines[lineNumber - 1]?.trim() || '';
        
        // 중복 방지
        const isDuplicate = findings.some(f => 
          f.file === relativePath && 
          f.line === lineNumber && 
          f.type === secretPattern.name
        );
        
        if (!isDuplicate) {
          findings.push({
            file: relativePath,
            line: lineNumber,
            type: secretPattern.name,
            severity: secretPattern.severity,
            preview: line.length > 100 ? line.substring(0, 100) + '...' : line
          });
        }
      }
    }
  } catch (e) {
    // 바이너리 파일 등 읽기 실패 시 스킵
  }
  
  return findings;
}

// 메인 스캔 함수
function scan(rootDir) {
  const files = walkDir(rootDir);
  const allFindings = [];
  
  for (const file of files) {
    const findings = scanFile(file, rootDir);
    allFindings.push(...findings);
  }
  
  return allFindings;
}

// 결과 출력
function printResults(findings, isJson = false, isCI = false) {
  if (isJson) {
    console.log(JSON.stringify(findings, null, 2));
    return findings.length;
  }
  
  if (findings.length === 0) {
    console.log(`${GREEN}✓ No secrets detected!${RESET}`);
    console.log(`  Scanned repository for ${SECRET_PATTERNS.length} secret patterns.`);
    return 0;
  }
  
  // 심각도별 그룹화
  const critical = findings.filter(f => f.severity === 'CRITICAL');
  const high = findings.filter(f => f.severity === 'HIGH');
  const medium = findings.filter(f => f.severity === 'MEDIUM');
  
  console.log(`\n${RED}╔══════════════════════════════════════════════════════════╗${RESET}`);
  console.log(`${RED}║         🚨 SECRETS DETECTED: ${findings.length} issue(s) found          ║${RESET}`);
  console.log(`${RED}╚══════════════════════════════════════════════════════════╝${RESET}\n`);
  
  const printSection = (title, items, color) => {
    if (items.length === 0) return;
    console.log(`${color}▶ ${title} (${items.length})${RESET}\n`);
    for (const f of items) {
      console.log(`  ${YELLOW}${f.file}:${f.line}${RESET}`);
      console.log(`    Type: ${f.type}`);
      console.log(`    Preview: ${f.preview}`);
      console.log('');
    }
  };
  
  printSection('CRITICAL', critical, RED);
  printSection('HIGH', high, YELLOW);
  printSection('MEDIUM', medium, CYAN);
  
  console.log(`${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
  console.log(`${YELLOW}해결 방법:${RESET}`);
  console.log('  1. 민감 정보를 환경변수(.env)로 이동');
  console.log('  2. .gitignore에 해당 파일 추가');
  console.log('  3. git history에서 제거: git filter-branch 또는 BFG');
  console.log('');
  
  return findings.length;
}

// CLI 실행
const args = process.argv.slice(2);
const isJson = args.includes('--json');
const isCI = args.includes('--ci');
const rootDir = process.cwd();

console.log(`${CYAN}🔍 Mupengism Secret Scanner${RESET}`);
console.log(`   Scanning: ${rootDir}\n`);

const findings = scan(rootDir);
const count = printResults(findings, isJson, isCI);

// CI 모드에서는 발견 시 exit 1
if (isCI && count > 0) {
  process.exit(1);
}
