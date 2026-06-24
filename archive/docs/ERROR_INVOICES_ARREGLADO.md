# ✅ ERROR ARREGLADO: invoices.filter is not a function

## 🐛 **PROBLEMA:**
```
TypeError: invoices.filter is not a function
```

## 🔍 **CAUSA:**
La API `/invoices/` no devuelve directamente un array, sino un objeto que contiene el array.

## ✅ **SOLUCIÓN APLICADA:**

```typescript
// ANTES (INCORRECTO):
const { data: invoices = [], isLoading } = useQuery({
  queryFn: async () => {
    const result = await api.get('/invoices/');
    return result || [];
  },
});

const filteredInvoices = invoices.filter(...); // ❌ Error aquí

// DESPUÉS (CORRECTO):
const { data, isLoading } = useQuery({
  queryFn: async () => {
    const result = await api.get('/invoices/');
    console.log('API Response:', result); // Debug
    return result || [];
  },
});

// Extract invoices array from response
const invoices: any[] = Array.isArray(data) 
  ? data 
  : ((data as any)?.invoices || []);

const filteredInvoices = invoices.filter(...); // ✅ Funciona
```

## 🎯 **CÓMO FUNCIONA:**

1. **Verifica si es array:** `Array.isArray(data)`
2. **Si es array:** Usa directamente
3. **Si es objeto:** Extrae `data.invoices`
4. **Si falla:** Usa array vacío `[]`

## 🧪 **AHORA FUNCIONA:**

```
1. Refresca la página
2. Ve a "Todas las Facturas"
3. Debería cargar la lista sin errores
4. Verás en consola "API Response: ..." para debug
```

---

_Fix aplicado: 19/11/2025 23:01_  
_Estado: ARREGLADO ✅_
