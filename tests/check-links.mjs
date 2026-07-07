// 내부 링크·리소스 무결성 검사 (PRD §8-4)
// site/*.html 의 href/src 가 가리키는 로컬 파일이 실제로 존재하는지 확인한다.
// 예외: 아직 준비 전인 생성 이미지(assets/images/*)는 허용 목록으로 관리 (PRD §6 이미지 폴백 전제)
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'site');

// 이미지 준비 전 허용 목록 (docs/04-이미지-준비목록.md 의 파일명과 일치해야 함)
const PENDING_OK = [
  'assets/images/hero-main.jpg',
  'assets/images/biz-fuel.jpg',
  'assets/images/biz-marine.jpg',
  'assets/images/biz-chem.jpg',
  'assets/images/about-visual.jpg',
  'assets/images/about-greeting.jpg',
  'assets/images/og-image.jpg',
];

const htmlFiles = readdirSync(SITE).filter((f) => f.endsWith('.html'));
if (htmlFiles.length === 0) {
  console.error('site/ 에 HTML 파일이 없습니다.');
  process.exit(1);
}

const errors = [];
const pendings = [];

for (const file of htmlFiles) {
  const html = readFileSync(join(SITE, file), 'utf-8');
  const refs = [...html.matchAll(/(?:href|src)\s*=\s*"([^"]+)"/g)].map((m) => m[1]);
  for (const ref of refs) {
    if (/^(https?:|mailto:|tel:|#|data:)/.test(ref)) continue; // 외부·특수 링크는 대상 아님
    const clean = ref.split('#')[0].split('?')[0];
    if (clean === '') continue;
    const target = join(SITE, clean);
    if (!existsSync(target)) {
      if (PENDING_OK.includes(clean.replace(/\\/g, '/'))) {
        pendings.push(`${file} → ${clean} (이미지 준비 대기, 폴백으로 표시됨)`);
      } else {
        errors.push(`${file} → ${clean} : 파일 없음`);
      }
    }
  }
}

// CSS 안의 url() 참조도 검사
const cssDir = join(SITE, 'css');
if (existsSync(cssDir)) {
  for (const cssFile of readdirSync(cssDir).filter((f) => f.endsWith('.css'))) {
    const css = readFileSync(join(cssDir, cssFile), 'utf-8');
    const urls = [...css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)].map((m) => m[1]);
    for (const u of urls) {
      if (/^(https?:|data:)/.test(u)) continue;
      const target = resolve(cssDir, u);
      const rel = target.slice(SITE.length + 1).replace(/\\/g, '/');
      if (!existsSync(target)) {
        if (PENDING_OK.includes(rel)) {
          pendings.push(`css/${cssFile} → ${rel} (이미지 준비 대기, 폴백으로 표시됨)`);
        } else {
          errors.push(`css/${cssFile} → ${u} : 파일 없음`);
        }
      }
    }
  }
}

if (pendings.length) {
  console.log('⏳ 이미지 준비 대기 (허용):');
  for (const p of [...new Set(pendings)]) console.log('   ' + p);
}
if (errors.length) {
  console.error('✗ 깨진 참조 발견:');
  for (const e of errors) console.error('   ' + e);
  process.exit(1);
}
console.log(`✓ 링크·리소스 무결성 통과 (${htmlFiles.length}개 HTML 검사)`);
