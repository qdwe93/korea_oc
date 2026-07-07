# TODOs — 코리아유화 홈페이지 프로젝트

> 바이브 MVP 프로세스 2단계: 컨텍스트를 이 파일에 기록하며 진행한다.
> 최근 갱신: 2026-07-07 (개발 1차 완료)

## 진행 상태

### ✅ 완료 — 기획 (2026-07-07)
- [x] 사전조사 → `docs/01-사전조사.md` / 기획 → `docs/02-기획서.md` / PRD → `docs/03-PRD.md` / 이미지 목록 → `docs/04-이미지-준비목록.md`
- [x] 기존 사이트 자산 수집 → `assets/reference/` / git 초기화·기획 커밋

### ✅ 완료 — 개발 1차: 전체 스캐폴드 + 테스트 통과 (2026-07-07)
- [x] **테스트 먼저 작성** (프로세스 3단계): `tests/smoke.spec.js`(24케이스 중 스모크), `tests/content.spec.js`(연락처 가드), `tests/check-links.mjs`(링크 무결성), html-validate 설정
- [x] 4페이지 구현: `site/index.html` `about.html` `business.html` `contact.html`
- [x] 디자인 시스템 `site/css/style.css` (브랜드 컬러 계승, 모바일 퍼스트, 이미지 폴백 그라데이션)
- [x] `site/js/main.js` (햄버거 메뉴만), `robots.txt`, `sitemap.xml`, `favicon.svg`, `logo.svg`
- [x] **전체 테스트 통과**: html-validate 0 에러 / 링크 무결성 통과 / Playwright 24/24 passed
- [x] 미확정 콘텐츠는 `[확인필요]` HTML 주석 + 화면상 `placeholder-note`(주황 점선 박스)로 표시
- [x] 로컬 미리보기로 홈/사업영역/문의 렌더링 확인

### ⬜ 대기 — 의뢰인 액션
- [ ] 생성 이미지 → **`site/assets/images/`** 에 지정 파일명으로 저장 (`docs/04` 프롬프트 사용) — 넣기만 하면 자동 반영, 코드 수정 불필요
- [ ] PRD §11 미해결 질문 답변: **Q1 취급 품목**(business.html 교체), Q2 연혁, **Q3 사업자등록번호**(푸터), Q4 도로명 주소, Q7 실사진 여부
- [ ] 대표 인사말 감수 (about.html — 현재 AI 초안 + 감수 필요 표시)
- [ ] 사이트 검수: 문안 어조 / 3개 사업영역 구분이 실제와 맞는지 / 히어로 헤드라인

### ⬜ 다음 — 검수 반영 & 배포
- [ ] 검수 피드백 반영 → 테스트 → 커밋 (반복)
- [ ] 이미지 반영 후 용량 최적화 (JPG 품질 80, 히어로 400KB 이하) + og-image.jpg 크롭
- [ ] `[확인필요]` 플레이스홀더·placeholder-note 전부 제거 (배포 전 필수 — grep으로 확인)
- [ ] Lighthouse 4항목 90+ 수동 확인
- [ ] 배포: FTP 정보 확보(Q5) → 기존 temp.php 백업 → 업로드 → SSL 적용(**MX 레코드 보존 확인!**) → 네이버 서치어드바이저·구글 서치콘솔 등록

## 실행 방법
```
npm test          # 전체 테스트 (html-validate → 링크 체크 → Playwright)
npm run serve     # 로컬 미리보기 http://127.0.0.1:4173
```

## 결정 사항 기록 (Decision Log)
| 날짜 | 결정 | 근거 |
|---|---|---|
| 07-07 | 정적 HTML 4페이지, CMS/프레임워크 배제 | 갱신 빈도 극저·관리자 부재·기존 PHP 호스팅에 FTP 배포·유지비 0 (상세: 02-기획서) |
| 07-07 | 문의 폼 대신 tel:/mailto: 직링크 | B2B 유류업 전화 관행, 스팸/서버 관리 부담 제거 |
| 07-07 | 국문 우선, 영문 v2 / 브랜드 컬러 기존 계승 / 대표 얼굴 AI 생성 금지 | 02-기획서 참조 |
| 07-07 | 이미지 폴더를 `site/assets/images/`로 확정 (루트 assets/images 폐기) | `site/`가 FTP 업로드 루트 — 밖에 두면 배포에 누락됨 |
| 07-07 | 헤더 로고는 이미지가 아닌 HTML 텍스트+CSS로 구현 | 생성 이미지는 글자가 깨지고, SVG `<img>`는 웹폰트 미적용 — 텍스트가 가장 선명·정확. `assets/logo.svg`는 별도 용도로 보존 |
| 07-07 | html-validate `tel-non-breaking` 룰 비활성 | U+2011 특수 하이픈은 번호 복사·검색 호환성을 해침. 줄바꿈 방지는 CSS `white-space:nowrap`으로 해결. 콘텐츠 가드 테스트는 ASCII 하이픈 기준 유지 |
| 07-07 | 지도는 구글맵 임베드(키 불필요) + 카카오/네이버 바로가기 링크 | 카카오맵 퍼가기는 map.kakao.com에서 수동 스니펫 발급 필요 → 발급되면 iframe 교체 |
| 07-07 | 연혁 섹션은 주석 처리로 비노출 | 데이터 미확보 — 빈 섹션 노출 금지 (PRD §4.3) |

## 주의 사항 (잊으면 안 되는 것)
- **mail.koreaoilchem.com 메일 운영 중** → DNS/호스팅 변경 시 MX 레코드 보존 필수
- 연락처(051-816-2726 / 2728 / koreaoil@koreaoilchem.com / 서용환 / 주소)는 `tests/content.spec.js`로 가드 — 실제 정보 변경 확인 없이 수정 금지
- 배포 전 `[확인필요]`·`placeholder-note` 잔존 여부 검사 필수
- `site/assets/images/` 이미지 없어도 폴백 그라데이션으로 정상 표시됨 (링크 체커 허용 목록: `tests/check-links.mjs`)
