import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de Playwright para tests E2E
 * Ver https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  /* Tiempo máximo por test */
  timeout: 120 * 1000,
  
  /* Tests en paralelo */
  fullyParallel: false,
  
  /* Fallar si hay tests marcados con .only */
  forbidOnly: !!process.env.CI,
  
  /* Reintentar tests fallidos en CI */
  retries: process.env.CI ? 2 : 0,
  
  /* Workers (tests en paralelo) */
  workers: process.env.CI ? 1 : 1,
  
  /* Reportes */
  reporter: [
    ['list'],
    ['html', { outputFolder: 'test-results/html-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  
  /* Configuración compartida para todos los tests */
  use: {
    /* URL base */
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    /* Trazado de errores */
    trace: 'on-first-retry',
    
    /* Screenshots en failures */
    screenshot: 'only-on-failure',
    
    /* Video en failures */
    video: 'retain-on-failure',
    
    /* Timeouts */
    actionTimeout: 15 * 1000,
    navigationTimeout: 30 * 1000,
  },

  /* Proyectos de test (diferentes navegadores/dispositivos) */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Descomenta para probar en más navegadores
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Tests en mobile */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  /* Configuración de servidor local (opcional) */
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000,
  // },
});
