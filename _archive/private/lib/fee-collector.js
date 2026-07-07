/**
 * Fee Accounting Helper 💰 (ARCHIVED)
 * 무펭이즘 프로토콜 — 선택적 수수료 계산 유틸리티
 *
 * ⚠️  아카이브 노트: 이 파일은 과거 설계의 히스토리 보존용입니다.
 *     초기 프로토타입에는 온체인 결제 개념이 있었으나 제거되었습니다.
 *     현재 포지셔닝에는 어떤 토큰/크립토 연동도 포함되지 않습니다.
 *
 * 남은 것은 순수 계산 전용 회계 헬퍼입니다. 외부 결제/정산 연동은 없습니다.
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
