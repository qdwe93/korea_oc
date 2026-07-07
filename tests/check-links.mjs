// 내부 링크·리소스 무결성 검사 (PRD §8-4)
// site/ 아래 모든 HTML(언어 폴더 포함)의 href/src 가 가리키는 로컬 파일이
// 실제로 존재하는지, CSS의 url() 참조가 유효한지 확인한다.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'site');

// HTML 파일 재귀 수집
function collectHtml(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...collectHtml(full));
    else if (name.endsWith('.html')) out.push(full);
  }
  return out;
}

const htmlFiles = collectHtml(SITE);
if (htmlFiles.length === 0) {
  console.error('site/ 에 HTML 파일이 없습니다.');
  process.exit(1);
}

const errors = [];

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf-8');
  const refs = [...html.matchAll(/(?:href|src)\s*=\s*"([^"]+)"/g)].map((m) => m[1]);
  for (const ref of refs) {
    if (/^(https?:|mailto:|tel:|#|data:)/.test(ref)) continue; // 외부·특수 링크는 대상 아님
    const clean = ref.split('#')[0].split('?')[0];
    if (clean === '') continue;
    const target = resolve(dirname(file), clean);
    if (!existsSync(target)) {
      errors.push(`${file.slice(SITE.length + 1)} → ${clean} : 파일 없음`);
    }
  }
}

// CSS 안의 url() 참조 검사 (CSS 파일 기준 상대경로)
const cssDir = join(SITE, 'css');
if (existsSync(cssDir)) {
  for (const cssFile of readdirSync(cssDir).filter((f) => f.endsWith('.css'))) {
    const css = readFileSync(join(cssDir, cssFile), 'utf-8');
    const urls = [...css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)].map((m) => m[1]);
    for (const u of urls) {
      if (/^(https?:|data:)/.test(u)) continue;
      const target = resolve(cssDir, u);
      if (!existsSync(target)) {
        errors.push(`css/${cssFile} → ${u} : 파일 없음`);
      }
    }
  }
}

// JS의 이미지 로테이션 변형 파일 존재 검사 (js/main.js 의 VARIANTS 선언과 대조)
const mainJs = readFileSync(join(SITE, 'js', 'main.js'), 'utf-8');
const variantsMatch = mainJs.match(/var VARIANTS = \{([\s\S]*?)\};/);
if (variantsMatch) {
  const entries = [...variantsMatch[1].matchAll(/'([a-z-]+)':\s*(\d+)/g)];
  for (const [, key, count] of entries) {
    for (let i = 1; i <= Number(count); i++) {
      const f = join(SITE, 'assets', 'images', `${key}_${i}.jpg`);
      if (!existsSync(f)) {
        errors.push(`js/main.js VARIANTS → assets/images/${key}_${i}.jpg : 파일 없음`);
      }
    }
  }
} else {
  errors.push('js/main.js 에서 VARIANTS 선언을 찾지 못함');
}

if (errors.length) {
  console.error('✗ 깨진 참조 발견:');
  for (const e of errors) console.error('   ' + e);
  process.exit(1);
}
console.log(`✓ 링크·리소스 무결성 통과 (HTML ${htmlFiles.length}개, 이미지 변형 포함)`);
