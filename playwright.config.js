import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'list',
  timeout: 60000,
  webServer: {
    command: 'npm run build && npx prisma migrate deploy && npx prisma db seed && npm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 300000,
  },
  use: {
    baseURL: 'http://localhost:3000',
  },
})
