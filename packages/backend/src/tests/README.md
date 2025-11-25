# 🧪 Tests Backend

## ✅ Tests Activos

- `validation.test.ts` - Tests de validación de datos

## ⏸️ Tests Desactivados (Requieren Servidor)

Los siguientes tests están desactivados en CI/CD porque requieren el servidor backend corriendo:

### `product-delete.test.ts`
- **Razón:** Usa `process.exit()` que causa problemas en Jest
- **Estado:** Funciona en local con servidor corriendo
- **Activar:** Comentar en `jest.config.js` línea 8

### `product-delete-http.test.ts`  
- **Razón:** Intenta conectarse a `http://localhost:3001` que no existe en CI
- **Estado:** Funciona en local con servidor corriendo
- **Activar:** Comentar en `jest.config.js` línea 9

### `api.e2e.test.ts`
- **Razón:** Tests E2E que requieren servidor y base de datos activos
- **Estado:** Funciona en local con servidor corriendo
- **Activar:** Comentar en `jest.config.js` línea 10

---

## 🚀 Ejecutar Tests

### Todos los tests activos:
```bash
npm test
```

### Con cobertura:
```bash
npm run test:coverage
```

### Tests específicos:
```bash
npm test -- validation.test.ts
```

---

## 📝 Notas

Para ejecutar los tests E2E en local:
1. Levanta el backend: `npm run dev`
2. En otra terminal, ejecuta los tests desactivados manualmente
3. Los tests CI/CD solo ejecutan tests unitarios que no requieren servidor

---

## 🎯 Roadmap

- [ ] Convertir tests E2E a mocks para ejecutarse sin servidor
- [ ] Quitar `process.exit()` de tests y usar `throw` en su lugar
- [ ] Separar tests unitarios de E2E en carpetas distintas
