// Playwright 설정 — tests/server.js 로 site/ 를 서빙한 뒤 테스트한다.
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  testMatch: /.*\.spec\.js/,
  timeout: 15000,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4173',
  },
  webServer: {
    command: 'node tests/server.js',
    port: 4173,
    reuseExistingServer: true,
  },
});
