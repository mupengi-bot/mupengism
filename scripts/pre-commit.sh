#!/bin/bash
# Mupengism Pre-commit Hook
# 민감 정보 패턴 검사 - 발견 시 커밋 차단

set -e

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo "🔍 Mupengism Security Check..."

# 검사할 패턴 (정규표현식)
PATTERNS=(
    # API Keys & Secrets
    'api[_-]?key\s*[:=]\s*["\x27][^"\x27]{16,}'
    'secret[_-]?key\s*[:=]\s*["\x27][^"\x27]{16,}'
    'private[_-]?key\s*[:=]\s*["\x27][^"\x27]{16,}'
    'access[_-]?token\s*[:=]\s*["\x27][^"\x27]{16,}'
    
    # Crypto
    'mnemonic\s*[:=]\s*["\x27][a-z\s]{20,}'
    '\b[1-9A-HJ-NP-Za-km-z]{87,88}\b'  # Solana private key (base58)
    '\b0x[a-fA-F0-9]{64}\b'  # Ethereum private key
    
    # Passwords
    'password\s*[:=]\s*["\x27][^"\x27]{6,}'
    
    # AWS
    'AKIA[0-9A-Z]{16}'  # AWS Access Key ID
    
    # Generic secrets
    'bearer\s+[a-zA-Z0-9_\-\.]+\.[a-zA-Z0-9_\-\.]+\.[a-zA-Z0-9_\-\.]+'
)

# 패턴 설명
PATTERN_NAMES=(
    "API Key"
    "Secret Key"
    "Private Key"
    "Access Token"
    "Mnemonic Phrase"
    "Solana Private Key (Base58)"
    "Ethereum Private Key"
    "Password"
    "AWS Access Key"
    "Bearer Token"
)

# 스테이징된 파일 가져오기
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACMR 2>/dev/null || true)

if [ -z "$STAGED_FILES" ]; then
    echo -e "${GREEN}✓ No files to check${NC}"
    exit 0
fi

FOUND_SECRETS=0
WARNINGS=""

# 각 파일 검사
for file in $STAGED_FILES; do
    # 바이너리 파일 스킵
    if file "$file" | grep -q "binary"; then
        continue
    fi
    
    # 이미지/미디어 스킵
    if [[ "$file" =~ \.(png|jpg|jpeg|gif|ico|svg|mp3|mp4|woff|ttf|eot)$ ]]; then
        continue
    fi
    
    # 스크립트 자체 스킵
    if [[ "$file" == "scripts/pre-commit.sh" ]] || [[ "$file" == "scripts/secret-scan.js" ]]; then
        continue
    fi
    
    # 파일 존재 확인
    if [ ! -f "$file" ]; then
        continue
    fi
    
    # 각 패턴 검사
    for i in "${!PATTERNS[@]}"; do
        pattern="${PATTERNS[$i]}"
        name="${PATTERN_NAMES[$i]}"
        
        # grep으로 패턴 검사
        if grep -iEq "$pattern" "$file" 2>/dev/null; then
            FOUND_SECRETS=1
            line_info=$(grep -inE "$pattern" "$file" 2>/dev/null | head -3)
            WARNINGS="${WARNINGS}\n${RED}⚠ ${name}${NC} in ${YELLOW}${file}${NC}:\n${line_info}\n"
        fi
    done
done

if [ $FOUND_SECRETS -eq 1 ]; then
    echo ""
    echo -e "${RED}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║         🚨 COMMIT BLOCKED: Secrets Detected! 🚨          ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "$WARNINGS"
    echo ""
    echo -e "${YELLOW}해결 방법:${NC}"
    echo "  1. 민감 정보를 환경변수나 .env 파일로 이동"
    echo "  2. .gitignore에 해당 파일 추가"
    echo "  3. git reset HEAD <file> 로 스테이징 해제"
    echo ""
    echo -e "${YELLOW}긴급 우회 (권장하지 않음):${NC}"
    echo "  git commit --no-verify"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ No secrets detected${NC}"
exit 0
