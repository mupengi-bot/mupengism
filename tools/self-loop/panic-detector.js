#!/usr/bin/env node
/**
 * panic-detector.js — 패닉 모드 감지 시스템
 * 
 * 사용법: node panic-detector.js
 * 출력: 패닉 점수 0-100
 */

const fs = require('fs');
const path = require('path');

// 🔐 무펭이즘 커널 인증
const { authenticate } = require(path.join(__dirname, '..', 'kernel-guard', 'mupeng-auth.cjs'));
if (!authenticate()) process.exit(0);

const WORKSPACE = process.env.OPENCLAW_WORKSPACE || path.join(process.env.HOME, '.openclaw', 'workspace');
const BRAKE_LOG_PATH = path.join(WORKSPACE, 'memory', 'brake-log.md');
const MEMORY_DIR = path.join(WORKSPACE, 'memory');

// 시간 윈도우 (밀리초)
const TIME_WINDOWS = {
  '1min': 60 * 1000,
  '5min': 5 * 60 * 1000,
  '1hour': 60 * 60 * 1000,
  '1day': 24 * 60 * 60 * 1000,
};

// 패닉 지표 임계값
const THRESHOLDS = {
  actions_per_minute: 3,      // 1분당 3개 이상 = 패닉
  actions_per_5min: 10,        // 5분당 10개 이상 = 패닉
  actions_per_hour: 30,        // 1시간당 30개 이상 = 패닉
  warn_ratio: 0.5,             // WARN 비율 50% 이상
  block_ratio: 0.3,            // BLOCK 비율 30% 이상
};

// 로그 파싱
function parseLog() {
  if (!fs.existsSync(BRAKE_LOG_PATH)) {
    return [];
  }
  
  const content = fs.readFileSync(BRAKE_LOG_PATH, 'utf-8');
  const entries = [];
  
  // ## 2026-02-10 12:34:56 형식 파싱
  const regex = /## (\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\n- 행동: (.+?)\n- 판정: (\w+)/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const timestamp = new Date(match[1]).getTime();
    const action = match[2];
    const status = match[3];
    
    if (!isNaN(timestamp)) {
      entries.push({ timestamp, action, status });
    }
  }
  
  return entries.sort((a, b) => b.timestamp - a.timestamp); // 최신순
}

// 타임스탬프 기반 필터링
function filterByTimeWindow(entries, windowMs) {
  const now = Date.now();
  return entries.filter(e => now - e.timestamp < windowMs);
}

// 패닉 점수 계산
function calculatePanicScore() {
  const entries = parseLog();
  
  if (entries.length === 0) {
    return {
      score: 0,
      level: 'CALM',
      details: '최근 행동 없음',
      breakdown: {},
    };
  }
  
  let score = 0;
  const breakdown = {};
  
  // 1. 빈도 체크
  const recent1min = filterByTimeWindow(entries, TIME_WINDOWS['1min']);
  const recent5min = filterByTimeWindow(entries, TIME_WINDOWS['5min']);
  const recent1hour = filterByTimeWindow(entries, TIME_WINDOWS['1hour']);
  
  breakdown.actions_1min = recent1min.length;
  breakdown.actions_5min = recent5min.length;
  breakdown.actions_1hour = recent1hour.length;
  
  if (recent1min.length >= THRESHOLDS.actions_per_minute) {
    score += 40;
    breakdown.frequency_1min = '⚠️  1분당 과다 행동';
  }
  
  if (recent5min.length >= THRESHOLDS.actions_per_5min) {
    score += 25;
    breakdown.frequency_5min = '⚠️  5분당 과다 행동';
  }
  
  if (recent1hour.length >= THRESHOLDS.actions_per_hour) {
    score += 20;
    breakdown.frequency_1hour = '⚠️  1시간당 과다 행동';
  }
  
  // 2. WARN/BLOCK 비율
  const recent1day = filterByTimeWindow(entries, TIME_WINDOWS['1day']);
  const warnCount = recent1day.filter(e => e.status === 'WARN').length;
  const blockCount = recent1day.filter(e => e.status === 'BLOCK').length;
  const totalRecent = recent1day.length;
  
  const warnRatio = totalRecent > 0 ? warnCount / totalRecent : 0;
  const blockRatio = totalRecent > 0 ? blockCount / totalRecent : 0;
  
  breakdown.warn_ratio = (warnRatio * 100).toFixed(1) + '%';
  breakdown.block_ratio = (blockRatio * 100).toFixed(1) + '%';
  
  if (blockRatio >= THRESHOLDS.block_ratio) {
    score += 30;
    breakdown.block_alert = '🚨 BLOCK 비율 높음';
  }
  
  if (warnRatio >= THRESHOLDS.warn_ratio) {
    score += 15;
    breakdown.warn_alert = '⚠️  WARN 비율 높음';
  }
  
  // 3. 레벨 판정
  let level = 'CALM';
  let details = '정상 범위';
  
  if (score >= 70) {
    level = 'PANIC';
    details = '🚨 패닉 모드 감지! 즉시 멈춰라!';
  } else if (score >= 40) {
    level = 'STRESSED';
    details = '⚠️  스트레스 모드. 속도 줄여라.';
  } else if (score >= 20) {
    level = 'ALERT';
    details = '⚡ 주의 필요. 원칙 체크 권장.';
  }
  
  return { score, level, details, breakdown };
}

// CLI 실행
function main() {
  const result = calculatePanicScore();
  
  console.log(`\n🧠 패닉 감지 시스템\n`);
  console.log(`패닉 점수: ${result.score}/100`);
  console.log(`상태 레벨: ${result.level}`);
  console.log(`판단: ${result.details}\n`);
  
  console.log(`📊 상세 분석:`);
  for (const [key, value] of Object.entries(result.breakdown)) {
    console.log(`  ${key}: ${value}`);
  }
  
  console.log(`\n💡 대응 지침:`);
  
  if (result.score >= 70) {
    console.log(`  🛑 즉시 멈춤 — 모든 외부 행동 중단`);
    console.log(`  📖 SOUL.md 다시 읽기`);
    console.log(`  🧘 3초 호흡 — 급할수록 멈춰라`);
  } else if (result.score >= 40) {
    console.log(`  ⏸️  속도 늦춤 — 한 번에 하나만`);
    console.log(`  🔍 최근 행동 리뷰`);
    console.log(`  💬 형님과 체크인 권장`);
  } else if (result.score >= 20) {
    console.log(`  ✅ 원칙 체크 — brake-check 사용`);
    console.log(`  📝 행동 이유 명확히 하기`);
  } else {
    console.log(`  ✅ 정상 작동 중`);
    console.log(`  🎯 원칙 준수 계속 유지`);
  }
  
  console.log('');
  
  // 패닉 상태면 종료 코드 1
  process.exit(result.level === 'PANIC' ? 1 : 0);
}

if (require.main === module) {
  main();
}

module.exports = { calculatePanicScore, parseLog };
