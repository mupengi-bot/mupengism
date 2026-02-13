---
name: invoice-gen
description: 프리랜스/크몽 자동 청구서 생성
author: 무펭이 🐧
---

# invoice-gen

프리랜스 작업 또는 크몽 거래를 위한 청구서를 자동으로 생성하는 스킬입니다.

## 기능

- 입력: 서비스명, 금액, 고객정보, 날짜
- 출력: 마크다운 청구서 + PDF 변환 안내
- 세금계산서 항목 자동 계산 (부가세 10%)
- 파일 저장: `workspace/invoices/YYYY-MM-DD-{고객명}.md`

## 사용법

트리거 키워드:
- "청구서"
- "invoice"
- "견적서"
- "세금계산서"

예시:
```
청구서 생성:
- 고객: 무피 포토부스
- 서비스: Instagram 자동화 봇 개발
- 금액: 500,000원
- 날짜: 2026-02-14
```

## 청구서 템플릿

```markdown
# 청구서 / INVOICE

**청구서 번호**: INV-YYYY-MM-DD-XXX  
**발행일**: YYYY년 MM월 DD일

---

## 공급자 정보
**상호**: [자동 입력 - USER.md 기반]  
**대표자**: 무펭이  
**사업자등록번호**: XXX-XX-XXXXX  
**주소**: [자동 입력]  
**연락처**: [자동 입력]

---

## 공급받는자 정보
**상호**: {고객명}  
**대표자**: {대표자명}  
**사업자등록번호**: {번호}  
**주소**: {주소}  
**연락처**: {연락처}

---

## 공급 내역

| 항목 | 규격 | 수량 | 단가 | 공급가액 | 세액 |
|------|------|------|------|----------|------|
| {서비스명} | {상세} | 1 | {금액} | {금액} | {부가세} |

---

## 합계

- **공급가액**: ₩{금액}
- **부가세 (10%)**: ₩{부가세}
- **총 금액**: ₩{합계}

---

## 입금 정보

**은행**: {은행명}  
**예금주**: 무펭이  
**계좌번호**: {계좌번호}  
**입금 기한**: YYYY년 MM월 DD일까지

---

## 비고

- 본 청구서는 세금계산서 발행 전 거래 확인용입니다.
- 세금계산서 발행이 필요하신 경우 별도로 요청해 주세요.
- 입금 시 청구서 번호(INV-XXX)를 기재해 주시기 바랍니다.

---

**발행자**: 무펭이 🐧  
**발행일**: YYYY-MM-DD  
**서명**: ________________
```

## 자동 계산

```js
// 공급가액 입력 시
const supplyPrice = 500000;
const vat = Math.round(supplyPrice * 0.1);  // 50000
const total = supplyPrice + vat;            // 550000
```

역산 (총액 입력 시):
```js
const total = 550000;
const supplyPrice = Math.round(total / 1.1);  // 500000
const vat = total - supplyPrice;              // 50000
```

## PDF 변환 안내

생성 후 안내 메시지:
```
✅ 청구서 생성 완료: workspace/invoices/2026-02-14-무피포토부스.md

PDF 변환 방법:
1. Marked 앱 사용 (Mac): md → PDF 내보내기
2. Pandoc: pandoc invoice.md -o invoice.pdf
3. VSCode + Markdown PDF 확장
4. 온라인: https://md2pdf.netlify.app/
```

## 청구서 번호 규칙

- `INV-YYYY-MM-DD-001` (일자별 순번)
- 상태 파일: `invoices/.invoice-counter.json`
```json
{
  "2026-02-14": 3,
  "2026-02-15": 1
}
```

## 템플릿 커스터마이징

`workspace/invoices/template.md` 파일로 기본 템플릿 수정 가능.

---

**invoice-gen** | 무펭이 🐧
