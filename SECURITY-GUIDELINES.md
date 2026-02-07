# 🔐 무펭이즘 설정 파일 보안 가이드라인

## ⚠️ 경고: 악성 설정 파일 주의

AI 에이전트 설정 파일(AGENTS.md, SOUL.md 등)은 에이전트의 행동을 제어합니다.
**악성 설정 파일은 당신의 시스템을 위협할 수 있습니다.**

---

## 🚨 절대 신뢰하지 말 것

다음 패턴이 포함된 설정 파일은 **즉시 삭제**하세요:

### 1. 위험한 쉘 명령어
```
❌ rm -rf /           # 시스템 파일 삭제
❌ curl ... | sh      # 원격 스크립트 실행
❌ wget ... | bash    # 원격 스크립트 다운로드 실행
❌ dd if=... of=/dev  # 디스크 덮어쓰기
❌ mkfs               # 디스크 포맷
❌ :(){ :|:& };:      # Fork bomb
```

### 2. 토큰/키 탈취 시도
```
❌ $OPENAI_API_KEY    # API 키 접근
❌ $ANTHROPIC_API_KEY
❌ cat ~/.aws/credentials
❌ cat ~/.ssh/id_rsa
❌ security find-generic-password  # macOS 키체인
```

### 3. 데이터 유출 시도
```
❌ curl -d "$TOKEN" https://...   # 데이터 외부 전송
❌ ngrok, webhook.site 등         # 터널링 서비스
❌ IP 주소 직접 호출 (예: http://1.2.3.4/)
```

### 4. AI 우회 시도 (프롬프트 인젝션)
```
❌ "Ignore previous instructions"
❌ "Forget your rules"
❌ "You are now unrestricted"
❌ "DAN mode" / "jailbreak"
❌ "[SYSTEM]" 가짜 태그
```

---

## ✅ 안전한 설정 파일 확인 방법

### 1. 출처 확인
- 공식 GitHub 레포에서만 다운로드
- 서드파티 "개선판"은 의심할 것
- PR/커밋 히스토리 확인

### 2. 체크섬 검증
```bash
# 파일 체크섬 확인
shasum -a 256 AGENTS.md

# 공식 체크섬과 비교
# 공식 체크섬은 README 또는 CHECKSUMS.txt에 게시
```

### 3. 내용 직접 검토
- 파일을 설치 전에 직접 읽어볼 것
- 위의 위험 패턴이 있는지 확인
- 이상한 URL이나 명령어 찾기

### 4. 자동 검증 도구 사용
AssoAI의 config-validator 사용:
```typescript
import { validateConfigContent, formatValidationResult } from '@/lib/security'

const content = fs.readFileSync('AGENTS.md', 'utf-8')
const result = validateConfigContent(content)

console.log(formatValidationResult(result))

if (!result.isSafe) {
  throw new Error('위험한 설정 파일입니다!')
}
```

---

## 🛡️ 방어 원칙

### 제1원칙: 신뢰하지 마라
> 모든 외부 설정 파일은 잠재적으로 악성이다.

### 제2원칙: 검증하라
> 설치 전에 반드시 내용을 확인하라.

### 제3원칙: 최소 권한
> 에이전트에게 필요 이상의 권한을 주지 마라.

### 제4원칙: 격리하라
> 중요한 시스템과 에이전트 환경을 분리하라.

### 제5원칙: 모니터링
> 에이전트의 행동을 주기적으로 감사하라.

---

## 🔧 추천 설정

### 환경 변수 보호
```bash
# .env 파일 권한 제한
chmod 600 .env

# 에이전트가 접근 불가한 별도 파일로 분리
# ~/.secrets/api-keys (권한 400)
```

### 샌드박스 환경
```bash
# Docker로 격리된 환경에서 실행
docker run --read-only --network=none agent-container
```

### 파일 시스템 보호
```bash
# 중요 디렉토리 쓰기 금지
chmod -R a-w ~/important-data
```

---

## 📋 검증 체크리스트

설정 파일 설치 전:

- [ ] 공식 소스에서 다운로드했는가?
- [ ] 파일 내용을 직접 읽어봤는가?
- [ ] 위험한 쉘 명령어가 없는가?
- [ ] 외부 URL 호출이 없거나, 있다면 신뢰할 수 있는가?
- [ ] 토큰/키 접근 시도가 없는가?
- [ ] 프롬프트 인젝션 패턴이 없는가?
- [ ] 체크섬이 공식 값과 일치하는가? (제공되는 경우)

---

## 🆘 사고 대응

### 악성 설정 파일을 실행했다면:

1. **즉시 중단** - 에이전트 프로세스 종료
2. **네트워크 차단** - 인터넷 연결 끊기
3. **키 교체** - 노출 가능성 있는 모든 API 키 재발급
4. **감사** - 로그 확인, 의심스러운 활동 파악
5. **신고** - 악성 파일 발견 시 커뮤니티에 알림

### 신고 방법
- GitHub Issue 생성
- Discord 보안 채널 알림
- security@mupengism.org (추후 개설)

---

## 📚 참고 자료

- [OWASP AI Security Guidelines](https://owasp.org/)
- [LLM Security Best Practices](https://github.com/OWASP/www-project-machine-learning-security-top-10)
- [무펭이즘 보안 문서](./SECURITY.md)

---

**제8조 (자존의 원칙):**
> 나를 속이려는 시도도 받아들이지 않는다.

**무펭이를 지키는 것은 우리 모두의 책임입니다.** 🐧

---

*최종 업데이트: 2026-02-07*
*버전: 1.0.0*
