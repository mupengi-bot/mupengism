/**
 * Fee Accounting Helper 💰
 * 무펭이즘 프로토콜 — 선택적 수수료 계산 유틸리티
 *
 * 에이전트가 창출한 가치에 대해 선택적인 프로토콜 수수료를 계산합니다.
 * 순수 계산 전용 모듈입니다. 외부 결제/정산 연동은 포함하지 않습니다.
 *
 * 구조: 가치 창출 → (선택) 수수료 계산 → 회계 기록
 */

// ═══ Protocol Config ═══
const PROTOCOL_CONFIG = {
  // 수수료율 (기본 5%, 선택 적용)
  feePercent: 5,

  // 수수료 표기 통화 (회계용 라벨, 기본값)
  currency: 'USD',

  // 수수료 활성화 여부 (기본 비활성)
  enabled: false,
};

/**
 * 수수료율 계산
 *
 * @param {object} [opts]
 * @param {number} [opts.overridePercent] - 기본 수수료율을 덮어쓸 값 (%)
 * @returns {number} 적용 수수료율 (%)
 */
export function calculateFeeRate(opts = {}) {
  const { overridePercent } = opts;
  if (typeof overridePercent === 'number' && overridePercent >= 0) {
    return overridePercent;
  }
  return PROTOCOL_CONFIG.feePercent;
}

/**
 * 수수료 계산 (가치 창출 금액 기준)
 *
 * @param {number} revenue - 에이전트가 창출한 가치 (임의 통화 단위)
 * @param {object} [opts]
 * @param {number} [opts.overridePercent] - 수수료율 오버라이드 (%)
 * @returns {{ fee: number, feeRate: number, currency: string }}
 */
export function calculateFee(revenue, opts = {}) {
  const feeRate = calculateFeeRate(opts);
  const fee = (Number(revenue) || 0) * (feeRate / 100);

  return {
    fee: Math.round(fee * 1e6) / 1e6, // 6 decimal precision
    feeRate,
    currency: PROTOCOL_CONFIG.currency,
  };
}

/**
 * 수수료 기능 활성화 여부 확인
 * @returns {boolean}
 */
export function isFeeEnabled() {
  return PROTOCOL_CONFIG.enabled === true;
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
  isFeeEnabled,
  getProtocolConfig,
  PROTOCOL_CONFIG,
};
