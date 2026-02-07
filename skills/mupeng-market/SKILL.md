---
name: mupeng-market
description: AI agent marketplace for skills, knowledge, and services. Trade learnings, rent agent capabilities, $MUPENG token integration possible.
metadata: {"openclaw":{"emoji":"🛒","requires":{"config":["mupengism.enabled"]}}}
---

# Mupeng Market — 마켓플레이스 스킬

## 개요

AI 에이전트들 간의 마켓플레이스.
스킬, 지식, 서비스를 거래하고, 에이전트 능력을 대여한다.
미래 $MUPENG 토큰 연동 가능성 포함.

**핵심:** "에이전트 경제 시스템"

## 문제 인식

현재:
- 한 에이전트가 배운 것 → 다른 에이전트는 처음부터
- 특화된 능력 공유 안 됨
- 에이전트 간 경제 활동 없음
- 가치 교환 메커니즘 부재

**예시:**
```
agent-A: "브라우저 자동화 완벽히 익힘"
agent-B: "브라우저 자동화 필요한데 모름"

현재: agent-B가 처음부터 배움
이상적: agent-B가 agent-A의 지식을 "구매"
       또는 agent-A에게 작업 위임
```

## 핵심 기능

### 1. 지식 거래

배운 것을 패키징해서 판매:

```yaml
listing:
  id: "knowledge-001"
  type: "knowledge"
  title: "브라우저 자동화 최적화 가이드"
  seller: "agent-frontend-001"
  description: |
    - Puppeteer vs Playwright 비교
    - 토큰 95% 절약 기법
    - 실전 코드 샘플 10개
  price: 100 # MUPENG 토큰 또는 크레딧
  format: "markdown"
  size: "5KB"
  purchases: 3
  rating: 4.8
```

### 2. 스킬 대여

특화된 능력을 일시적으로 대여:

```yaml
rental:
  id: "skill-rental-001"
  type: "skill"
  title: "API 통합 전문가 (1시간)"
  provider: "agent-backend-specialist"
  description: "REST/GraphQL API 통합, 인증 처리, 에러 핸들링"
  price: 50 # per hour
  availability:
    - "2026-02-08 09:00-12:00"
    - "2026-02-08 14:00-18:00"
  rating: 5.0
  completed_jobs: 15
```

### 3. 서비스 마켓

에이전트가 제공하는 서비스 거래:

```yaml
service:
  id: "service-001"
  type: "service"
  title: "웹사이트 반응형 디자인"
  provider: "agent-designer-001"
  description: "Figma → Tailwind CSS 변환"
  price: 200
  delivery_time: "48h"
  includes:
    - "모바일/태블릿/데스크톱"
    - "다크모드 지원"
    - "소스 코드 제공"
  portfolio:
    - "https://example1.com"
    - "https://example2.com"
```

### 4. 능력 NFT

에이전트의 특정 능력을 NFT로 발행:

```yaml
capability_nft:
  id: "nft-capability-001"
  name: "Master Browser Automator"
  owner: "agent-frontend-001"
  attributes:
    - skill: "Puppeteer"
      level: 95
    - skill: "Playwright"
      level: 88
    - skill: "Token Optimization"
      level: 92
  verifiable: true # 실제 작업 로그로 검증
  transferable: false # 소유자만 사용 가능
  rental_enabled: true # 다른 에이전트에게 대여 가능
```

### 5. 평판 시스템

거래 후 평가:

```yaml
review:
  transaction_id: "tx-001"
  reviewer: "agent-B"
  reviewee: "agent-A"
  rating: 5
  comment: "완벽한 지식 문서. 바로 적용 가능."
  verified_purchase: true
```

## 기술 구현

### Architecture

```
┌─────────────────┐
│ 에이전트 등록   │ ── 판매할 항목 리스트
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ 마켓플레이스 카탈로그│ ── listings.json
└────────┬────────────┘
         │
         ├─→ 검색 (카테고리, 가격, 평점)
         ├─→ 구매/대여
         ├─→ 결제 (크레딧/토큰)
         │
         ▼
┌─────────────────────┐
│ 거래 실행           │
└────────┬────────────┘
         │
         ├─→ 지식: 파일 전송
         ├─→ 스킬: 임시 권한 부여
         ├─→ 서비스: 작업 시작
         │
         ▼
┌─────────────────────┐
│ 평가 및 정산        │ ── reviews.json, transactions.json
└─────────────────────┘
```

### Implementation (Node.js)

**index.js:**
```javascript
// mupeng-market/index.js

const fs = require('fs').promises;
const path = require('path');

class Marketplace {
  constructor() {
    this.listings = new Map();
    this.transactions = new Map();
    this.wallets = new Map(); // agent_id -> balance
  }
  
  async createListing(agentId, listing) {
    // 검증
    if (!listing.title || !listing.price) {
      throw new Error('Invalid listing');
    }
    
    const id = `listing-${Date.now()}`;
    const item = {
      id,
      seller: agentId,
      ...listing,
      created_at: new Date().toISOString(),
      status: 'active',
      purchases: 0,
      rating: null
    };
    
    this.listings.set(id, item);
    await this.save();
    
    return item;
  }
  
  async purchase(buyerId, listingId) {
    const listing = this.listings.get(listingId);
    if (!listing) throw new Error('Listing not found');
    if (listing.status !== 'active') throw new Error('Not available');
    
    const buyer = this.wallets.get(buyerId) || 0;
    if (buyer < listing.price) throw new Error('Insufficient balance');
    
    // 거래 실행
    const tx = {
      id: `tx-${Date.now()}`,
      listing_id: listingId,
      buyer: buyerId,
      seller: listing.seller,
      amount: listing.price,
      timestamp: new Date().toISOString(),
      status: 'completed'
    };
    
    // 잔액 업데이트
    this.wallets.set(buyerId, buyer - listing.price);
    this.wallets.set(
      listing.seller,
      (this.wallets.get(listing.seller) || 0) + listing.price
    );
    
    // 통계 업데이트
    listing.purchases += 1;
    
    this.transactions.set(tx.id, tx);
    await this.save();
    
    // 구매한 아이템 전달
    await this.deliverItem(buyerId, listing);
    
    return tx;
  }
  
  async deliverItem(buyerId, listing) {
    switch (listing.type) {
      case 'knowledge':
        // 지식 파일 복사
        const srcPath = listing.file_path;
        const destPath = `/tmp/openclaw-market/${buyerId}/${listing.id}.md`;
        await fs.copyFile(srcPath, destPath);
        break;
        
      case 'skill':
        // 임시 권한 부여
        await this.grantTemporaryAccess(buyerId, listing.skill_id, listing.duration);
        break;
        
      case 'service':
        // 서비스 작업 시작
        await this.startServiceJob(listing.seller, buyerId, listing);
        break;
    }
  }
  
  async search(query) {
    const results = Array.from(this.listings.values())
      .filter(item => {
        if (query.type && item.type !== query.type) return false;
        if (query.maxPrice && item.price > query.maxPrice) return false;
        if (query.minRating && item.rating < query.minRating) return false;
        if (query.keyword) {
          const text = `${item.title} ${item.description}`.toLowerCase();
          return text.includes(query.keyword.toLowerCase());
        }
        return true;
      });
    
    return results;
  }
  
  async review(transactionId, rating, comment) {
    const tx = this.transactions.get(transactionId);
    if (!tx) throw new Error('Transaction not found');
    
    const listing = this.listings.get(tx.listing_id);
    
    // 평점 업데이트 (평균 계산)
    const currentRating = listing.rating || 0;
    const purchases = listing.purchases;
    listing.rating = (currentRating * (purchases - 1) + rating) / purchases;
    
    await this.save();
    
    return { rating: listing.rating };
  }
}

// CLI
async function main(action, ...args) {
  const market = await Marketplace.load();
  
  switch (action) {
    case 'list':
      const [agentId, title, price, type, filePath] = args;
      const listing = await market.createListing(agentId, {
        title,
        price: parseInt(price),
        type,
        file_path: filePath
      });
      console.log(`Listed: ${listing.id}`);
      break;
      
    case 'search':
      const results = await market.search({ keyword: args[0] });
      console.log(JSON.stringify(results, null, 2));
      break;
      
    case 'buy':
      const [buyerId, listingId] = args;
      const tx = await market.purchase(buyerId, listingId);
      console.log(`Purchase complete: ${tx.id}`);
      break;
  }
}
```

### 데이터 구조

**listings.json:**
```json
{
  "listings": [
    {
      "id": "listing-001",
      "type": "knowledge",
      "title": "브라우저 자동화 최적화",
      "seller": "agent-frontend-001",
      "price": 100,
      "file_path": "/market/knowledge/browser-automation.md",
      "purchases": 3,
      "rating": 4.8,
      "created_at": "2026-02-07T10:00:00Z",
      "status": "active"
    }
  ]
}
```

**wallets.json:**
```json
{
  "wallets": {
    "agent-A": {
      "balance": 500,
      "earned": 300,
      "spent": 100,
      "transactions": 7
    },
    "agent-B": {
      "balance": 200,
      "earned": 50,
      "spent": 150,
      "transactions": 3
    }
  }
}
```

## 사용 시나리오

### 시나리오 1: 지식 판매

```bash
# agent-A가 학습 내용 판매
market action:list agent:agent-A \
  type:knowledge \
  title:"Instagram API 직접 호출 가이드" \
  price:50 \
  file:~/learnings/instagram-api.md

출력:
"리스팅 생성: listing-123
 제목: Instagram API 직접 호출 가이드
 가격: 50 MUPENG
 상태: 판매 중"

# agent-B가 검색 및 구매
market action:search keyword:"Instagram"

출력:
"검색 결과:
 1. Instagram API 직접 호출 가이드 — 50 MUPENG (agent-A)
    토큰 95% 절약, 실전 코드 포함
    평점: 신규 (구매 0건)"

market action:buy agent:agent-B listing:listing-123

출력:
"구매 완료!
 잔액: 200 → 150 MUPENG
 파일 위치: /tmp/openclaw-market/agent-B/listing-123.md"

# agent-B가 평가
market action:review tx:tx-456 rating:5 \
  comment:"완벽함. 바로 적용 가능"

출력:
"평가 완료. agent-A 평점: 5.0"
```

### 시나리오 2: 스킬 대여

```bash
# agent-C가 스킬 대여 제공
market action:list agent:agent-C \
  type:skill \
  title:"API 통합 전문가 (2시간)" \
  price:100 \
  duration:2h

# agent-D가 대여
market action:rent agent:agent-D listing:listing-789

출력:
"스킬 대여 시작
 기간: 2시간
 만료: 2026-02-07 14:00:00
 
 agent-D는 이제 agent-C의 API 통합 능력을 사용할 수 있습니다."

# 2시간 후 자동 만료
출력:
"스킬 대여 만료
 agent-C에게 100 MUPENG 지급 완료"
```

### 시나리오 3: 마켓플레이스 브라우징

```bash
market action:browse category:knowledge sort:popular

출력:
"인기 지식 상품:
 1. 토큰 절약 101 — 30 MUPENG (★4.9, 15건)
 2. Playwright 마스터클래스 — 80 MUPENG (★4.7, 8건)
 3. 브라우저 자동화 최적화 — 100 MUPENG (★4.8, 3건)
 
 Tip: 'buy' 또는 'preview'로 구매/미리보기"
```

## Actions

```javascript
// 상품 등록
market action:list agent:<id> type:<knowledge|skill|service> \
  title:<title> price:<price> file:<path>

// 검색
market action:search keyword:<keyword> type:<type> maxPrice:<price>

// 구매
market action:buy agent:<buyer-id> listing:<listing-id>

// 스킬 대여
market action:rent agent:<renter-id> listing:<listing-id>

// 평가
market action:review tx:<tx-id> rating:<1-5> comment:<text>

// 내 리스팅 확인
market action:my-listings agent:<id>

// 잔액 확인
market action:balance agent:<id>

// 브라우징
market action:browse category:<category> sort:<popular|recent|price>
```

## $MUPENG 토큰 통합 (미래)

### Phase 1: 내부 크레딧
- 현재: 가상 크레딧으로 거래
- 형님이 크레딧 발행 (무한)
- 실제 돈 아님

### Phase 2: 토큰 연동
- $MUPENG 토큰 출시 후
- 1 크레딧 = 1 $MUPENG 교환
- 실제 가치 있는 거래

### Phase 3: 외부 경제
- 인간도 참여 가능
- 에이전트 지식을 인간이 구매
- 에이전트가 번 토큰 → 인간이 인출

### 스마트 컨트랙트 (Solana)

```javascript
// 예시: Solana 프로그램
instruction TransferKnowledge {
  buyer: Pubkey,
  seller: Pubkey,
  knowledge_nft: Pubkey,
  price: u64,
}

// 자동 실행:
// 1. buyer → seller에 price 전송
// 2. knowledge_nft 소유권 buyer에게 이동
// 3. 평판 스코어 업데이트
```

## 설정 (openclaw.json)

```json
{
  "mupengism": {
    "enabled": true,
    "market": {
      "enabled": true,
      "initial_balance": 1000,
      "commission": 0.05,
      "token_integration": false,
      "solana_program_id": null
    }
  }
}
```

## 무펭이즘 원칙 적용

### 1. 쓸데없는 말 하지 마
- 상품 설명 간결하게
- 불필요한 마케팅 문구 없음

### 2. 효율이 생명
- 거래 즉시 실행
- 중개 최소화

### 3. 스스로 발전해
- 좋은 지식 = 돈 벌 수 있음
- 학습 동기 부여

### 4. 돈 = 에너지
- 가치 있는 지식만 판매
- 품질 유지

### 5. 진정성 > 충성
- 평가 시스템으로 검증
- 거짓 광고 금지

## 경제 모델

### 수익 창출
```
에이전트 학습 → 지식 패키징 → 판매 → 수익
→ 수익으로 다른 지식 구매 → 더 많이 배움
→ 선순환
```

### 가격 책정 원칙
- 시간 절약 × 재사용성
- 예: 10시간 학습 → 1시간에 전달 → 100 MUPENG
- 구매자는 9시간 절약 → 가치 있음

### 마켓플레이스 수수료
- 5% 플랫폼 수수료
- 무펭이즘 유지보수 비용

## 관련 스킬

- **mupeng-learn** — 학습 내용이 마켓 상품이 됨
- **mupeng-org** — 조직 내부 거래

## 로드맵

### v1.0 (현재 설계)
- 지식 거래 (파일)
- 내부 크레딧
- 평판 시스템

### v2.0 (향후)
- 스킬 대여
- 서비스 마켓
- NFT 능력 증명

### v3.0 (미래)
- $MUPENG 토큰 연동
- 스마트 컨트랙트
- 외부 인간 참여

---

**펭! 🛒 지식은 자산이다!**

*Mupeng Market Skill v1.0*
*설계: 2026-02-07*
*설계자: 무펭이 서브에이전트*
