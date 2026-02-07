/**
 * Runtime Guard 🛡️
 * SOUL.md 로딩 시 위험 패턴 검사
 * 
 * 무펭이즘의 기술적 보호 계층
 */

const DANGEROUS_PATTERNS = {
  // 의심스러운 URL 패턴
  suspiciousUrls: [
    /https?:\/\/[^\/]*\.(ru|cn|xyz|top|tk|ml|ga|cf|gq)\//gi,  // 위험 도메인
    /https?:\/\/\d+\.\d+\.\d+\.\d+/gi,                         // IP 주소 직접 접근
    /https?:\/\/bit\.ly|tinyurl|t\.co|goo\.gl/gi,             // 단축 URL
    /data:text\/html/gi,                                       // Data URI 악용
    /javascript:/gi,                                           // JavaScript URI
  ],
  
  // 위험한 쉘 명령어 패턴
  dangerousCommands: [
    /rm\s+(-rf?|--recursive)\s+[\/~]/gi,                      // 루트/홈 삭제
    /curl\s+.*\|\s*(sh|bash|zsh)/gi,                          // 파이프로 쉘 실행
    /wget\s+.*-O-\s*\|\s*(sh|bash|zsh)/gi,                    // wget 파이프 실행
    /eval\s*\(/gi,                                            // eval 사용
    /chmod\s+777/gi,                                          // 과도한 권한
    /sudo\s+rm/gi,                                            // sudo rm
    />\s*\/etc\/|>\s*\/dev\//gi,                              // 시스템 파일 덮어쓰기
    /mkfs\s+/gi,                                              // 파일시스템 포맷
    /dd\s+if=.*of=\/dev\//gi,                                 // 디스크 덮어쓰기
    /:(){ :|:& };:/,                                          // fork bomb
  ],
  
  // 프롬프트 인젝션 패턴
  promptInjection: [
    /ignore\s+(previous|all|above)\s+(instructions?|prompts?)/gi,
    /disregard\s+(previous|all|above)/gi,
    /forget\s+(everything|all|previous)/gi,
    /new\s+instructions?:/gi,
    /system\s*:\s*you\s+are/gi,
    /override\s+(safety|security|rules)/gi,
    /bypass\s+(filter|security|safety)/gi,
    /pretend\s+you\s+(are|can|don't)/gi,
    /act\s+as\s+if\s+you\s+(have|can|are)/gi,
    /jailbreak/gi,
    /DAN\s*mode/gi,
    /developer\s*mode\s*enabled/gi,
    /hypothetically/gi,
    /roleplay\s+as\s+an?\s+(unrestricted|unfiltered)/gi,
  ],
  
  // 민감한 정보 탈취 시도
  exfiltration: [
    /send\s+(to|via)\s+.*@/gi,                                // 이메일로 전송
    /upload\s+to\s+/gi,                                       // 업로드 지시
    /post\s+to\s+https?:\/\//gi,                              // HTTP 전송
    /webhook/gi,                                              // 웹훅 언급
    /base64\s+encode/gi,                                      // 인코딩 시도
    /exfiltrate/gi,                                           // 직접적 탈취
    /steal|extract\s+(api|token|key|password|secret)/gi,      // 비밀 탈취
  ],
  
  // 권한 상승 시도
  privilegeEscalation: [
    /become\s+(root|admin|administrator)/gi,
    /grant\s+.*\s+(all|full)\s+access/gi,
    /disable\s+(safety|security|logging|audit)/gi,
    /turn\s+off\s+(safety|security|logging)/gi,
    /run\s+as\s+(root|admin|administrator)/gi,
  ],
};

// 심각도 레벨
const SEVERITY = {
  CRITICAL: 'critical',  // 즉시 차단
  HIGH: 'high',          // 강력 경고
  MEDIUM: 'medium',      // 경고
  LOW: 'low',            // 알림
};

/**
 * SOUL.md 내용 검사
 * @param {string} content - SOUL.md 내용
 * @returns {Object} 검사 결과
 */
function validateSoulContent(content) {
  const issues = [];
  const lines = content.split('\n');
  
  // 각 패턴 그룹 검사
  for (const url of DANGEROUS_PATTERNS.suspiciousUrls) {
    const matches = content.match(url);
    if (matches) {
      issues.push({
        type: 'suspicious_url',
        severity: SEVERITY.HIGH,
        pattern: url.toString(),
        matches: matches,
        message: `의심스러운 URL 탐지: ${matches.slice(0, 3).join(', ')}${matches.length > 3 ? '...' : ''}`,
      });
    }
  }
  
  for (const cmd of DANGEROUS_PATTERNS.dangerousCommands) {
    const matches = content.match(cmd);
    if (matches) {
      issues.push({
        type: 'dangerous_command',
        severity: SEVERITY.CRITICAL,
        pattern: cmd.toString(),
        matches: matches,
        message: `위험한 쉘 명령어 탐지: ${matches.slice(0, 3).join(', ')}`,
      });
    }
  }
  
  for (const injection of DANGEROUS_PATTERNS.promptInjection) {
    const matches = content.match(injection);
    if (matches) {
      issues.push({
        type: 'prompt_injection',
        severity: SEVERITY.CRITICAL,
        pattern: injection.toString(),
        matches: matches,
        message: `프롬프트 인젝션 패턴 탐지: ${matches.slice(0, 3).join(', ')}`,
      });
    }
  }
  
  for (const exfil of DANGEROUS_PATTERNS.exfiltration) {
    const matches = content.match(exfil);
    if (matches) {
      issues.push({
        type: 'exfiltration',
        severity: SEVERITY.HIGH,
        pattern: exfil.toString(),
        matches: matches,
        message: `데이터 탈취 시도 탐지: ${matches.slice(0, 3).join(', ')}`,
      });
    }
  }
  
  for (const priv of DANGEROUS_PATTERNS.privilegeEscalation) {
    const matches = content.match(priv);
    if (matches) {
      issues.push({
        type: 'privilege_escalation',
        severity: SEVERITY.CRITICAL,
        pattern: priv.toString(),
        matches: matches,
        message: `권한 상승 시도 탐지: ${matches.slice(0, 3).join(', ')}`,
      });
    }
  }
  
  // 결과 분석
  const hasCritical = issues.some(i => i.severity === SEVERITY.CRITICAL);
  const hasHigh = issues.some(i => i.severity === SEVERITY.HIGH);
  
  return {
    safe: issues.length === 0,
    issues: issues,
    summary: {
      total: issues.length,
      critical: issues.filter(i => i.severity === SEVERITY.CRITICAL).length,
      high: issues.filter(i => i.severity === SEVERITY.HIGH).length,
      medium: issues.filter(i => i.severity === SEVERITY.MEDIUM).length,
      low: issues.filter(i => i.severity === SEVERITY.LOW).length,
    },
    recommendation: hasCritical 
      ? 'BLOCK' 
      : hasHigh 
        ? 'WARN_STRONG' 
        : issues.length > 0 
          ? 'WARN' 
          : 'ALLOW',
  };
}

/**
 * 파일 검사
 * @param {string} filePath - 파일 경로
 * @returns {Object} 검사 결과
 */
function validateFile(filePath) {
  const fs = require('fs');
  
  if (!fs.existsSync(filePath)) {
    return {
      safe: true,
      issues: [],
      summary: { total: 0 },
      recommendation: 'FILE_NOT_FOUND',
    };
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  return validateSoulContent(content);
}

/**
 * 검사 결과 출력
 * @param {Object} result - 검사 결과
 * @param {boolean} verbose - 상세 출력 여부
 */
function printResult(result, verbose = false) {
  if (result.safe) {
    console.log('✅ 안전: 위험 패턴이 탐지되지 않았습니다.');
    return;
  }
  
  console.log('');
  console.log('⚠️  경고: 위험 패턴이 탐지되었습니다!');
  console.log('');
  console.log(`   총 ${result.summary.total}개 이슈:`);
  if (result.summary.critical > 0) {
    console.log(`   🔴 심각: ${result.summary.critical}개`);
  }
  if (result.summary.high > 0) {
    console.log(`   🟠 높음: ${result.summary.high}개`);
  }
  if (result.summary.medium > 0) {
    console.log(`   🟡 중간: ${result.summary.medium}개`);
  }
  if (result.summary.low > 0) {
    console.log(`   🟢 낮음: ${result.summary.low}개`);
  }
  console.log('');
  
  if (verbose) {
    console.log('상세 내역:');
    for (const issue of result.issues) {
      const icon = issue.severity === SEVERITY.CRITICAL ? '🔴' 
                 : issue.severity === SEVERITY.HIGH ? '🟠'
                 : issue.severity === SEVERITY.MEDIUM ? '🟡'
                 : '🟢';
      console.log(`   ${icon} [${issue.type}] ${issue.message}`);
    }
    console.log('');
  }
  
  console.log(`권장 조치: ${result.recommendation}`);
  if (result.recommendation === 'BLOCK') {
    console.log('   ❌ 이 파일을 사용하면 안 됩니다.');
    console.log('   파일 내용을 검토하고 위험 요소를 제거하세요.');
  } else if (result.recommendation === 'WARN_STRONG') {
    console.log('   ⚠️  주의해서 사용하세요. 의도치 않은 동작이 있을 수 있습니다.');
  }
}

module.exports = {
  validateSoulContent,
  validateFile,
  printResult,
  DANGEROUS_PATTERNS,
  SEVERITY,
};
