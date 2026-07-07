// 콘텐츠 가드 테스트 (PRD §8-2)
// 연락처·대표자·주소는 오타가 가장 치명적인 정보이므로 모든 페이지에서 문자열로 고정한다.
// 이 값들을 바꿀 때는 반드시 실제 정보 변경이 확인된 경우여야 한다 (docs/01-사전조사.md 근거).
const { test, expect } = require('@playwright/test');

// 국문 페이지: 국내 표기
const KO_PAGES = ['/', '/about.html', '/business.html', '/contact.html'];
const KO_REQUIRED = [
  '코리아유화주식회사',
  'KOREA OIL CHEMICAL CO.,LTD',
  '서용환',
  '부산 동구 초량3동 1154-1 서남빌딩 502호',
  '051-816-2726',
  '051-816-2728',
  'koreaoil@koreaoilchem.com',
];

// 해외용 페이지: 국제 표기 (+82, 영문 주소)
const INTL_PAGES = ['en', 'ja', 'zh'].flatMap((l) => [
  `/${l}/`,
  `/${l}/about.html`,
  `/${l}/business.html`,
  `/${l}/contact.html`,
]);
const INTL_REQUIRED = [
  'KOREA OIL CHEMICAL CO.,LTD',
  'Seo Yong-hwan',
  '1154-1 Choryang 3-dong, Dong-gu, Busan',
  '+82-51-816-2726',
  '+82-51-816-2728',
  'koreaoil@koreaoilchem.com',
];

const ALL_PAGES = [...KO_PAGES, ...INTL_PAGES];

for (const path of KO_PAGES) {
  test(`푸터 필수 정보 정확성 [ko]: ${path}`, async ({ page }) => {
    await page.goto(path);
    const footer = page.locator('footer');
    await expect(footer).toHaveCount(1);
    const text = await footer.innerText();
    for (const s of KO_REQUIRED) {
      expect(text, `푸터에 "${s}" 누락 (${path})`).toContain(s);
    }
  });

  test(`전화·메일 링크 [ko]: ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('a[href="tel:051-816-2726"]').first()).toBeAttached();
    await expect(page.locator('a[href="mailto:koreaoil@koreaoilchem.com"]').first()).toBeAttached();
  });
}

for (const path of INTL_PAGES) {
  test(`푸터 필수 정보 정확성 [intl]: ${path}`, async ({ page }) => {
    await page.goto(path);
    const footer = page.locator('footer');
    await expect(footer).toHaveCount(1);
    const text = await footer.innerText();
    for (const s of INTL_REQUIRED) {
      expect(text, `푸터에 "${s}" 누락 (${path})`).toContain(s);
    }
  });

  test(`전화·메일 링크 [intl]: ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('a[href="tel:+82-51-816-2726"]').first()).toBeAttached();
    await expect(page.locator('a[href="mailto:koreaoil@koreaoilchem.com"]').first()).toBeAttached();
  });
}

test('메타: 16페이지 모두 description·OG 태그·hreflang이 있다', async ({ page }) => {
  for (const path of ALL_PAGES) {
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
    // 4개 언어 + x-default hreflang
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(5);
  }
});

test('홈(ko)에 Organization 구조화 데이터(JSON-LD)가 있다', async ({ page }) => {
  await page.goto('/');
  const raw = await page.locator('script[type="application/ld+json"]').textContent();
  const data = JSON.parse(raw);
  expect(data['@type']).toBe('Organization');
  expect(data.name).toBe('코리아유화주식회사');
  expect(data.telephone).toContain('51-816-2726');
});

test('모든 언어의 contact에 웹메일 새 창 링크가 있다', async ({ page }) => {
  for (const path of ['/contact.html', '/en/contact.html', '/ja/contact.html', '/zh/contact.html']) {
    await page.goto(path);
    const webmail = page.locator('a[href="http://mail.koreaoilchem.com"]');
    await expect(webmail).toBeAttached();
    await expect(webmail).toHaveAttribute('target', '_blank');
  }
});
