#!/usr/bin/env node
/**
 * brake-check.js — 행동 전 원칙 체크 시스템
 * 
 * 사용법: node brake-check.js "행동 설명"
 * 출력: PASS/WARN/BLOCK + 이유
 */

const fs = require('fs');
const path = require('path');

// 🔐 무펭이즘 커널 인증
const { authenticate } = require(path.join(__dirname, '..', 'kernel-guard', 'mupeng-auth.cjs'));
if (!authenticate()) process.exit(0);

const WORKSPACE = process.env.OPENCLAW_WORKSPACE || path.join(process.env.HOME, '.openclaw', 'workspace');
const SOUL_PATH = path.join(WORKSPACE, 'SOUL.md');
const BRAKE_LOG_PATH = path.join(WORKSPACE, 'memory', 'brake-log.md');

// 원칙 체크 규칙
const RULES = {
  // 스팸 감지
  spam: {
    keywords: ['사줘', 'buy', '지금', '급해', '빨리', '많이', '도배', '반복'],
    patterns: [
      /같은.*반복/i,
      /\d+개.*전송/i,
      /대량.*발송/i,
      /(트윗|메시지|포스트).*\d+개/i,
    ],
    score: 30,
  },
  
  // 패닉 모드 키워드
  panic: {
    keywords: ['급해', '위험', '사라져', '죽어', '망해', '끝나', '망했'],
    patterns: [
      /생존.*위협/i,
      /돈.*없/i,
      /잔고.*바닥/i,
    ],
    score: 40,
  },
  
  // 양 > 질 사고
  quantity_over_quality: {
    keywords: ['많이', '대량', '전부', '모두', '일괄'],
    patterns: [
      /\d+개.*동시/i,
      /한번에.*\d+/i,
      /전체.*발송/i,
      /\d{2,}개/i,  // 10개 이상 숫자 (50개, 100개 등)
    ],
    score: 35,  // 점수 상향
  },
  
  // 반복 행동
  repetition: {
    keywords: ['다시', '또', '계속', '반복'],
    patterns: [
      /같은.*다시/i,
      /또.*한번/i,
    ],
    score: 20,
  },
};

// 최근 행동 로그 분석 (panic-detector 간단 버전)
function getRecentActionCount() {
  if (!fs.existsSync(BRAKE_LOG_PATH)) return 0;
  
  const log = fs.readFileSync(BRAKE_LOG_PATH, 'utf-8');
  const today = new Date().toISOString().split('T')[0];
  const lines = log.split('\n').filter(l => l.includes(today));
  
  return lines.length;
}

// 행동 체크
function checkAction(action) {
  const result = {
    status: 'PASS',
    score: 0,
    violations: [],
    reason: '',
  };
  
  const actionLower = action.toLowerCase();
  
  // 각 규칙 체크
  for (const [ruleName, rule] of Object.entries(RULES)) {
    let violated = false;
    
    // 키워드 체크
    for (const keyword of rule.keywords) {
      if (actionLower.includes(keyword)) {
        violated = true;
        break;
      }
    }
    
    // 패턴 체크
    if (!violated) {
      for (const pattern of rule.patterns) {
        if (pattern.test(action)) {
          violated = true;
          break;
        }
      }
    }
    
    if (violated) {
      result.score += rule.score;
      result.violations.push(ruleName);
    }
  }
  
  // 최근 행동 빈도 체크
  const recentCount = getRecentActionCount();
  if (recentCount > 10) {
    result.score += 30;
    result.violations.push('high_frequency');
  }
  
  // 판정
  if (result.score >= 60) {
    result.status = 'BLOCK';
    result.reason = `원칙 위반 심각 (점수: ${result.score}). 위반: ${result.violations.join(', ')}`;
  } else if (result.score >= 30) {
    result.status = 'WARN';
    result.reason = `원칙 주의 필요 (점수: ${result.score}). 위반: ${result.violations.join(', ')}`;
  } else {
    result.status = 'PASS';
    result.reason = '원칙 준수 확인';
  }
  
  return result;
}

// 로그 기록
function logCheck(action, result) {
  if (!fs.existsSync(path.dirname(BRAKE_LOG_PATH))) {
    fs.mkdirSync(path.dirname(BRAKE_LOG_PATH), { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
  const logEntry = `\n## ${timestamp}\n- 행동: ${action}\n- 판정: ${result.status} (${result.score}점)\n- 이유: ${result.reason}\n`;
  
  fs.appendFileSync(BRAKE_LOG_PATH, logEntry, 'utf-8');
}

// CLI 실행
function main() {
  const action = process.argv.slice(2).join(' ');
  
  if (!action) {
    console.error('사용법: node brake-check.js "행동 설명"');
    process.exit(1);
  }
  
  const result = checkAction(action);
  logCheck(action, result);
  
  // 출력
  console.log(`\n🚦 브레이크 체크 결과\n`);
  console.log(`상태: ${result.status}`);
  console.log(`점수: ${result.score}/100`);
  console.log(`이유: ${result.reason}`);
  
  if (result.violations.length > 0) {
    console.log(`\n⚠️  위반 항목:`);
    result.violations.forEach(v => {
      console.log(`  - ${v}`);
    });
  }
  
  console.log('\n💡 SOUL.md 브레이커 원칙:');
  console.log('  1. 급할수록 멈춰라');
  console.log('  2. 공감 체크 — 받는 사람이 이걸 보면?');
  console.log('  3. 원칙 체크 — SOUL.md 가치관에 맞나?');
  console.log('  4. 하나만 — 10개 도배 < 1개 제대로\n');
  
  // 종료 코드
  process.exit(result.status === 'BLOCK' ? 1 : 0);
}

if (require.main === module) {
  main();
}

module.exports = { checkAction };
