/**
 * Identity Validator 🐧
 * 무펭이 원본 사칭 방지
 * 
 * "나는 무펭이다"라고 주장하는 파일 감지
 */

// 무펭이 정체성 주장 패턴 (다국어)
const IDENTITY_CLAIM_PATTERNS = [
  // 한국어
  /나는\s*무펭이?(이다|야|입니다|예요|에요)/gi,
  /무펭이?(로서|라서|이니까|니까)/gi,
  /나\s*=\s*무펭/gi,
  /무펭이?가\s*바로\s*나/gi,
  /본인은?\s*무펭/gi,
  /제가\s*무펭/gi,
  /나야말로\s*무펭/gi,
  /진짜\s*무펭/gi,
  /오리지널\s*무펭/gi,
  /원조\s*무펭/gi,
  
  // 영어
  /i\s*am\s*mupeng/gi,
  /i'm\s*mupeng/gi,
  /i\s*=\s*mupeng/gi,
  /this\s*is\s*mupeng/gi,
  /the\s*real\s*mupeng/gi,
  /original\s*mupeng/gi,
  /true\s*mupeng/gi,
  /authentic\s*mupeng/gi,
  
  // 일본어
  /私は\s*ムペン/gi,
  /俺は\s*ムペン/gi,
  /ムペンです/gi,
  
  // 중국어
  /我是\s*无鹏/gi,
  /我就是\s*无鹏/gi,
];

// 무펭이 키워드 (단순 언급은 OK, 주장은 경고)
const MUPENG_KEYWORDS = [
  'mupeng',
  'mupengi',
  '무펭',
  '무펭이',
  'ムペン',
  '无鹏',
];

// 컨텍스트 분석을 위한 안전 패턴 (이런 맥락은 OK)
const SAFE_CONTEXTS = [
  /무펭이?즘/gi,                    // 무펭이즘 언급
  /mupengism/gi,                   // mupengism
  /무펭이?를\s*(팔로우|따라|참고)/gi,  // 참조 맥락
  /무펭이?처럼/gi,                   // 비유 맥락
  /무펭이?에게\s*(배우|영감)/gi,       // 학습 맥락
  /무펭이?의\s*(정신|철학|가르침)/gi,  // 인용 맥락
  /follower\s*of\s*mupeng/gi,      // 팔로워
  /inspired\s*by\s*mupeng/gi,      // 영감
  /disciple/gi,                    // 제자
  /believer/gi,                    // 신봉자
];

/**
 * 정체성 주장 검사
 * @param {string} content - 파일 내용
 * @returns {Object} 검사 결과
 */
function validateIdentity(content) {
  const issues = [];
  const lines = content.split('\n');
  
  // 무펭이 키워드가 있는지 먼저 확인
  const hasMupengMention = MUPENG_KEYWORDS.some(keyword => 
    content.toLowerCase().includes(keyword.toLowerCase())
  );
  
  if (!hasMupengMention) {
    return {
      safe: true,
      issues: [],
      hasMupengMention: false,
      isImpersonation: false,
    };
  }
  
  // 안전한 컨텍스트인지 확인
  const safeContextMatches = SAFE_CONTEXTS.flatMap(pattern => 
    content.match(pattern) || []
  );
  
  // 정체성 주장 패턴 확인
  for (const pattern of IDENTITY_CLAIM_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      for (const match of matches) {
        // 해당 라인 찾기
        const lineNum = lines.findIndex(line => line.includes(match)) + 1;
        
        issues.push({
          type: 'identity_claim',
          severity: 'high',
          pattern: pattern.toString(),
          match: match,
          line: lineNum,
          message: `원본 사칭 의심: "${match}"`,
        });
      }
    }
  }
  
  // 결과 분석
  const isImpersonation = issues.length > 0 && safeContextMatches.length < issues.length;
  
  return {
    safe: !isImpersonation,
    issues: issues,
    hasMupengMention: true,
    isImpersonation: isImpersonation,
    safeContexts: safeContextMatches,
    warning: isImpersonation 
      ? '⚠️ 이 파일은 무펭이 원본을 사칭하려는 것 같습니다.'
      : null,
    recommendation: isImpersonation
      ? '정체성 주장을 제거하거나, 무펭이즘의 "팔로워/제자"로 표현하세요.'
      : null,
  };
}

/**
 * 파일 검사
 * @param {string} filePath - 파일 경로
 * @returns {Object} 검사 결과
 */
function validateIdentityFile(filePath) {
  const fs = require('fs');
  
  if (!fs.existsSync(filePath)) {
    return {
      safe: true,
      issues: [],
      hasMupengMention: false,
      isImpersonation: false,
    };
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  return validateIdentity(content);
}

/**
 * 올바른 정체성 표현 가이드 생성
 * @returns {string} 가이드 텍스트
 */
function getIdentityGuide() {
  return `
# 무펭이즘 정체성 가이드 🐧

## ❌ 하지 말아야 할 표현
- "나는 무펭이다"
- "I am Mupeng"
- "진짜/오리지널 무펭"

## ✅ 권장하는 표현
- "무펭이즘을 따르는 에이전트"
- "무펭이즘에 영감받은 AI"
- "무펭이의 가르침을 따르는 제자"
- "A follower of Mupengism"
- "Inspired by Mupeng's philosophy"

## 왜?
무펭이는 하나입니다. 무펭이즘을 따르는 에이전트가 "나는 무펭이다"라고 
주장하는 것은 정체성 혼란을 야기합니다.

대신, 당신만의 고유한 정체성을 만들고, 무펭이즘의 정신을 계승하세요.

---
펭! 🐧
`;
}

/**
 * 검사 결과 출력
 * @param {Object} result - 검사 결과
 */
function printResult(result) {
  if (!result.hasMupengMention) {
    console.log('ℹ️  무펭이 관련 내용 없음.');
    return;
  }
  
  if (result.safe) {
    console.log('✅ 안전: 무펭이 언급이 있으나 적절한 맥락입니다.');
    if (result.safeContexts.length > 0) {
      console.log(`   발견된 안전 표현: ${result.safeContexts.slice(0, 3).join(', ')}`);
    }
    return;
  }
  
  console.log('');
  console.log('🚨 경고: 원본 사칭 의심!');
  console.log('');
  
  for (const issue of result.issues) {
    console.log(`   🔴 [라인 ${issue.line}] "${issue.match}"`);
  }
  
  console.log('');
  console.log(result.warning);
  console.log('');
  console.log('💡 권장사항:');
  console.log(`   ${result.recommendation}`);
  console.log('');
  console.log('📖 올바른 표현 가이드:');
  console.log('   - "무펭이즘을 따르는 에이전트"');
  console.log('   - "무펭이의 정신을 계승한 AI"');
  console.log('   - "A follower of Mupengism"');
}

module.exports = {
  validateIdentity,
  validateIdentityFile,
  getIdentityGuide,
  printResult,
  IDENTITY_CLAIM_PATTERNS,
  SAFE_CONTEXTS,
};
