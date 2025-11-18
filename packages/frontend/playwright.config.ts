import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // Evitar tests en paralelo
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Un worker a la vez
  reporter: 'html',
  timeout: 30000, // 30 segundos por test
  use: {
    baseURL: 'http://localhost:3000', // Puerto correcto del frontend
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 10000, // 10 segundos para acciones
    navigationTimeout: 10000, // 10 segundos para navegación
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Opciones para evitar colgados
        launchOptions: {
          slowMo: 100, // Ralentizar acciones 100ms
        },
      },
    },
    // Solo chromium para evitar colgados con múltiples navegadores
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000', // Puerto correcto
    reuseExistingServer: true, // Usar servidor existente (ya está corriendo)
    timeout: 120 * 1000,
  },
});
