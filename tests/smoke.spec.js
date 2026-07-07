// 스모크 테스트 (PRD §8-1)
// 4페이지 각각: 로드 성공, 고유 <title>, h1 존재, GNB 링크 동작, 모바일 햄버거 동작
const { test, expect } = require('@playwright/test');

const PAGES = [
  { path: '/', titlePart: '액체연료', h1Part: '코리아유화' },
  { path: '/about.html', titlePart: '회사소개', h1Part: '회사소개' },
  { path: '/business.html', titlePart: '사업영역', h1Part: '사업영역' },
  { path: '/contact.html', titlePart: '오시는길', h1Part: '문의' },
];

const GNB_LINKS = [
  { label: '회사소개', href: 'about.html' },
  { label: '사업영역', href: 'business.html' },
  { label: '문의·오시는길', href: 'contact.html' },
];

for (const p of PAGES) {
  test.describe(`페이지: ${p.path}`, () => {
    test('로드되고 고유 title과 h1이 있다', async ({ page }) => {
      const res = await page.goto(p.path);
      expect(res.ok()).toBeTruthy();
      await expect(page).toHaveTitle(new RegExp(p.titlePart));
      const h1 = page.locator('h1');
      await expect(h1).toHaveCount(1);
      await expect(h1).toContainText(p.h1Part);
    });

    test('GNB 3개 링크가 모두 존재한다', async ({ page }) => {
      await page.goto(p.path);
      for (const link of GNB_LINKS) {
        const a = page.locator(`#gnb a[href="${link.href}"]`);
        await expect(a).toHaveCount(1);
        await expect(a).toContainText(link.label);
      }
    });
  });
}

test('title이 페이지마다 서로 다르다 (고유성)', async ({ page }) => {
  const titles = [];
  for (const p of PAGES) {
    await page.goto(p.path);
    titles.push(await page.title());
  }
  expect(new Set(titles).size).toBe(PAGES.length);
});

test.describe('GNB 내비게이션 이동 (데스크톱 1280px)', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('각 메뉴 클릭 시 해당 페이지로 이동한다', async ({ page }) => {
    for (const link of GNB_LINKS) {
      await page.goto('/');
      await page.locator(`#gnb a[href="${link.href}"]`).click();
      await expect(page).toHaveURL(new RegExp(link.href.replace('.', '\\.')));
      await expect(page.locator('h1')).toBeVisible();
    }
  });
});

test.describe('모바일 375px 햄버거 메뉴', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('토글 버튼으로 메뉴가 열리고 닫힌다', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('.nav-toggle');
    const gnb = page.locator('#gnb');

    await expect(toggle).toBeVisible();
    await expect(gnb).toBeHidden();

    await toggle.click();
    await expect(gnb).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await toggle.click();
    await expect(gnb).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('메뉴를 열고 회사소개로 이동할 수 있다', async ({ page }) => {
    await page.goto('/');
    await page.locator('.nav-toggle').click();
    await page.locator('#gnb a[href="about.html"]').click();
    await expect(page).toHaveURL(/about\.html/);
  });

  test('모바일에서 레이아웃이 가로 스크롤을 만들지 않는다', async ({ page }) => {
    for (const p of PAGES) {
      await page.goto(p.path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow, `${p.path} 가로 오버플로`).toBeLessThanOrEqual(0);
    }
  });
});
