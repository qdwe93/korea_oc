# CLAUDE.md — 코리아유화 홈페이지 유지보수 가이드

> 이 파일은 새 AI 세션(또는 사람)이 이 프로젝트를 유지보수할 때 가장 먼저 읽는 문서다.
> Claude Code로 이 폴더에서 세션을 열면 자동 로드된다. 최근 갱신: 2026-07-07.

## 1. 이 프로젝트가 뭔가

부산 소재 **코리아유화주식회사(KOREA OIL CHEMICAL CO.,LTD, 대표 서용환)** 의 공식 홈페이지.
액체연료 및 관련제품 도매업(B2B). 목적은 "거래처·기관이 검색해서 신뢰를 확인하는 디지털 명함".

- **정적 사이트다.** 서버 코드·DB·빌드 도구 없음. 순수 HTML/CSS + 최소 JS.
- **동적 기능을 추가하지 마라.** 의뢰인이 명시적으로 "동적 필요 없다"고 했다. 문의 폼조차 `tel:`/`mailto:` 직링크로 대체했다(유류 B2B는 전화 거래 관행 + 스팸/서버 관리 부담 제거).
- **4개국어**: 한국어(루트) + 영어(`en/`) + 일본어(`ja/`) + 중국어 간체(`zh/`), 각 4페이지 = 총 16페이지.

## 2. 폴더 구조

```
site/                  ← 배포 대상 (FTP 업로드 루트). 이 안이 곧 웹사이트다.
  index/about/business/contact.html   한국어 4페이지
  en/ ja/ zh/          각 언어별 같은 4페이지
  css/style.css        디자인 시스템 전체 (단일 파일)
  js/main.js           유일한 스크립트 (햄버거 메뉴 + 이미지 랜덤 로테이션)
  assets/images/       웹용 최적화 이미지 (종류별 변형 _1.._n)
  assets/logo.svg  assets/favicon.svg
  robots.txt  sitemap.xml
assets/reference/      기존 사이트에서 수집한 원본 (배포 제외, 참고용)
assets/images/         생성 이미지 "원본" (git 제외, 대용량) — 최적화 전 소스
tests/                 Playwright 스모크·콘텐츠 가드·링크 체커·정적 서버
tools/optimize-images.ps1   원본→웹용 이미지 최적화 스크립트
docs/                  기획 문서 (01 사전조사 / 02 기획 / 03 PRD / 04 이미지목록)
TODOs.md               진행상황·결정로그·대기 항목 (작업 후 갱신할 것)
```

## 3. 절대 어기면 안 되는 규칙 (Invariants)

이걸 어기면 테스트가 실패하거나 사업에 실질적 피해가 간다.

1. **연락처를 함부로 바꾸지 마라.** `서용환`, `051-816-2726`, `051-816-2728`(FAX), `koreaoil@koreaoilchem.com`, 주소(`부산 동구 초량3동 1154-1 서남빌딩 502호`)는 `tests/content.spec.js`가 모든 페이지에서 문자열로 검증한다. 해외 페이지는 국제 표기(`+82-51-816-2726`, 영문 주소). **실제 정보가 바뀐 게 확인된 경우에만** 수정하고, 이때 테스트의 기대값도 함께 고친다.
2. **콘텐츠는 4개 언어를 동시에 반영하라.** 한국어(`site/*.html`)가 원본, en/ja/zh는 번역본이다. 하나만 고치면 언어별로 내용이 어긋난다.
3. **이미지 변형 개수와 `site/js/main.js`의 `VARIANTS`를 일치시켜라.** 예: `biz-fuel_1.jpg`~`biz-fuel_4.jpg`가 있으면 VARIANTS에 `'biz-fuel': 4`. 파일을 추가/삭제하면 이 숫자를 함께 바꾼다. `tests/check-links.mjs`가 선언과 실제 파일을 대조하므로 어긋나면 테스트가 잡는다.
   - 현재: hero-main 4, about-visual 4, about-greeting 3, biz-fuel 4, biz-marine 4, biz-chem 4.
4. **CSS `--img` 변수에는 절대 URL만 주입하라.** (`js/main.js`가 이미 그렇게 처리) 커스텀 프로퍼티 안의 상대 `url()`은 문서가 아니라 스타일시트(`/css/`) 기준으로 해석돼 루트 페이지에서 404가 난다. 과거 실제로 터진 버그이며 회귀 테스트가 있다.
5. **`word-break: keep-all`은 한국어에만.** ja/zh에 적용하면 줄바꿈이 막혀 모바일 가로 스크롤이 생긴다. CSS에서 `body:lang(ko)`로 한정되어 있다.
6. **DNS/호스팅을 건드릴 땐 MX 레코드를 보존하라.** `mail.koreaoilchem.com` 메일이 운영 중이다. SSL 발급·호스팅 이전 시 메일이 죽지 않게 반드시 확인.
7. **미리보기(GitHub Pages) 배포본의 robots.txt는 색인 차단이어야 한다.** `deploy-preview.yml`이 배포 시 `Disallow: /`로 덮어쓴다(레포 소스의 production robots.txt는 색인 허용 유지). github.io 미리보기가 검색에 잡혀 실제 도메인과 경쟁하는 것을 막기 위함.
8. **대표 얼굴을 AI로 생성하지 마라.** 실사진만 사용. 신뢰 목적에 반한다.
9. **YAML `run:` 값에 따옴표 없는 `콜론+공백`을 넣지 마라.** GitHub 파서가 매핑으로 오인해 워크플로 전체가 파싱 실패한다(실제로 터졌던 버그). 여러 줄이거나 콜론이 있으면 `run: |` 블록 스칼라로 감싼다.

## 4. 자주 하는 작업 (레시피)

### 텍스트/문안 수정
- 한국어 파일을 고친 뒤 **en/ja/zh 같은 위치도 반영**. → `npm test` → 커밋.
- ja/zh 번역은 배포 전 원어민 감수 권장(TODOs.md에 명시됨).

### 이미지 교체·추가
1. 새 원본을 `assets/images/`(루트, git 제외)에 `종류_n.jpeg` 형식으로 넣는다.
2. `tools/optimize-images.ps1` 실행 → `site/assets/images/종류_n.jpg`로 규격 리사이즈·압축(JPEG 80).
3. 변형 **개수가 바뀌었으면** `site/js/main.js`의 `VARIANTS` 숫자 수정 (규칙 3).
4. `npm test`로 링크 체커 통과 확인 → 커밋.
- 종류 키: `hero-main`(1920w), `about-visual`(1600w), `biz-fuel`/`biz-marine`/`biz-chem`(1200w), `about-greeting`(800w). OG 이미지는 스크립트가 hero-main_1에서 1200×630으로 크롭 생성.

### 페이지에 이미지 배경 넣기
`<section>`이나 `<div>`에 `data-img="종류키"` 속성을 주면 js가 접속마다 변형 중 하나를 랜덤 배경으로 넣는다. CSS엔 `var(--img, url("...기본_1.jpg"))` 폴백이 걸려 있어 JS/파일 없어도 안 깨진다.

### 확정 정보 채우기 (대기 중)
아직 `[확인필요]` HTML 주석으로 남은 것: 사업자등록번호(푸터), 설립연도(개요 표), 도로명 주소, 대중교통 상세. 배포 전 `grep -rn "확인필요" site` 로 잔존 확인.

### 페이지 추가
16페이지가 헤더/푸터를 복붙 공유한다(정적이라 공통 템플릿 엔진 없음). 새 페이지는 기존 페이지를 복사해 시작하고, **GNB·언어전환 링크·sitemap.xml·hreflang**을 4개 언어 모두에 반영. 헤더/푸터를 바꾸면 16개 파일 전부 손대야 하니, 대규모 변경 시 스크립트로 일괄 치환을 고려.

## 5. 테스트·미리보기·배포

```bash
npm install && npx playwright install chromium   # 최초 1회
npm test        # html-validate → 링크·이미지 무결성 → Playwright (83 케이스)
npm run serve   # 로컬 미리보기 http://127.0.0.1:4173
```
- **커밋 전 항상 `npm test`.** 커밋은 테스트 통과 시점에 한다(바이브 MVP 4단계 규칙).
- **CI**: `master` 푸시·PR마다 `.github/workflows/test.yml`이 위 테스트를 자동 실행.
- **미리보기 배포**: 푸시하면 `deploy-preview.yml`이 `site/`를 GitHub Pages에 올린다 → **https://qdwe93.github.io/korea_oc/** (검수 전용, 색인 차단).
- **실제 배포(미완)**: 최종 목적지는 호스팅 `koreaoilchem.com`. FTP 접속정보(GAUTECH 계정) 확보 후 `site/` 내용 업로드 → SSL 적용(MX 보존!) → 네이버 서치어드바이저·구글 서치콘솔 등록. 체크리스트는 `docs/02-기획서.md` §6.
- **GitHub API 작업이 필요할 때**: `gh` CLI는 미설치. 저장소가 이미 인증돼 있어 `git credential fill`로 토큰을 얻어 REST API를 호출할 수 있다(과거 Pages 활성화에 사용). 토큰은 로그에 출력하지 말 것.

## 6. 더 읽을 것

- `TODOs.md` — 현재 대기 항목, **결정 로그(왜 이렇게 했는지)**, 주의사항. 작업하면 여기부터 갱신.
- `docs/02-기획서.md` — 형태·기술 선택의 판단 근거 전체, 배포 체크리스트.
- `docs/03-PRD.md` — 페이지별 요구사항, 디자인 시스템 값, 미해결 질문(Q1~Q7).
- `docs/01-사전조사.md` — 회사 정보 출처, 확정/미확정 구분.
- `docs/04-이미지-준비목록.md` — 이미지 규격과 생성 프롬프트.
