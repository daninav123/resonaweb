import { defineConfig, devices } from '@playwright/test';

/**
 * CONFIGURACIÓN MÍNIMA - SIN COMPLICACIONES
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000, // 30 segundos máximo por test
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['html']],
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'off',
    screenshot: 'off',
    video: 'off',
    headless: false, // Ver el navegador
    actionTimeout: 5000,
    navigationTimeout: 5000,
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        launchOptions: {
          slowMo: 50,
        }
      },
    },
  ],

  // NO usar webServer - servidor debe estar corriendo manualmente
});
