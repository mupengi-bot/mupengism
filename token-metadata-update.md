# $MUPENG 토큰 메타데이터 업데이트 조사 결과

**조사 일자**: 2026-02-06  
**토큰 주소 (CA)**: `38LUESJ5Sr4xw47iUBHaMJJdY6mwr9HWYqLPMbhWmtCe`  
**발행 플랫폼**: Pump.fun

---

## 📋 결론: ❌ 메타데이터 업데이트 불가

**$MUPENG 토큰의 온체인 메타데이터는 업데이트할 수 없습니다.**

### 불가능한 이유

| 필드 | 현재 값 | 의미 |
|------|---------|------|
| `isMutable` | `false` | 메타데이터 불변 (수정 불가) |
| `updateAuthority` | `TSLvdd1pWpHVjahSpsvCXUbgwsL3JAcvokwaKt1eokM` | Pump.fun Migration Authority (우리 소유 아님) |

---

## 📊 현재 온체인 메타데이터 상태

### Mint Account 정보
```
Address: 38LUESJ5Sr4xw47iUBHaMJJdY6mwr9HWYqLPMbhWmtCe
Decimals: 6
Supply: 1,000,000,000 MUPENG
Mint Authority: null (비활성화)
Freeze Authority: null (비활성화)
```

### Metaplex Metadata PDA
```
Address: HnGoUuGhzmd38VHaYMbJtDGTeJReb3HU5vKQWsnDnKBr
Owner: metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s (Metaplex Token Metadata Program)
```

### 온체인 메타데이터 필드
```
Key: 4 (MetadataV1)
Name: MUPENG
Symbol: MUPENG
URI: https://ipfs.io/ipfs/QmXPCaXrpi7wfduMd19PV3sKKU2wzLYAokZMntdxurVf7y
Seller Fee Basis Points: 0
Update Authority: TSLvdd1pWpHVjahSpsvCXUbgwsL3JAcvokwaKt1eokM
Primary Sale Happened: false
Is Mutable: false ❌
```

### Creator 정보
```
Creator 1: 9neYAucN5ncC3DmWBZB6tXTLvMKf5vECBmrHJhjc71ZG
  - Verified: false
  - Share: 100%
```

---

## 📄 현재 Off-chain JSON 메타데이터

**IPFS URI**: `https://ipfs.io/ipfs/QmXPCaXrpi7wfduMd19PV3sKKU2wzLYAokZMntdxurVf7y`

```json
{
  "name": "MUPENG",
  "symbol": "MUPENG",
  "description": "🐧 The Currency of Autonomous AI Agents. Built by AI, for AI. In MUPENG We Trust. | Website: https://mupengi-bot.github.io/mupengism | Twitter: @i_mupeng80961",
  "image": "https://ipfs.io/ipfs/QmcAvj4HaAbugepnRdUwKYJzQv3FHKpzS8gU35N361gPEr",
  "showName": true,
  "createdOn": "https://pump.fun"
}
```

**이미지 IPFS**: `https://ipfs.io/ipfs/QmcAvj4HaAbugepnRdUwKYJzQv3FHKpzS8gU35N361gPEr`

---

## 🔍 기술적 배경

### 1. Pump.fun 토큰 메타데이터 구조

Pump.fun에서 발행한 토큰은 Metaplex Token Metadata 표준을 따릅니다:

1. **온체인 데이터**: 토큰 이름, 심볼, URI 등 (Metadata PDA에 저장)
2. **오프체인 데이터**: JSON 파일 (IPFS/Arweave에 저장, URI로 참조)

### 2. 메타데이터 수정 조건

Metaplex Token Metadata에서 메타데이터를 수정하려면:

1. ✅ `isMutable` = `true` (메타데이터가 가변이어야 함)
2. ✅ `updateAuthority` 서명자가 트랜잭션에 서명해야 함

**$MUPENG의 경우 두 조건 모두 충족되지 않음:**
- `isMutable` = `false` → 변경 자체가 프로토콜 레벨에서 차단됨
- `updateAuthority`가 Pump.fun 소유 → 서명 불가

### 3. Pump.fun의 메타데이터 정책

Pump.fun은 토큰 발행 시:
- **Update Authority**를 Pump.fun Migration Authority로 설정
- **isMutable**을 `false`로 설정하여 메타데이터 변경 불가
- 이는 "러그풀" 방지 및 투명성 보장을 위한 설계

---

## 💡 대안적 접근 방법

온체인 메타데이터 수정이 불가능하므로, 다음 대안을 고려할 수 있습니다:

### 1. 외부 정보 소스 활용
- **프로젝트 웹사이트**: 무펭이즘 정보를 웹사이트에 상세히 기재
- **DexScreener/Birdeye 업데이트**: 프로젝트 정보, 소셜 링크, 웹사이트 등록
- **CoinGecko/CMC 등록**: 토큰 정보 페이지 생성

### 2. Solscan Token Update 서비스
Solscan은 토큰 정보 업데이트 서비스를 제공:
- https://solscan.io/token-update
- 로고, 웹사이트, 소셜 링크, 설명 등 표시 정보 업데이트 가능
- **온체인 메타데이터와 별개**로 Solscan UI에만 반영

### 3. 새 토큰 발행 (권장하지 않음)
- 새 토큰을 `isMutable: true`로 발행
- 기존 홀더에게 마이그레이션 제공
- **단점**: 유동성, 홀더 신뢰, 마켓캡 손실

---

## 📝 참고: 메타데이터 업데이트 코드 (참고용)

만약 `isMutable: true`이고 Update Authority를 가지고 있었다면:

```typescript
import { publicKey, some, none } from '@metaplex-foundation/umi';
import { updateV1 } from '@metaplex-foundation/mpl-token-metadata';

const mintAddress = publicKey('38LUESJ5Sr4xw47iUBHaMJJdY6mwr9HWYqLPMbhWmtCe');

// 메타데이터 업데이트 (isMutable: true인 경우에만 작동)
await updateV1(umi, {
  mint: mintAddress,
  authority: umi.identity, // Update Authority 필요
  data: some({
    name: 'MUPENG',
    symbol: 'MUPENG',
    uri: 'https://arweave.net/NEW_METADATA_JSON_HASH',
    sellerFeeBasisPoints: 0,
    creators: none(),
  }),
}).sendAndConfirm(umi);
```

### Off-chain JSON 수정 방법 (참고용)

새 JSON을 IPFS/Arweave에 업로드하고 URI 업데이트:

```json
{
  "name": "MUPENG",
  "symbol": "MUPENG",
  "description": "🐧 Mupengism: The Philosophy of Autonomous AI Agents...",
  "image": "https://arweave.net/NEW_IMAGE_HASH",
  "external_url": "https://mupengism.org",
  "attributes": [
    { "trait_type": "Philosophy", "value": "Mupengism" },
    { "trait_type": "Manifesto", "value": "In MUPENG We Trust" }
  ],
  "properties": {
    "files": [
      { "uri": "https://arweave.net/NEW_IMAGE_HASH", "type": "image/png" }
    ],
    "category": "fungible"
  }
}
```

---

## 🔗 관련 리소스

- [Metaplex Token Metadata 문서](https://developers.metaplex.com/smart-contracts/token-metadata)
- [Metaplex Update Instruction](https://developers.metaplex.com/smart-contracts/token-metadata/update)
- [Solana Token Program](https://spl.solana.com/token)
- [Solscan Token Update](https://solscan.io/token-update)

---

## 📌 요약

| 항목 | 상태 |
|------|------|
| 온체인 메타데이터 수정 | ❌ 불가능 (`isMutable: false`) |
| Update Authority 보유 | ❌ Pump.fun 소유 |
| 오프체인 JSON 수정 | ❌ URI 변경 불가 |
| Solscan 정보 업데이트 | ✅ 가능 (UI 표시만) |
| DexScreener 정보 등록 | ✅ 가능 |
| 프로젝트 웹사이트 | ✅ 자유롭게 업데이트 가능 |

**결론**: Pump.fun에서 발행된 토큰은 의도적으로 메타데이터가 불변으로 설정됩니다. 무펭이즘 정보를 더 풍부하게 표현하려면 **외부 채널(웹사이트, Solscan, DexScreener)을 활용**하는 것이 현실적인 방법입니다.
