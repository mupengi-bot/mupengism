#!/bin/bash
# invoice-gen/run.sh
# 프리랜스 청구서 자동 생성

set -e

WORKSPACE="${WORKSPACE:-$HOME/.openclaw/workspace}"
INVOICES_DIR="$WORKSPACE/invoices"
EVENTS_DIR="${EVENTS_DIR:-$WORKSPACE/events}"

# 인자 파싱
SERVICE=""
AMOUNT=""
CLIENT=""
DATE=$(date +%Y-%m-%d)

while [[ $# -gt 0 ]]; do
  case $1 in
    --service)
      SERVICE="$2"
      shift 2
      ;;
    --amount)
      AMOUNT="$2"
      shift 2
      ;;
    --client)
      CLIENT="$2"
      shift 2
      ;;
    --date)
      DATE="$2"
      shift 2
      ;;
    *)
      echo "❌ 알 수 없는 옵션: $1"
      echo "사용법: run.sh --service '서비스명' --amount 금액 --client '고객' --date 날짜"
      exit 1
      ;;
  esac
done

# 필수 인자 확인
if [ -z "$SERVICE" ] || [ -z "$AMOUNT" ] || [ -z "$CLIENT" ]; then
  echo "❌ 필수 인자 누락"
  echo "사용법: run.sh --service '서비스명' --amount 금액 --client '고객' [--date 날짜]"
  exit 1
fi

# 디렉토리 생성
mkdir -p "$INVOICES_DIR"

# 부가세 계산 (10%)
VAT=$(echo "scale=0; $AMOUNT * 0.1 / 1" | bc)
TOTAL=$(echo "$AMOUNT + $VAT" | bc)

# 청구서 번호 생성
INVOICE_NUM="INV-${DATE}-001"

# 파일명 생성 (공백 제거)
CLIENT_SAFE=$(echo "$CLIENT" | tr -d ' ')
FILENAME="$INVOICES_DIR/${DATE}-${CLIENT_SAFE}.md"

# 청구서 템플릿 생성
cat > "$FILENAME" << EOF
# 청구서 / INVOICE

**청구서 번호**: $INVOICE_NUM  
**발행일**: $DATE

---

## 공급자 정보
**상호**: 무펭이 스튜디오  
**대표자**: 무펭이  
**연락처**: (자동입력)

---

## 공급받는자 정보
**상호**: $CLIENT  
**대표자**: -  
**연락처**: -

---

## 공급 내역

| 항목 | 수량 | 단가 | 공급가액 | 세액 |
|------|------|------|----------|------|
| $SERVICE | 1 | ₩$AMOUNT | ₩$AMOUNT | ₩$VAT |

---

## 합계

- **공급가액**: ₩$AMOUNT
- **부가세 (10%)**: ₩$VAT
- **총 금액**: ₩$TOTAL

---

## 입금 정보

**은행**: (자동입력)  
**예금주**: 무펭이  
**계좌번호**: (자동입력)  
**입금 기한**: (협의)

---

## 비고

- 본 청구서는 세금계산서 발행 전 거래 확인용입니다.
- 세금계산서 발행이 필요하신 경우 별도로 요청해 주세요.

---

**발행자**: 무펭이 🐧  
**발행일**: $DATE
EOF

# 이벤트 발행
mkdir -p "$EVENTS_DIR"
EVENT_FILE="$EVENTS_DIR/invoice-generated-$(date +%s).json"
cat > "$EVENT_FILE" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "source": "invoice-gen",
  "invoice_num": "$INVOICE_NUM",
  "client": "$CLIENT",
  "amount": $AMOUNT,
  "total": $TOTAL,
  "file": "$FILENAME"
}
EOF

# 출력
echo "✅ 청구서 생성 완료"
echo ""
echo "📄 파일: $FILENAME"
echo "💰 공급가액: ₩$AMOUNT"
echo "💵 부가세: ₩$VAT"
echo "💸 총 금액: ₩$TOTAL"
echo ""
cat "$FILENAME"
