import { Page } from '@playwright/test';

/**
 * Esperar a que una condición se cumpla
 */
export async function waitForCondition(
  condition: () => Promise<boolean>,
  timeout: number = 10000,
  interval: number = 500
): Promise<boolean> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  return false;
}

/**
 * Esperar a que un elemento sea visible
 */
export async function waitForElement(
  page: Page,
  selector: string,
  timeout: number = 10000
): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { state: 'visible', timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * Esperar a que desaparezca el loader/spinner
 */
export async function waitForLoadingComplete(page: Page) {
  const loaders = [
    '.loading',
    '.spinner',
    '[data-testid="loading"]',
    '[data-testid="spinner"]',
    '.loader',
    '[aria-busy="true"]'
  ];
  
  for (const loader of loaders) {
    const element = page.locator(loader).first();
    if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
      await element.waitFor({ state: 'hidden', timeout: 30000 });
    }
  }
}

/**
 * Esperar a que aparezca un toast/notificación
 */
export async function waitForToast(page: Page, text?: string, timeout: number = 5000): Promise<boolean> {
  const toastSelectors = [
    '.toast',
    '.notification',
    '[role="alert"]',
    '[data-testid="toast"]',
    '.Toastify__toast'
  ];
  
  for (const selector of toastSelectors) {
    const toast = text 
      ? page.locator(`${selector}:has-text("${text}")`)
      : page.locator(selector).first();
    
    if (await toast.isVisible({ timeout }).catch(() => false)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Esperar respuesta de la API
 */
export async function waitForAPIResponse(
  page: Page,
  urlPattern: string | RegExp,
  timeout: number = 10000
): Promise<boolean> {
  try {
    await page.waitForResponse(
      response => {
        const url = response.url();
        if (typeof urlPattern === 'string') {
          return url.includes(urlPattern);
        }
        return urlPattern.test(url);
      },
      { timeout }
    );
    return true;
  } catch {
    return false;
  }
}
