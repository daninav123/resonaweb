import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { billingService } from '../src/services/billing.service';

/**
 * Tests unitarios para el servicio de facturación
 * Verifica validaciones de NIF/CIF/NIE
 */

describe('Billing Service - Validaciones', () => {
  
  describe('Validación de NIF (DNI)', () => {
    
    it('Debe validar NIF correcto', () => {
      const validNIFs = [
        '12345678Z',
        '00000000T',
        '99999999R',
      ];
      
      validNIFs.forEach(nif => {
        const result = billingService.validateSpanishTaxId(nif, 'NIF');
        expect(result).toBe(true);
        console.log(`✅ NIF ${nif}: válido`);
      });
    });

    it('Debe rechazar NIF incorrecto', () => {
      const invalidNIFs = [
        '12345678A', // Letra incorrecta
        '12345678',  // Sin letra
        'ABCD1234Z', // Formato incorrecto
        '123456789Z', // Demasiados dígitos
      ];
      
      invalidNIFs.forEach(nif => {
        const result = billingService.validateSpanishTaxId(nif, 'NIF');
        expect(result).toBe(false);
        console.log(`❌ NIF ${nif}: inválido`);
      });
    });
  });

  describe('Validación de CIF (Empresas)', () => {
    
    it('Debe validar formato CIF', () => {
      const validCIFs = [
        'A12345678',
        'B87654321',
        'H12345678',
      ];
      
      validCIFs.forEach(cif => {
        const result = billingService.validateSpanishTaxId(cif, 'CIF');
        expect(result).toBe(true);
        console.log(`✅ CIF ${cif}: formato válido`);
      });
    });

    it('Debe rechazar CIF con formato incorrecto', () => {
      const invalidCIFs = [
        '12345678A', // No empieza con letra
        'AA1234567', // Dos letras al inicio
        'A123456',   // Pocos dígitos
      ];
      
      invalidCIFs.forEach(cif => {
        const result = billingService.validateSpanishTaxId(cif, 'CIF');
        expect(result).toBe(false);
        console.log(`❌ CIF ${cif}: formato inválido`);
      });
    });
  });

  describe('Validación de NIE (Extranjeros)', () => {
    
    it('Debe validar NIE correcto', () => {
      const validNIEs = [
        'X1234567L',
        'Y1234567Z',
        'Z1234567R',
      ];
      
      validNIEs.forEach(nie => {
        const result = billingService.validateSpanishTaxId(nie, 'NIE');
        expect(result).toBe(true);
        console.log(`✅ NIE ${nie}: válido`);
      });
    });

    it('Debe rechazar NIE incorrecto', () => {
      const invalidNIEs = [
        'A1234567L', // Primera letra incorrecta
        'X123456L',  // Pocos dígitos
        'X12345678L', // Demasiados dígitos
      ];
      
      invalidNIEs.forEach(nie => {
        const result = billingService.validateSpanishTaxId(nie, 'NIE');
        expect(result).toBe(false);
        console.log(`❌ NIE ${nie}: inválido`);
      });
    });
  });
});

describe('Billing Service - CRUD Operations', () => {
  
  it('Debe rechazar datos sin taxId', async () => {
    try {
      await billingService.upsertBillingData('test-user-id', {
        taxId: '',
        address: 'Test Address',
        city: 'Valencia',
        state: 'Valencia',
        postalCode: '46001'
      });
      expect(true).toBe(false); // No debería llegar aquí
    } catch (error: any) {
      expect(error.message).toContain('obligatorio');
      console.log('✅ Rechaza taxId vacío correctamente');
    }
  });

  it('Debe rechazar datos sin dirección completa', async () => {
    try {
      await billingService.upsertBillingData('test-user-id', {
        taxId: '12345678Z',
        address: '', // Falta dirección
        city: '',
        state: '',
        postalCode: ''
      });
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.message).toContain('obligatorios');
      console.log('✅ Rechaza datos incompletos correctamente');
    }
  });
});

// Ejecutar tests
console.log('\n🧪 EJECUTANDO TESTS DE BILLING SERVICE\n');
console.log('═'.repeat(60));
