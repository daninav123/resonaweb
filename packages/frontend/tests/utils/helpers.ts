import { Page } from '@playwright/test';

/**
 * Generar email único para tests
 */
export function generateUniqueEmail(prefix: string = 'test'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}_${timestamp}_${random}@test.com`;
}

/**
 * Generar datos de usuario para tests
 */
export function generateUserData() {
  return {
    email: generateUniqueEmail(),
    password: 'Test123456!',
    firstName: 'Test',
    lastName: 'User'
  };
}

/**
 * Esperar a que desaparezca el loader/spinner
 */
export async function waitForLoader(page: Page) {
  try {
    await page.waitForSelector('[data-testid="loader"]', { state: 'hidden', timeout: 10000 });
  } catch {
    // No pasa nada si no hay loader
  }
}

/**
 * Scroll hasta un elemento
 */
export async function scrollToElement(page: Page, selector: string) {
  await page.locator(selector).scrollIntoViewIfNeeded();
}

/**
 * Tomar screenshot con nombre descriptivo
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `./test-results/screenshots/${name}.png`, fullPage: true });
}

/**
 * Limpiar localStorage y cookies
 * Navega a la página primero para asegurar que localStorage está disponible
 */
export async function cleanBrowserData(page: Page) {
  try {
    // Navegar a la página principal primero para tener contexto
    const currentUrl = page.url();
    if (!currentUrl || currentUrl === 'about:blank') {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
    }
    
    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        // Ignorar errores de seguridad de localStorage
        console.log('Note: localStorage not accessible in this context');
      }
    });
  } catch (error) {
    // Ignorar si la página no está lista aún
    console.log('Note: Could not clean browser data, page may not be ready');
  }
  
  try {
    await page.context().clearCookies();
  } catch (error) {
    // Ignorar errores al limpiar cookies
    console.log('Note: Could not clear cookies');
  }
}

/**
 * Esperar a que una petición específica termine
 */
export async function waitForApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  timeout: number = 10000
) {
  return page.waitForResponse(
    response => {
      const url = response.url();
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      }
      return urlPattern.test(url);
    },
    { timeout }
  );
}

/**
 * Verificar que no hay errores en consola
 */
export async function checkConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  return errors;
}

/**
 * Esperar navegación y carga completa
 */
export async function waitForNavigation(page: Page, url?: string) {
  if (url) {
    await page.waitForURL(url, { timeout: 10000 });
  }
  await page.waitForLoadState('networkidle');
}

/**
 * Retry una función hasta que tenga éxito
 */
export async function retryUntilSuccess<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  throw new Error('Max attempts reached');
}

/**
 * Esperar a que un elemento sea visible con retry
 */
export async function waitForElement(page: Page, selector: string, timeout: number = 10000) {
  try {
    await page.waitForSelector(selector, { state: 'visible', timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * Obtener texto de un elemento de forma segura
 */
export async function getTextSafely(page: Page, selector: string): Promise<string | null> {
  try {
    const element = await page.locator(selector).first();
    return await element.textContent();
  } catch {
    return null;
  }
}

/**
 * Verificar si un elemento existe
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  try {
    const count = await page.locator(selector).count();
    return count > 0;
  } catch {
    return false;
  }
}
