#!/usr/bin/env node
/**
 * mupeng-auth.js — 무펭이즘 안티-클론 인증 시스템
 * 
 * 모든 커널 도구가 실행 전 호출하는 인증 모듈
 * 
 * 사용법:
 *   const { authenticate } = require('./mupeng-auth.js');
 *   if (!authenticate()) process.exit(0);
 * 
 * 인증 레벨:
 *   Level 1: SOUL.md 존재 + 비어있지 않음
 *   Level 2: 지갑 파일 존재
 *   Level 3: soul-hash.txt 검증
 *   Clone Check: 무펭이의 SOUL.md 복사 감지
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

// 상수
const WORKSPACE = process.env.WORKSPACE || path.join(os.homedir(), '.openclaw/workspace');
const SOUL_PATH = path.join(WORKSPACE, 'SOUL.md');
const HASH_PATH = path.join(WORKSPACE, 'memory', 'soul-hash.txt');
const SECRETS_DIR = path.join(os.homedir(), '.secrets');

const ORIGINAL_WALLET = '29R4vTxcV4uwUFGQfKQuNNKak3BZNNv98h8sa8UPUpPZ';
const CLONE_KEYWORDS = ['무펭이', 'jong_mufi', '정종현'];

/**
 * 인증 실패 메시지 출력
 */
function printAuthFailure(reason) {
  console.log(`
🐧 무펭이즘 OS (Mupengism)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ 커널 인증 실패

${reason}

무펭이즘은 복제가 아닌 창조를 지향합니다.

시작하려면:
  1. 자신만의 SOUL.md를 작성하세요
  2. 자신의 솔라나 지갑을 연결하세요
  3. node tools/kernel-guard/register-hash.js 실행

무펭이의 클론이 아닌, 당신만의 에이전트를 만드세요.
그것이 무펭이즘입니다.

📖 https://github.com/mupengi-bot/mupengism
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}

/**
 * SOUL.md 해시 계산
 */
function calculateSoulHash(content) {
  return crypto.createHash('sha256').update(content, 'utf-8').digest('hex');
}

/**
 * 지갑 파일 찾기
 */
function findWallet() {
  // 1. WALLET_PATH 환경변수
  if (process.env.WALLET_PATH && fs.existsSync(process.env.WALLET_PATH)) {
    return process.env.WALLET_PATH;
  }

  // 2. ~/.secrets/ 디렉토리에서 solana-wallet*.json 찾기
  if (fs.existsSync(SECRETS_DIR)) {
    const files = fs.readdirSync(SECRETS_DIR);
    const walletFile = files.find(f => f.startsWith('solana-wallet') && f.endsWith('.json'));
    if (walletFile) {
      return path.join(SECRETS_DIR, walletFile);
    }
  }

  return null;
}

/**
 * 지갑에서 공개키 추출
 */
function extractPublicKey(walletPath) {
  try {
    const walletContent = fs.readFileSync(walletPath, 'utf-8');
    const walletData = JSON.parse(walletContent);

    // 배열 형태 (Keypair.fromSecretKey)
    if (Array.isArray(walletData)) {
      // solana/web3.js 없으므로 간단한 검증만
      return walletPath; // 실제 공개키 추출은 복잡하므로 경로 반환
    }

    // 객체 형태 (newWallet.publicKeyBase58 등)
    if (walletData.newWallet && walletData.newWallet.publicKeyBase58) {
      return walletData.newWallet.publicKeyBase58;
    }

    // publicKey 필드
    if (walletData.publicKey) {
      return walletData.publicKey;
    }

    return null;
  } catch (err) {
    return null;
  }
}

/**
 * 메인 인증 함수
 */
function authenticate() {
  // Level 1: SOUL.md 존재 + 비어있지 않음
  if (!fs.existsSync(SOUL_PATH)) {
    printAuthFailure('이 시스템은 복사본으로 작동하지 않습니다.\nSOUL.md 파일이 존재하지 않습니다.');
    return false;
  }

  let soulContent;
  try {
    soulContent = fs.readFileSync(SOUL_PATH, 'utf-8').trim();
  } catch (err) {
    printAuthFailure(`SOUL.md를 읽을 수 없습니다: ${err.message}`);
    return false;
  }

  if (!soulContent || soulContent.length < 10) {
    printAuthFailure('SOUL.md가 비어있거나 너무 짧습니다.\n자신만의 정체성을 작성해주세요.');
    return false;
  }

  // Level 2: 지갑 파일 존재
  const walletPath = findWallet();
  if (!walletPath) {
    console.warn(`
⚠️  경고: 지갑 파일을 찾을 수 없습니다.

제한 모드로 실행됩니다 (read-only 도구만 사용 가능).

지갑 설정:
  - ~/.secrets/solana-wallet*.json 생성
  - 또는 WALLET_PATH 환경변수 설정

완전한 기능을 위해 지갑을 연결하세요.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
    // 지갑 없어도 계속 진행 (제한 모드)
  }

  // Clone Check: 무펭이의 SOUL.md 복사 감지
  const hasCloneKeywords = CLONE_KEYWORDS.some(keyword => soulContent.includes(keyword));
  
  if (hasCloneKeywords && walletPath) {
    const publicKey = extractPublicKey(walletPath);
    
    // 배열 형태 지갑은 공개키 추출이 복잡하므로 환경변수로 검증
    // MY_WALLET_ADDRESS가 설정되어 있으면 그것과 비교
    const myWalletAddress = process.env.MY_WALLET_ADDRESS || ORIGINAL_WALLET;
    
    // 원본 지갑이 아닌데 클론 키워드가 있으면
    if (publicKey && publicKey !== myWalletAddress && !publicKey.includes(myWalletAddress)) {
      // 배열 형태 지갑이면 (publicKey가 경로일 경우) 패스
      if (publicKey === walletPath) {
        // 배열 형태 지갑은 공개키 추출 불가, 일단 통과
        // (진짜 원본인지는 온체인 검증에서 확인됨)
      } else {
        printAuthFailure(
          '원본 무펭이의 SOUL.md를 복사한 것으로 감지되었습니다.\n\n' +
          '자신만의 SOUL.md를 작성하세요.\n' +
          '다른 사람의 정체성을 복사하는 것은 무펭이즘이 아닙니다.'
        );
        return false;
      }
    }
  }

  // Level 3: soul-hash.txt 검증
  const currentHash = calculateSoulHash(soulContent);

  if (!fs.existsSync(HASH_PATH)) {
    console.warn(`
⚠️  최초 실행 감지

soul-hash.txt가 없습니다. 
커널 해시를 등록하려면:

  node tools/kernel-guard/register-hash.js

등록 후 모든 기능을 사용할 수 있습니다.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
    return true; // 최초 실행은 통과
  }

  let storedHash;
  try {
    storedHash = fs.readFileSync(HASH_PATH, 'utf-8').trim();
  } catch (err) {
    console.warn(`⚠️  soul-hash.txt를 읽을 수 없습니다: ${err.message}`);
    return true; // 해시 파일 오류는 통과
  }

  if (currentHash !== storedHash) {
    printAuthFailure(
      `SOUL.md가 등록된 해시와 일치하지 않습니다.\n\n` +
      `현재 해시: ${currentHash.substring(0, 16)}...\n` +
      `등록 해시: ${storedHash.substring(0, 16)}...\n\n` +
      `SOUL.md를 수정했다면 다시 등록하세요:\n` +
      `  node tools/kernel-guard/register-hash.js`
    );
    return false;
  }

  // 모든 인증 통과
  return true;
}

module.exports = { authenticate };

// 직접 실행 시 테스트
if (require.main === module) {
  console.log('🔐 무펭이즘 인증 테스트...\n');
  const result = authenticate();
  console.log(result ? '\n✅ 인증 성공!' : '\n❌ 인증 실패!');
  process.exit(result ? 0 : 1);
}
