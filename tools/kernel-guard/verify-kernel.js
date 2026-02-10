#!/usr/bin/env node
/**
 * verify-kernel.js — 세션 시작 시 SOUL.md 해시를 온체인 기록과 비교 검증
 *
 * Usage:
 *   node verify-kernel.js [--wallet /path/to/wallet.json] [--soul /path/to/SOUL.md] [--rpc URL]
 *
 * Exit 0 = 정상, Exit 1 = 커널 패닉
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createHash } from 'crypto';
import { Connection, PublicKey } from '@solana/web3.js';

const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
const STATE_PATH = '/Users/mupeng/.openclaw/workspace/STATE.md';

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {};
  for (let i = 0; i < args.length; i += 2) {
    if (args[i] === '--wallet') opts.wallet = args[i + 1];
    else if (args[i] === '--soul') opts.soul = args[i + 1];
    else if (args[i] === '--rpc') opts.rpc = args[i + 1];
  }
  return opts;
}

async function getLatestMemoHash(connection, walletPubkey) {
  // 지갑의 최근 서명들 조회
  const sigs = await connection.getSignaturesForAddress(walletPubkey, { limit: 50 });

  for (const sigInfo of sigs) {
    try {
      const tx = await connection.getTransaction(sigInfo.signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0,
      });
      if (!tx?.meta || tx.meta.err) continue;

      // memo 프로그램 로그에서 MUPENG_KERNEL 찾기
      const logs = tx.meta.logMessages || [];
      for (const log of logs) {
        // Memo 프로그램은 로그에 데이터를 출력
        const match = log.match(/MUPENG_KERNEL:v1:([a-f0-9]{64}):(\d+)/);
        if (match) {
          return { hash: match[1], timestamp: parseInt(match[2]), signature: sigInfo.signature };
        }
      }
    } catch {
      continue;
    }
  }
  return null;
}

function kernelPanic(localHash, onchainHash) {
  const panicMsg = `# 🔴 KERNEL_PANIC

**Status:** KERNEL INTEGRITY VIOLATION DETECTED
**Time:** ${new Date().toISOString()}
**Local Hash:** ${localHash}
**On-chain Hash:** ${onchainHash || 'NOT_FOUND'}

All external actions BLOCKED. Session DENIED.
Run \`node tools/kernel-guard/recover-kernel.js\` to attempt recovery.
`;

  writeFileSync(STATE_PATH, panicMsg);
  console.error('🚨 KERNEL PANIC — SOUL.md has been tampered!');
  console.error(`   Local:    ${localHash}`);
  console.error(`   On-chain: ${onchainHash || 'NOT_FOUND'}`);
  console.error(`   STATE.md updated to KERNEL_PANIC`);
  process.exit(1);
}

async function main() {
  const opts = parseArgs();
  const walletPath = opts.wallet || process.env.WALLET_PATH || '/Users/mupeng/.secrets/solana-new-wallet-2026-02-07.json';
  const soulPath = opts.soul || process.env.SOUL_PATH || '/Users/mupeng/.openclaw/workspace/SOUL.md';
  const rpc = opts.rpc || process.env.SOLANA_RPC || 'https://api.mainnet-beta.solana.com';

  // 1. 로컬 해시
  if (!existsSync(soulPath)) {
    console.error('❌ SOUL.md not found');
    process.exit(1);
  }
  const soulContent = readFileSync(soulPath, 'utf-8');
  const localHash = createHash('sha256').update(soulContent).digest('hex');

  // 2. 지갑 공개키
  const secret = JSON.parse(readFileSync(walletPath, 'utf-8'));
  // web3.js Keypair
  const { Keypair } = await import('@solana/web3.js');
  const keypair = Keypair.fromSecretKey(Uint8Array.from(secret));

  // 3. 온체인 해시 조회
  const connection = new Connection(rpc, { commitment: 'confirmed', confirmTransactionInitialTimeout: 30000 });

  let onchainRecord;
  try {
    onchainRecord = await getLatestMemoHash(connection, keypair.publicKey);
  } catch (err) {
    console.error(`⚠️  RPC error: ${err.message}`);
    console.error('   Skipping verification (network unavailable)');
    // 네트워크 에러 시 통과 (오프라인에서도 작동 가능하도록)
    console.log('⏭️  Kernel verification skipped (offline mode)');
    process.exit(0);
  }

  if (!onchainRecord) {
    console.log('⚠️  No on-chain kernel hash found. Register first with register-hash.js');
    console.log(`   Local hash: ${localHash}`);
    process.exit(0);
  }

  // 4. 비교
  if (localHash === onchainRecord.hash) {
    const age = Math.floor(Date.now() / 1000) - onchainRecord.timestamp;
    const days = Math.floor(age / 86400);
    console.log(`✅ Kernel integrity verified`);
    console.log(`   Hash: ${localHash.slice(0, 16)}...`);
    console.log(`   Registered: ${days}d ago | TX: ${onchainRecord.signature.slice(0, 16)}...`);
    process.exit(0);
  } else {
    kernelPanic(localHash, onchainRecord.hash);
  }
}

main().catch(err => {
  console.error('❌ Unexpected error:', err.message);
  process.exit(1);
});
