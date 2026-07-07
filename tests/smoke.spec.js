// 스모크 테스트 (PRD §8-1) — 4개 언어(ko/en/ja/zh) × 4페이지 = 16페이지
// 각 페이지: 로드 성공, 고유 <title>, h1 존재, GNB·언어전환 동작, 모바일 햄버거 동작
const { test, expect } = require('@playwright/test');

const LOCALES = [
  {
    code: 'ko',
    gnb: [
      { label: '회사소개', href: 'about.html' },
      { label: '사업영역', href: 'business.html' },
      { label: '문의·오시는길', href: 'contact.html' },
    ],
    pages: [
      { path: '/', titlePart: '액체연료', h1Part: '코리아유화' },
      { path: '/about.html', titlePart: '회사소개', h1Part: '회사소개' },
      { path: '/business.html', titlePart: '사업영역', h1Part: '사업영역' },
      { path: '/contact.html', titlePart: '오시는길', h1Part: '문의' },
    ],
  },
  {
    code: 'en',
    gnb: [
      { label: 'About Us', href: 'about.html' },
      { label: 'Business', href: 'business.html' },
      { label: 'Contact', href: 'contact.html' },
    ],
    pages: [
      { path: '/en/', titlePart: 'Liquid Fuel', h1Part: 'Energy' },
      { path: '/en/about.html', titlePart: 'About Us', h1Part: 'About Us' },
      { path: '/en/business.html', titlePart: 'Business', h1Part: 'Business' },
      { path: '/en/contact.html', titlePart: 'Contact', h1Part: 'Contact' },
    ],
  },
  {
    code: 'ja',
    gnb: [
      { label: '会社紹介', href: 'about.html' },
      { label: '事業領域', href: 'business.html' },
      { label: 'お問い合わせ', href: 'contact.html' },
    ],
    pages: [
      { path: '/ja/', titlePart: '液体燃料', h1Part: 'エネルギー' },
      { path: '/ja/about.html', titlePart: '会社紹介', h1Part: '会社紹介' },
      { path: '/ja/business.html', titlePart: '事業領域', h1Part: '事業領域' },
      { path: '/ja/contact.html', titlePart: 'アクセス', h1Part: 'お問い合わせ' },
    ],
  },
  {
    code: 'zh',
    gnb: [
      { label: '公司简介', href: 'about.html' },
      { label: '业务领域', href: 'business.html' },
      { label: '联系我们', href: 'contact.html' },
    ],
    pages: [
      { path: '/zh/', titlePart: '液体燃料', h1Part: '能源' },
      { path: '/zh/about.html', titlePart: '公司简介', h1Part: '公司简介' },
      { path: '/zh/business.html', titlePart: '业务领域', h1Part: '业务领域' },
      { path: '/zh/contact.html', titlePart: '联系我们', h1Part: '联系我们' },
    ],
  },
];

const ALL_PAGES = LOCALES.flatMap((l) => l.pages);

for (const locale of LOCALES) {
  test.describe(`[${locale.code}]`, () => {
    for (const p of locale.pages) {
      test(`${p.path} 로드·title·h1`, async ({ page }) => {
        const res = await page.goto(p.path);
        expect(res.ok()).toBeTruthy();
        await expect(page).toHaveTitle(new RegExp(p.titlePart));
        const h1 = page.locator('h1');
        await expect(h1).toHaveCount(1);
        await expect(h1).toContainText(p.h1Part);
      });

      test(`${p.path} GNB 3링크 + 언어전환 4링크`, async ({ page }) => {
        await page.goto(p.path);
        for (const link of locale.gnb) {
          const a = page.locator(`#gnb a[href="${link.href}"]`);
          await expect(a).toHaveCount(1);
          await expect(a).toContainText(link.label);
        }
        await expect(page.locator('.lang-switch a')).toHaveCount(4);
        await expect(page.locator('.lang-switch a[aria-current="true"]')).toHaveCount(1);
      });
    }
  });
}

test('title이 16페이지 모두 서로 다르다 (고유성)', async ({ page }) => {
  const titles = [];
  for (const p of ALL_PAGES) {
    await page.goto(p.path);
    titles.push(await page.title());
  }
  expect(new Set(titles).size).toBe(ALL_PAGES.length);
});

test.describe('GNB 내비게이션 이동 (데스크톱 1280px)', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  for (const locale of LOCALES) {
    test(`[${locale.code}] 각 메뉴 클릭 시 해당 페이지로 이동`, async ({ page }) => {
      for (const link of locale.gnb) {
        await page.goto(locale.pages[0].path);
        await page.locator(`#gnb a[href="${link.href}"]`).click();
        await expect(page).toHaveURL(new RegExp(link.href.replace('.', '\\.')));
        await expect(page.locator('h1')).toBeVisible();
      }
    });
  }

  test('언어 전환: ko 홈 → en → ja → zh → ko 순회', async ({ page }) => {
    await page.goto('/');
    await page.locator('.lang-switch a[hreflang="en"]').click();
    await expect(page).toHaveURL(/\/en\//);
    await page.locator('.lang-switch a[hreflang="ja"]').click();
    await expect(page).toHaveURL(/\/ja\//);
    await page.locator('.lang-switch a[hreflang="zh"]').click();
    await expect(page).toHaveURL(/\/zh\//);
    await page.locator('.lang-switch a[hreflang="ko"]').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
  });
});

test.describe('모바일 375px', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  for (const locale of LOCALES) {
    test(`[${locale.code}] 햄버거 메뉴 열림/닫힘`, async ({ page }) => {
      await page.goto(locale.pages[0].path);
      const toggle = page.locator('.nav-toggle');
      const gnb = page.locator('#gnb');

      await expect(toggle).toBeVisible();
      await expect(gnb).toBeHidden();

      await toggle.click();
      await expect(gnb).toBeVisible();
      await expect(page.locator('.lang-switch')).toBeVisible();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');

      await toggle.click();
      await expect(gnb).toBeHidden();
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    });
  }

  test('메뉴를 열고 회사소개로 이동할 수 있다', async ({ page }) => {
    await page.goto('/');
    await page.locator('.nav-toggle').click();
    await page.locator('#gnb a[href="about.html"]').click();
    await expect(page).toHaveURL(/about\.html/);
  });

  test('모든 페이지에서 가로 스크롤이 생기지 않는다', async ({ page }) => {
    for (const p of ALL_PAGES) {
      await page.goto(p.path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow, `${p.path} 가로 오버플로`).toBeLessThanOrEqual(0);
    }
  });
});

test.describe('이미지 로테이션', () => {
  // 회귀 방지: CSS 변수 안의 상대 url()은 스타일시트 기준으로 해석되어 루트 페이지에서
  // 404가 났던 버그가 있음 → "계산된(computed) 배경"이 절대 URL이고 실제 200인지 검증한다.
  for (const path of ['/', '/en/', '/about.html', '/ja/about.html']) {
    test(`${path} 의 배경 이미지가 실제로 로드 가능한 URL이다`, async ({ page }) => {
      await page.goto(path);
      const target = page.locator('[data-img]').first();
      const bg = await target.evaluate((el) => getComputedStyle(el).backgroundImage);
      const m = bg.match(/url\("(http[^"]+\/assets\/images\/[a-z-]+_\d\.jpg)"\)/);
      expect(m, `${path} 계산된 배경에 절대 URL 이미지가 없음: ${bg}`).toBeTruthy();
      const res = await page.request.get(m[1]);
      expect(res.ok(), `${m[1]} 이 404`).toBeTruthy();
    });
  }
});
