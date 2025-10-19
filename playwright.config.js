import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.@(js|ts)', 
  testIgnore: [
    '**/*.test.@(js|ts)',
    'client/**',
    'src/**',
  ],
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    baseURL: 'http://localhost:3000',
  },
  webServer: { //to start server automatically
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
  fullyParallel: true, // allow tests in files to run in parallel
  workers: 4,   
});
