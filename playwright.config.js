// End-to-end smoke tests. `npm run test:e2e`
//
// Locally you can point Playwright at an existing Chromium instead of
// downloading one: PW_CHROMIUM_PATH=/path/to/chrome npm run test:e2e
import { defineConfig, devices } from '@playwright/test'

const PORT = 4321

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}/dev-timeline/`,
    trace: 'retain-on-failure',
    launchOptions: process.env.PW_CHROMIUM_PATH
      ? { executablePath: process.env.PW_CHROMIUM_PATH }
      : {},
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `npm run build && npx vite preview --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: `http://127.0.0.1:${PORT}/dev-timeline/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
