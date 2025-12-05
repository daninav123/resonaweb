import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CalculatorConfigService {
  private static readonly CONFIG_KEY = 'advancedCalculatorConfig';

  /**
   * Obtener configuración de la calculadora desde BD
   */
  async getConfig() {
    try {
      const config = await prisma.systemConfig.findUnique({
        where: { key: CalculatorConfigService.CONFIG_KEY }
      });

      if (!config) {
        console.log('⚠️ No hay configuración de calculadora guardada en BD');
        return null;
      }

      return config.value;
    } catch (error) {
      console.error('❌ Error obteniendo configuración:', error);
      throw error;
    }
  }

  /**
   * Guardar configuración de la calculadora en BD
   */
  async saveConfig(config: any) {
    try {
      const result = await prisma.systemConfig.upsert({
        where: { key: CalculatorConfigService.CONFIG_KEY },
        update: { value: config },
        create: {
          key: CalculatorConfigService.CONFIG_KEY,
          value: config
        }
      });

      console.log('✅ Configuración de calculadora guardada en BD');
      return result.value;
    } catch (error) {
      console.error('❌ Error guardando configuración:', error);
      throw error;
    }
  }

  /**
   * Resetear configuración a valores por defecto
   */
  async resetConfig(defaultConfig: any) {
    try {
      const result = await prisma.systemConfig.upsert({
        where: { key: CalculatorConfigService.CONFIG_KEY },
        update: { value: defaultConfig },
        create: {
          key: CalculatorConfigService.CONFIG_KEY,
          value: defaultConfig
        }
      });

      console.log('✅ Configuración de calculadora reseteada a valores por defecto');
      return result.value;
    } catch (error) {
      console.error('❌ Error reseteando configuración:', error);
      throw error;
    }
  }
}

export const calculatorConfigService = new CalculatorConfigService();
