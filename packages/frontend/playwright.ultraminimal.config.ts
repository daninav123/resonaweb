import { defineConfig, devices } from '@playwright/test';

/**
 * CONFIGURACIÓN ULTRA MÍNIMA - PARA DEBUGGING
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 10000, // 10 segundos TOTAL por test
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'list',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'off',
    screenshot: 'off',
    video: 'off',
    headless: true, // Sin navegador visible para ir rápido
    actionTimeout: 3000, // 3 segundos
    navigationTimeout: 3000, // 3 segundos
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
