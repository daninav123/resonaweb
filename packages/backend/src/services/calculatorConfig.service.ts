import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CalculatorConfigService {
  private static readonly CONFIG_KEY = 'advancedCalculatorConfig';

  /**
   * Obtener configuración de la calculadora desde BD
   * IMPORTANTE: Filtra eventos con isActive === false antes de devolver
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

      const configValue = config.value as any;
      
      // 🔥 FILTRAR eventos ocultos (isActive === false) antes de devolver
      if (configValue && configValue.eventTypes) {
        const originalCount = configValue.eventTypes.length;
        configValue.eventTypes = configValue.eventTypes.filter((event: any) => {
          // Solo incluir si isActive NO es explícitamente false
          const shouldShow = event.isActive !== false;
          if (!shouldShow) {
            console.log(`🚫 Evento OCULTO en backend (isActive=false): ${event.name}`);
          }
          return shouldShow;
        });
        const filteredCount = configValue.eventTypes.length;
        
        if (originalCount !== filteredCount) {
          console.log(`✅ Filtrados ${originalCount - filteredCount} eventos ocultos. Devolviendo ${filteredCount} eventos activos.`);
        }
      }

      return configValue;
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
