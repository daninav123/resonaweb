import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configuración por defecto
const DEFAULT_CALCULATOR_CONFIG = {
  eventTypes: [
    {
      id: 'boda',
      name: 'Boda',
      icon: '💒',
      color: 'pink',
      multiplier: 1.5,
      isActive: true,
      parts: [
        { id: 'ceremonia', name: 'Ceremonia', description: 'Sonido para ceremonia', isRequired: true },
        { id: 'cocktail', name: 'Cocktail', description: 'Música y sonido para cocktail', isRequired: false },
        { id: 'banquete', name: 'Banquete', description: 'Sonido ambiente para comida', isRequired: true },
        { id: 'fiesta', name: 'Fiesta', description: 'Equipo DJ completo', isRequired: true }
      ],
      availableExtras: [],
      servicePrices: {}
    },
    {
      id: 'conferencia',
      name: 'Conferencia',
      icon: '🎤',
      color: 'blue',
      multiplier: 1.2,
      isActive: true,
      parts: [
        { id: 'microfonia', name: 'Microfonía', description: 'Micrófonos para ponentes', isRequired: true },
        { id: 'pantallas', name: 'Pantallas', description: 'Proyección de presentaciones', isRequired: false },
        { id: 'grabacion', name: 'Grabación', description: 'Grabación del evento', isRequired: false }
      ],
      availableExtras: [],
      servicePrices: {}
    },
    {
      id: 'concierto',
      name: 'Concierto',
      icon: '🎵',
      color: 'purple',
      multiplier: 1.8,
      isActive: true,
      parts: [
        { id: 'escenario', name: 'Escenario', description: 'Estructura y montaje', isRequired: true },
        { id: 'sonido', name: 'Sonido', description: 'Sistema de sonido profesional', isRequired: true }
      ],
      availableExtras: [],
      servicePrices: {}
    },
    {
      id: 'evento-corporativo',
      name: 'Evento Corporativo',
      icon: '💼',
      color: 'gray',
      multiplier: 1.3,
      isActive: true,
      parts: [
        { id: 'presentacion', name: 'Presentación', description: 'Equipo para presentaciones', isRequired: true },
        { id: 'networking', name: 'Networking', description: 'Música ambiente', isRequired: false },
        { id: 'streaming', name: 'Streaming', description: 'Transmisión online', isRequired: false }
      ],
      availableExtras: [],
      servicePrices: {}
    },
    {
      id: 'fiesta-privada',
      name: 'Fiesta Privada',
      icon: '🎉',
      color: 'orange',
      multiplier: 1.0,
      isActive: true,
      parts: [
        { id: 'dj', name: 'DJ', description: 'Equipo DJ completo', isRequired: true },
        { id: 'iluminacion', name: 'Iluminación', description: 'Luces y efectos', isRequired: false }
      ],
      availableExtras: [],
      servicePrices: {}
    },
    {
      id: 'otro',
      name: 'Otro',
      icon: '📅',
      color: 'green',
      multiplier: 1.0,
      isActive: true,
      parts: [
        { id: 'basico', name: 'Equipo Básico', description: 'Configuración estándar', isRequired: true }
      ],
      availableExtras: [],
      servicePrices: {}
    }
  ],
  eventParts: [],
  servicePrices: {},
  extraCategories: [],
  availableExtras: []
};

class DiagnosticController {
  /**
   * GET /api/v1/diagnostic/calculator-config
   * Diagnóstico completo de la configuración de calculadora
   */
  async checkCalculatorConfig(req: Request, res: Response) {
    try {
      // Verificar si existe la configuración
      const config = await prisma.systemConfig.findUnique({
        where: { key: 'advancedCalculatorConfig' }
      });

      const diagnostic = {
        timestamp: new Date().toISOString(),
        database: {
          connected: true,
          hasConfig: !!config,
        },
        config: config ? {
          eventTypes: config.value?.eventTypes?.length || 0,
          events: config.value?.eventTypes?.map((e: any) => ({
            name: e.name,
            icon: e.icon,
            parts: e.parts?.length || 0,
            extras: e.availableExtras?.length || 0
          }))
        } : null,
        recommendation: config ? 
          'Configuración encontrada. Si los usuarios no la ven, el problema está en el frontend.' :
          'NO hay configuración. Usa el endpoint /diagnostic/init-calculator-config para crearla.'
      };

      res.json(diagnostic);

    } catch (error: any) {
      res.status(500).json({
        error: 'Error en diagnóstico',
        message: error.message,
        recommendation: 'Verifica la conexión a la base de datos'
      });
    }
  }

  /**
   * POST /api/v1/diagnostic/init-calculator-config
   * Inicializar configuración de calculadora si no existe
   */
  async initCalculatorConfig(req: Request, res: Response) {
    try {
      // Verificar si ya existe
      const existing = await prisma.systemConfig.findUnique({
        where: { key: 'advancedCalculatorConfig' }
      });

      if (existing) {
        return res.json({
          message: 'La configuración ya existe',
          config: {
            eventTypes: existing.value?.eventTypes?.length || 0,
            events: existing.value?.eventTypes?.map((e: any) => e.name)
          }
        });
      }

      // Crear configuración por defecto
      const created = await prisma.systemConfig.create({
        data: {
          key: 'advancedCalculatorConfig',
          value: DEFAULT_CALCULATOR_CONFIG
        }
      });

      res.json({
        message: 'Configuración creada exitosamente',
        config: {
          eventTypes: created.value?.eventTypes?.length || 0,
          events: created.value?.eventTypes?.map((e: any) => e.name)
        },
        nextSteps: [
          'La configuración ya está en la base de datos',
          'Los usuarios ahora verán los montajes y extras',
          'Si tienes cambios personalizados, ve al panel admin y guarda de nuevo'
        ]
      });

    } catch (error: any) {
      res.status(500).json({
        error: 'Error al inicializar configuración',
        message: error.message
      });
    }
  }
}

export const diagnosticController = new DiagnosticController();
