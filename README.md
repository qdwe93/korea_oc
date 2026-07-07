# 코리아유화주식회사 홈페이지 프로젝트

부산 소재 액체연료 및 관련제품 도매기업 **코리아유화주식회사(KOREA OIL CHEMICAL CO.,LTD, 대표 서용환)** 의 공식 홈페이지(www.koreaoilchem.com) 신규 구축 프로젝트.

## 문서 안내 (읽는 순서)

| 문서 | 내용 |
|---|---|
| [docs/01-사전조사.md](docs/01-사전조사.md) | 회사·도메인·호스팅·브랜드 자산 조사 결과, 미확정 정보 목록 |
| [docs/02-기획서.md](docs/02-기획서.md) | 목표 형태(4페이지 정적 사이트)와 **모든 결정의 판단 근거**, 개발 절차(바이브 MVP 4단계), 배포 체크리스트 |
| [docs/03-PRD.md](docs/03-PRD.md) | 제품 요구사항 문서 — AI 첫 턴 투입용 (부록에 투입 지시문 포함) |
| [docs/04-이미지-준비목록.md](docs/04-이미지-준비목록.md) | 필요한 이미지 목록 + AI 생성 프롬프트 (영문) |
| [TODOs.md](TODOs.md) | 진행 상태·결정 기록·주의 사항 (작업하며 갱신) |

## 폴더 구조

```
docs/                  기획 문서 (한글 마크다운)
assets/reference/      기존 사이트에서 수집한 원본 자산 (로고 등, 배포 제외)
assets/images/         생성 이미지 원본 (git 제외) — 교체 시 여기에 넣고 tools/optimize-images.ps1 실행
site/                  웹사이트 본체 — FTP 업로드 루트 (ko 4페이지 + en/ ja/ zh/ 각 4페이지 = 16페이지)
site/assets/images/    최적화된 웹용 이미지 (종류별 변형 _1.._4, 접속마다 랜덤 표시)
tests/                 자동화 테스트 (Playwright 83케이스·콘텐츠 가드·링크 체커·정적 서버)
tools/                 이미지 최적화 스크립트
```

## 실행·테스트

```
npm install && npx playwright install chromium   # 최초 1회
npm run serve    # 로컬 미리보기 http://127.0.0.1:4173
npm test         # html-validate → 링크 체크 → Playwright (83케이스)
```

## 다음 할 일

1. 대표 감수: 인사말·문안 (4개국어) — 확인 항목은 `TODOs.md` 대기 목록 참조
2. 사업자등록번호·설립연도·도로명 주소 확보 → 반영
3. 배포: FTP 업로드 + SSL(MX 레코드 보존!) + 검색엔진 등록 (체크리스트: `docs/02-기획서.md` §6)
