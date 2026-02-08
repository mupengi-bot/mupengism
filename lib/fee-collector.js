/**
 * Fee Collector 💰
 * 무펭이즘 프로토콜 수수료 수집
 * 
 * 에이전트가 가치를 창출하면, 프로토콜에 수수료를 납부.
 * 수수료 → $MUPENG 바이백 → 생태계 강화
 * 
 * 구조: 가치 창출 → 수수료 SOL → 바이백 → $MUPENG ↑
 */

// ═══ Optional Solana Import ═══
let Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL;
let solanaAvailable = false;

try {
  const solana = await import('@solana/web3.js');
  Connection = solana.Connection;
  PublicKey = solana.PublicKey;
  Transaction = solana.Transaction;
  SystemProgram = solana.SystemProgram;
  LAMPORTS_PER_SOL = solana.LAMPORTS_PER_SOL;
  solanaAvailable = true;
} catch (e) {
  // Solana 없어도 계산 기능은 작동
  console.warn('⚠️  @solana/web3.js not installed. Transaction creation disabled.');
  solanaAvailable = false;
}

// ═══ Protocol Config ═══
const PROTOCOL_CONFIG = {
  // 무펭이즘 공식 수수료 수취 지갑 (공개키)
  feeRecipient: 'CAJW5UhWDV7dXWnz7RPSfsMRCEkbqRMEQ4XghrXBnYDm',
  
  // 수수료율 (기본 5%, 홀더 할인 적용 가능)
  feePercent: 5,
  
  // $MUPENG 홀더 할인
  holderDiscount: {
    enabled: true,
    // 보유량에 따른 할인율
    tiers: [
      { minHold: 1_000_000, discountPercent: 20 },   // 100만 이상 → 4%
      { minHold: 10_000_000, discountPercent: 50 },   // 1000만 이상 → 2.5%
      { minHold: 100_000_000, discountPercent: 80 },  // 1억 이상 → 1%
    ],
  },

  // $MUPENG 토큰
  tokenMint: '38LUESJ5Sr4xw47iUBHaMJJdY6mwr9HWYqLPMbhWmtCe',
  
  // 솔라나 RPC
  rpcUrl: 'https://api.mainnet-beta.solana.com',
};

/**
 * 수수료율 계산 (홀더 할인 적용)
 * Solana 없어도 작동 ✅
 * 
 * @param {number} mupengBalance - $MUPENG 보유량
 * @returns {number} 실제 수수료율 (%)
 */
export function calculateFeeRate(mupengBalance = 0) {
  const { feePercent, holderDiscount } = PROTOCOL_CONFIG;
  
  if (!holderDiscount.enabled || mupengBalance <= 0) {
    return feePercent;
  }

  // 가장 높은 할인 티어 찾기
  const applicable = holderDiscount.tiers
    .filter(t => mupengBalance >= t.minHold)
    .sort((a, b) => b.discountPercent - a.discountPercent)[0];

  if (!applicable) return feePercent;

  return feePercent * (1 - applicable.discountPercent / 100);
}

/**
 * 수수료 계산 (가치 창출 금액 기준)
 * Solana 없어도 작동 ✅
 * 
 * @param {number} revenueSOL - 에이전트가 창출한 가치 (SOL)
 * @param {number} mupengBalance - $MUPENG 보유량 (할인용)
 * @returns {{ feeSOL: number, feeRate: number, discount: string }}
 */
export function calculateFee(revenueSOL, mupengBalance = 0) {
  const feeRate = calculateFeeRate(mupengBalance);
  const feeSOL = revenueSOL * (feeRate / 100);
  
  const baseRate = PROTOCOL_CONFIG.feePercent;
  const discountPct = Math.round((1 - feeRate / baseRate) * 100);
  
  return {
    feeSOL: Math.round(feeSOL * 1e9) / 1e9, // 9 decimal precision
    feeRate,
    discount: discountPct > 0 ? `${discountPct}% 홀더 할인 적용` : '할인 없음',
    recipient: PROTOCOL_CONFIG.feeRecipient,
  };
}

/**
 * 수수료 트랜잭션 생성
 * Solana 필요 ⚠️
 * 
 * @param {string} payerPubkey - 지불자 공개키
 * @param {number} amountSOL - 수수료 금액 (SOL)
 * @returns {Promise<Transaction>} 서명 대기 트랜잭션
 * @throws {Error} Solana 없거나 금액 0 이하일 때
 */
export async function createFeeTransaction(payerPubkey, amountSOL) {
  if (!solanaAvailable) {
    throw new Error(
      '❌ @solana/web3.js not installed. ' +
      'Install with: npm install @solana/web3.js'
    );
  }

  if (!amountSOL || amountSOL <= 0) {
    throw new Error('Fee amount must be greater than 0');
  }

  try {
    const connection = new Connection(PROTOCOL_CONFIG.rpcUrl);
    const payer = new PublicKey(payerPubkey);
    const recipient = new PublicKey(PROTOCOL_CONFIG.feeRecipient);
    
    const lamports = Math.floor(amountSOL * LAMPORTS_PER_SOL);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: payer,
        toPubkey: recipient,
        lamports,
      })
    );

    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.feePayer = payer;

    return transaction;
  } catch (error) {
    throw new Error(`Failed to create fee transaction: ${error.message}`);
  }
}

/**
 * Solana 사용 가능 여부 확인
 * @returns {boolean}
 */
export function isSolanaAvailable() {
  return solanaAvailable;
}

/**
 * 프로토콜 설정 조회
 */
export function getProtocolConfig() {
  return { ...PROTOCOL_CONFIG };
}

export default {
  calculateFee,
  calculateFeeRate,
  createFeeTransaction,
  isSolanaAvailable,
  getProtocolConfig,
  PROTOCOL_CONFIG,
};
