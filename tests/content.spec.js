// 콘텐츠 가드 테스트 (PRD §8-2)
// 연락처·대표자·주소는 오타가 가장 치명적인 정보이므로 모든 페이지에서 문자열로 고정한다.
// 이 값들을 바꿀 때는 반드시 실제 정보 변경이 확인된 경우여야 한다 (docs/01-사전조사.md 근거).
const { test, expect } = require('@playwright/test');

const PAGES = ['/', '/about.html', '/business.html', '/contact.html'];

const REQUIRED_FOOTER_STRINGS = [
  '코리아유화주식회사',
  'KOREA OIL CHEMICAL CO.,LTD',
  '서용환',
  '부산 동구 초량3동 1154-1 서남빌딩 502호',
  '051-816-2726',
  '051-816-2728',
  'koreaoil@koreaoilchem.com',
];

for (const path of PAGES) {
  test(`푸터 필수 정보 정확성: ${path}`, async ({ page }) => {
    await page.goto(path);
    const footer = page.locator('footer');
    await expect(footer).toHaveCount(1);
    const text = await footer.innerText();
    for (const s of REQUIRED_FOOTER_STRINGS) {
      expect(text, `푸터에 "${s}" 누락 (${path})`).toContain(s);
    }
  });

  test(`전화 발신·메일 링크 동작: ${path}`, async ({ page }) => {
    await page.goto(path);
    // 모바일에서 전화번호 탭 = 발신 (PRD 완료 기준)
    await expect(page.locator('a[href="tel:051-816-2726"]').first()).toBeAttached();
    await expect(page.locator('a[href="mailto:koreaoil@koreaoilchem.com"]').first()).toBeAttached();
  });
}

test('메타: 각 페이지에 description과 OG 태그가 있다', async ({ page }) => {
  for (const path of PAGES) {
    await page.goto(path);
    for (const sel of [
      'meta[name="description"]',
      'meta[property="og:title"]',
      'meta[property="og:description"]',
      'meta[property="og:image"]',
    ]) {
      const content = await page.locator(sel).getAttribute('content');
      expect(content, `${path} 의 ${sel} 비어 있음`).toBeTruthy();
    }
  }
});

test('홈에 Organization 구조화 데이터(JSON-LD)가 있다', async ({ page }) => {
  await page.goto('/');
  const raw = await page.locator('script[type="application/ld+json"]').textContent();
  const data = JSON.parse(raw);
  expect(data['@type']).toBe('Organization');
  expect(data.name).toBe('코리아유화주식회사');
  expect(data.telephone).toContain('51-816-2726');
});

test('contact: 웹메일 링크가 새 창으로 열린다', async ({ page }) => {
  await page.goto('/contact.html');
  const webmail = page.locator('a[href="http://mail.koreaoilchem.com"]');
  await expect(webmail).toBeAttached();
  await expect(webmail).toHaveAttribute('target', '_blank');
});
