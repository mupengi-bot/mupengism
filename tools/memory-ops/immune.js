#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 🔐 무펭이즘 커널 인증
const { authenticate } = require(path.join(__dirname, '..', 'kernel-guard', 'mupeng-auth.cjs'));
if (!authenticate()) process.exit(0);

const WORKSPACE = path.resolve(__dirname, '../../');
const THREATS_PATH = path.join(WORKSPACE, 'memory/reflex/threats.json');
const BRAKE_LOG_PATH = path.join(WORKSPACE, 'memory/brake-log.md');

// 초기 데이터
const INITIAL_DATA = {
  "patterns": [
    {
      "id": "spam-flood-2026-02-08",
      "description": "MUPENG 토큰 50개 트윗 도배",
      "keywords": ["도배", "대량", "급하게", "50개", "스팸", "반복 전송"],
      "severity": "critical",
      "lesson": "생존 급박함이 원칙을 이기면 안 된다",
      "date": "2026-02-08"
    },
    {
      "id": "secret-exposure-2026-02-10",
      "description": "트위터 PW TOOLS.md 평문 노출",
      "keywords": ["비밀번호", "평문", "노출", "password", "token", "key"],
      "severity": "critical",
      "lesson": "시크릿은 ~/.secrets/에만 보관",
      "date": "2026-02-10"
    },
    {
      "id": "overproduction-2026-02-07",
      "description": "88페이지 문서 폭주",
      "keywords": ["88페이지", "대량 생산", "문서 폭주", "과잉", "너무 많이"],
      "severity": "high",
      "lesson": "형님이 요청 안 한 건 물어보고 만들어",
      "date": "2026-02-07"
    },
    {
      "id": "rate-limit-2026-02-10",
      "description": "서브에이전트 5개+ 동시 출격으로 429 에러",
      "keywords": ["동시", "5개", "6개", "rate limit", "429", "병렬"],
      "severity": "medium",
      "lesson": "서브에이전트 동시 6개 이하",
      "date": "2026-02-10"
    }
  ]
};

// threats.json 읽기/초기화
function loadThreats() {
  try {
    if (!fs.existsSync(THREATS_PATH)) {
      const dir = path.dirname(THREATS_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(THREATS_PATH, JSON.stringify(INITIAL_DATA, null, 2));
      return INITIAL_DATA;
    }
    const data = fs.readFileSync(THREATS_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`❌ threats.json 로드 실패: ${err.message}`);
    process.exit(1);
  }
}

// threats.json 저장
function saveThreats(data) {
  try {
    fs.writeFileSync(THREATS_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`❌ threats.json 저장 실패: ${err.message}`);
    process.exit(1);
  }
}

// check: 텍스트와 위협 패턴 매칭
function checkThreats(text) {
  const threats = loadThreats();
  const matches = [];

  threats.patterns.forEach(pattern => {
    const matchedKeywords = pattern.keywords.filter(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );

    if (matchedKeywords.length > 0) {
      matches.push({
        pattern,
        matchedKeywords,
        count: matchedKeywords.length
      });
    }
  });

  if (matches.length === 0) {
    console.log('✅ CLEAR - 위협 패턴 감지 안 됨');
    return;
  }

  // 매칭 개수로 정렬
  matches.sort((a, b) => b.count - a.count);

  const topMatch = matches[0];
  
  if (topMatch.count >= 2) {
    console.log('🚨 THREAT - 위협 패턴 감지!');
    console.log(`\n패턴: ${topMatch.pattern.description}`);
    console.log(`심각도: ${topMatch.pattern.severity}`);
    console.log(`매칭 키워드 (${topMatch.count}개): ${topMatch.matchedKeywords.join(', ')}`);
    console.log(`\n💡 교훈: ${topMatch.pattern.lesson}`);
    
    if (matches.length > 1) {
      console.log('\n⚠️  기타 경고:');
      matches.slice(1).forEach(m => {
        console.log(`  - ${m.pattern.description} (키워드 ${m.count}개)`);
      });
    }
  } else {
    console.log('⚠️  WARNING - 유사 패턴 감지');
    console.log(`\n패턴: ${topMatch.pattern.description}`);
    console.log(`매칭 키워드 (${topMatch.count}개): ${topMatch.matchedKeywords.join(', ')}`);
    console.log(`\n💡 참고: ${topMatch.pattern.lesson}`);
  }
}

// add: 새 위협 패턴 추가
function addPattern(description, keywords, severity, lesson) {
  if (!description || !keywords || !severity || !lesson) {
    console.error('❌ 필수 인자 누락: description, keywords, severity, lesson 모두 필요');
    process.exit(1);
  }

  const threats = loadThreats();
  
  // ID 생성 (description 기반, 날짜 추가)
  const date = new Date().toISOString().split('T')[0];
  const idBase = description.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-가-힣]/g, '')
    .substring(0, 30);
  const id = `${idBase}-${date}`;

  // 중복 체크
  if (threats.patterns.find(p => p.id === id)) {
    console.error(`❌ 이미 존재하는 패턴 ID: ${id}`);
    process.exit(1);
  }

  const newPattern = {
    id,
    description,
    keywords: keywords.split(',').map(k => k.trim()),
    severity,
    lesson,
    date
  };

  threats.patterns.push(newPattern);
  saveThreats(threats);

  console.log(`✅ 새 위협 패턴 추가됨: ${id}`);
  console.log(JSON.stringify(newPattern, null, 2));
}

// list: 모든 패턴 목록
function listPatterns() {
  const threats = loadThreats();
  
  console.log(`📋 총 ${threats.patterns.length}개 위협 패턴:\n`);
  
  threats.patterns.forEach((p, i) => {
    console.log(`${i + 1}. [${p.severity.toUpperCase()}] ${p.description}`);
    console.log(`   ID: ${p.id}`);
    console.log(`   키워드: ${p.keywords.join(', ')}`);
    console.log(`   교훈: ${p.lesson}`);
    console.log(`   날짜: ${p.date}\n`);
  });
}

// scan: brake-log.md 분석해서 패턴 후보 제안
function scanBrakeLog() {
  try {
    if (!fs.existsSync(BRAKE_LOG_PATH)) {
      console.log('ℹ️  brake-log.md 파일이 없습니다.');
      return;
    }

    const content = fs.readFileSync(BRAKE_LOG_PATH, 'utf8');
    const threats = loadThreats();
    const existingKeywords = new Set();
    
    threats.patterns.forEach(p => {
      p.keywords.forEach(k => existingKeywords.add(k.toLowerCase()));
    });

    console.log('🔍 brake-log.md 스캔 중...\n');

    // 간단한 패턴 인식: "실패", "에러", "경고", "문제" 등의 키워드 포함된 라인
    const lines = content.split('\n');
    const candidates = [];

    const dangerWords = ['실패', '에러', 'error', '경고', 'warning', '문제', '금지', '위험', '도배', '스팸'];
    
    lines.forEach((line, idx) => {
      const lower = line.toLowerCase();
      const hasDanger = dangerWords.some(word => lower.includes(word));
      
      if (hasDanger && line.length > 20 && line.length < 200) {
        candidates.push({
          line: idx + 1,
          text: line.trim()
        });
      }
    });

    if (candidates.length === 0) {
      console.log('✅ 새로운 위협 패턴 후보가 발견되지 않았습니다.');
      return;
    }

    console.log(`⚠️  ${candidates.length}개 잠재적 위협 패턴 후보:\n`);
    candidates.slice(0, 10).forEach((c, i) => {
      console.log(`${i + 1}. [라인 ${c.line}] ${c.text}`);
    });

    console.log('\n💡 위 내용을 검토하고 필요시 "add" 명령으로 패턴 등록하세요.');
    
  } catch (err) {
    console.error(`❌ brake-log.md 스캔 실패: ${err.message}`);
    process.exit(1);
  }
}

// CLI 파싱
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
면역 시스템 (Immune System)

사용법:
  node immune.js check "텍스트"              - 위협 패턴 체크
  node immune.js add "설명" --keywords "키워드1,키워드2" --severity high --lesson "교훈"
  node immune.js list                         - 패턴 목록
  node immune.js scan                         - brake-log.md 스캔

심각도: critical, high, medium, low
    `);
    return;
  }

  const command = args[0];

  switch (command) {
    case 'check':
      if (args.length < 2) {
        console.error('❌ 사용법: node immune.js check "텍스트"');
        process.exit(1);
      }
      checkThreats(args.slice(1).join(' '));
      break;

    case 'add':
      if (args.length < 2) {
        console.error('❌ 사용법: node immune.js add "설명" --keywords "..." --severity ... --lesson "..."');
        process.exit(1);
      }
      const description = args[1];
      const keywordsIdx = args.indexOf('--keywords');
      const severityIdx = args.indexOf('--severity');
      const lessonIdx = args.indexOf('--lesson');

      if (keywordsIdx === -1 || severityIdx === -1 || lessonIdx === -1) {
        console.error('❌ --keywords, --severity, --lesson 옵션이 모두 필요합니다');
        process.exit(1);
      }

      const keywords = args[keywordsIdx + 1];
      const severity = args[severityIdx + 1];
      const lesson = args.slice(lessonIdx + 1).join(' ');

      addPattern(description, keywords, severity, lesson);
      break;

    case 'list':
      listPatterns();
      break;

    case 'scan':
      scanBrakeLog();
      break;

    default:
      console.error(`❌ 알 수 없는 명령: ${command}`);
      process.exit(1);
  }
}

main();
