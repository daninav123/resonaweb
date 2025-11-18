import { defineConfig, devices } from '@playwright/test';

/**
 * CONFIGURACIÓN SIMPLE PARA TESTS E2E
 * - Usa servidor existente en localhost:3000
 * - Solo Chrome
 * - Timeouts configurados
 * - No intenta levantar servidor
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'html',
  timeout: 60000, // 1 minuto por test
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 15000,
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],

  // NO usar webServer - asumimos que el servidor ya está corriendo
  // Para correr el servidor: npm run dev (en packages/frontend)
});
