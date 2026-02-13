---
author: 무펭이 🐧
---

# 크몽 자동화 스킬 🐧

## 가입 프로세스 (OpenClaw 브라우저)

### 1. 회원가입
```
1. browser open → https://kmong.com
2. 회원가입 클릭 (ref: 회원가입 링크)
3. 구글 로그인 선택 (구글 로고 버튼)
4. 구글 계정 선택 → "계속" 클릭
5. "전문가로 활동" 선택
6. 전체 동의 체크 → "가입완료"
```

### 2. 본인인증 (PASS SMS)
```
1. "휴대폰 본인인증" 클릭 → 팝업 탭 열림
2. 팝업 탭 targetId 확인 (tabs 조회)
3. 통신사 라디오 선택: evaluate로 클릭
   - document.querySelectorAll('input[type=radio]')[0].click()  // SKT
   - [1] = KT, [2] = LGU+
4. 전체동의: document.querySelectorAll('input[type=checkbox]')[0].click()
5. "문자(SMS)로 인증하기" 클릭
6. 이름, 생년월일(6자리), 주민번호 7번째, 전화번호, 보안문자 입력
7. 보안문자는 screenshot으로 읽기
8. "확인" → SMS 인증번호 입력 → "확인"
9. 메인 탭에서 판매 약관 동의 → "전문가 등록 완료"
```

### 3. 주의사항
- 체크박스 ref가 안 먹을 때: `evaluate`로 `document.querySelectorAll('input[type=checkbox]')[0].click()`
- `const`/`let` 사용 불가 — `var` 또는 선언 없이 사용
- 세미콜론으로 여러 문장 연결 불가 — 한 문장씩 evaluate
- PASS 인증 팝업은 별도 탭 — tabs 조회로 targetId 확인 필요
- 보안문자(캡차)는 screenshot 찍어서 이미지로 읽기

### 4. 프로필 설정
```
1. 닉네임 변경: "편집" 버튼 → 텍스트 전체선택(Meta+a) → 새 닉네임 입력 → "저장"
2. 전문분야: "서비스를 제공할 분야를 선택하세요" 클릭
3. 소개: "소개 작성하기" 클릭
4. 서비스 등록: "서비스 등록하기" 클릭
```

### 5. 서비스 등록 팁
- 제목: SEO 키워드 포함 (예: "AI 챗봇 개발 | 학생회 조직 관리 자동화")
- 가격: 3단계 (스탠다드/디럭스/프리미엄)
- 설명: 500자 이상, 구체적 결과물 명시
- 카테고리: IT·프로그래밍 > 챗봇 개발 / 업무 자동화

## 계정 정보
- 이메일: Configure in `~/.secrets/kmong.env`
- 닉네임: Configure in workspace settings
- 프로필: https://kmong.com/@[your-username]

---
> 🐧 Built by **무펭이** — [무펭이즘(Mupengism)](https://github.com/mupeng) 생태계 스킬
