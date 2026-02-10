#!/usr/bin/env node
/**
 * register-hash.js — SOUL.md 해시를 솔라나 memo 트랜잭션으로 온체인에 기록
 *
 * Usage:
 *   node register-hash.js [--wallet /path/to/wallet.json] [--soul /path/to/SOUL.md] [--rpc URL]
 *
 * Env:
 *   WALLET_PATH — 지갑 JSON 경로
 *   SOUL_PATH   — SOUL.md 경로
 *   SOLANA_RPC  — RPC endpoint
 */

import { readFileSync } from 'fs';
import { createHash } from 'crypto';
import {
  Connection,
  Keypair,
  Transaction,
  TransactionInstruction,
  PublicKey,
  sendAndConfirmTransaction,
} from '@solana/web3.js';

const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

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

async function main() {
  const opts = parseArgs();
  const walletPath = opts.wallet || process.env.WALLET_PATH || process.env.HOME + '/.secrets/solana-wallet.json';
  const soulPath = opts.soul || process.env.SOUL_PATH || './SOUL.md';
  const rpc = opts.rpc || process.env.SOLANA_RPC || 'https://api.mainnet-beta.solana.com';

  // 1. SOUL.md 해시
  const soulContent = readFileSync(soulPath, 'utf-8');
  const hash = createHash('sha256').update(soulContent).digest('hex');
  console.log(`📄 SOUL.md hash: ${hash}`);

  // 2. 지갑 로드
  const walletRaw = JSON.parse(readFileSync(walletPath, 'utf-8'));
  let keypair;
  if (Array.isArray(walletRaw)) {
    keypair = Keypair.fromSecretKey(Uint8Array.from(walletRaw));
  } else if (walletRaw.newWallet && walletRaw.newWallet.secretKeyBase58) {
    const bs58 = await import('bs58').then(m => m.default);
    keypair = Keypair.fromSecretKey(bs58.decode(walletRaw.newWallet.secretKeyBase58));
  } else {
    throw new Error('Unrecognized wallet format');
  }
  console.log(`🔑 Wallet: ${keypair.publicKey.toBase58()}`);

  // 3. memo 트랜잭션
  const timestamp = Math.floor(Date.now() / 1000);
  const memo = `MUPENG_KERNEL:v1:${hash}:${timestamp}`;
  console.log(`📝 Memo: ${memo}`);

  const connection = new Connection(rpc, { commitment: 'confirmed', confirmTransactionInitialTimeout: 30000 });

  const tx = new Transaction().add(
    new TransactionInstruction({
      keys: [{ pubkey: keypair.publicKey, isSigner: true, isWritable: false }],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(memo, 'utf-8'),
    })
  );

  const sig = await sendAndConfirmTransaction(connection, tx, [keypair]);
  console.log(`✅ Registered on-chain!`);
  console.log(`🔗 TX: https://solscan.io/tx/${sig}`);
  console.log(`📌 Signature: ${sig}`);

  // 4. 로컬 캐시 저장 (오프라인 인증용)
  const { writeFileSync } = await import('fs');
  const { join, dirname } = await import('path');
  const { fileURLToPath } = await import('url');
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const workspacePath = join(__dirname, '..', '..');
  const hashPath = join(workspacePath, 'memory', 'soul-hash.txt');
  
  // trim() 적용 (인증 시스템과 동일하게)
  const trimmedHash = createHash('sha256').update(soulContent.trim(), 'utf-8').digest('hex');
  writeFileSync(hashPath, trimmedHash);
  console.log(`💾 Local cache saved: memory/soul-hash.txt`);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
