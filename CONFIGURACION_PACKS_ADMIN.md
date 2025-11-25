# 🎨 CONFIGURACIÓN DE PACKS DESDE ADMIN

_Guía de implementación completa_

---

## ✅ **YA IMPLEMENTADO:**

### **1. Tipos Actualizados** ✅
```typescript
// calculator.types.ts

export interface PackRecommendationRule {
  packId: string;
  minAttendees?: number;
  maxAttendees?: number;
  priority: number;
  reason?: string;
}

export interface EventTypeConfig {
  recommendedPacks?: PackRecommendationRule[];
  availablePacks?: string[];
}
```

### **2. Lógica de Recomendación en EventCalculatorPage** ✅
```typescript
// Ahora usa la configuración del admin:
- Filtra packs por availablePacks
- Recomienda según recommendedPacks
- Ordena por priority
- Muestra reason si está definida
```

---

## 🚧 **PENDIENTE DE IMPLEMENTAR:**

### **1. Interfaz en CalculatorManagerNew.tsx**

Añadir después de la sección de "Parts List":

```typescript
{/* Packs Configuration */}
<div className="bg-white rounded-lg shadow mt-6">
  <div className="p-6 border-b">
    <h3 className="text-lg font-semibold text-gray-900">
      📦 Configuración de Packs
    </h3>
    <p className="text-sm text-gray-600 mt-1">
      Define qué packs están disponibles y cuáles recomendar
    </p>
  </div>

  <div className="p-6">
    {/* Available Packs */}
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Packs Disponibles para este Evento
      </label>
      <PackSelector
        allPacks={catalogProducts.filter(p => p.isPack)}
        selectedPacks={selectedEvent.availablePacks || []}
        onChange={(packs) => updateEventType(selectedEventIndex, 'availablePacks', packs)}
      />
      <p className="text-xs text-gray-500 mt-1">
        Solo estos packs se mostrarán en la calculadora para este tipo de evento
      </p>
    </div>

    {/* Recommended Packs */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Reglas de Recomendación
      </label>
      <PackRecommendationEditor
        rules={selectedEvent.recommendedPacks || []}
        availablePacks={selectedEvent.availablePacks || []}
        allPacks={catalogProducts.filter(p => p.isPack)}
        onChange={(rules) => updateEventType(selectedEventIndex, 'recommendedPacks', rules)}
      />
    </div>
  </div>
</div>
```

### **2. Componente PackSelector**

```typescript
// components/admin/PackSelector.tsx

interface PackSelectorProps {
  allPacks: any[];
  selectedPacks: string[];
  onChange: (packIds: string[]) => void;
}

const PackSelector: React.FC<PackSelectorProps> = ({ allPacks, selectedPacks, onChange }) => {
  const togglePack = (packId: string) => {
    if (selectedPacks.includes(packId)) {
      onChange(selectedPacks.filter(id => id !== packId));
    } else {
      onChange([...selectedPacks, packId]);
    }
  };

  return (
    <div className="space-y-2">
      {allPacks.length === 0 ? (
        <p className="text-gray-500 text-sm">
          No hay packs disponibles. Crea packs en "Gestión de Productos".
        </p>
      ) : (
        allPacks.map(pack => (
          <label key={pack.id} className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedPacks.includes(pack.id)}
              onChange={() => togglePack(pack.id)}
              className="w-4 h-4 text-resona"
            />
            <img src={pack.mainImageUrl} alt={pack.name} className="w-12 h-12 object-cover rounded" />
            <div className="flex-1">
              <div className="font-medium">{pack.name}</div>
              <div className="text-sm text-gray-500">€{pack.pricePerDay}/día</div>
            </div>
          </label>
        ))
      )}
    </div>
  );
};
```

### **3. Componente PackRecommendationEditor**

```typescript
// components/admin/PackRecommendationEditor.tsx

interface PackRecommendationEditorProps {
  rules: PackRecommendationRule[];
  availablePacks: string[];
  allPacks: any[];
  onChange: (rules: PackRecommendationRule[]) => void;
}

const PackRecommendationEditor: React.FC<PackRecommendationEditorProps> = ({
  rules,
  availablePacks,
  allPacks,
  onChange
}) => {
  const addRule = () => {
    onChange([...rules, {
      packId: availablePacks[0] || '',
      priority: rules.length + 1,
      minAttendees: 0,
      maxAttendees: 1000,
      reason: ''
    }]);
  };

  const updateRule = (index: number, field: string, value: any) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], [field]: value };
    onChange(newRules);
  };

  const removeRule = (index: number) => {
    onChange(rules.filter((_, i) => i !== index));
  };

  const availablePacksData = allPacks.filter(p => availablePacks.includes(p.id));

  return (
    <div className="space-y-4">
      {rules.map((rule, index) => {
        const pack = allPacks.find(p => p.id === rule.packId);
        
        return (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-4">
              {pack && (
                <img src={pack.mainImageUrl} alt={pack.name} className="w-16 h-16 object-cover rounded" />
              )}
              
              <div className="flex-1 space-y-3">
                {/* Pack Selection */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Pack</label>
                  <select
                    value={rule.packId}
                    onChange={(e) => updateRule(index, 'packId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1"
                  >
                    {availablePacksData.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Attendees Range */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Min. Asistentes</label>
                    <input
                      type="number"
                      value={rule.minAttendees || 0}
                      onChange={(e) => updateRule(index, 'minAttendees', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Max. Asistentes</label>
                    <input
                      type="number"
                      value={rule.maxAttendees || 1000}
                      onChange={(e) => updateRule(index, 'maxAttendees', parseInt(e.target.value) || 1000)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1"
                    />
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Prioridad (1 = más alta)
                  </label>
                  <input
                    type="number"
                    value={rule.priority}
                    onChange={(e) => updateRule(index, 'priority', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1"
                    min="1"
                  />
                </div>

                {/* Reason */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Razón (opcional)</label>
                  <input
                    type="text"
                    value={rule.reason || ''}
                    onChange={(e) => updateRule(index, 'reason', e.target.value)}
                    placeholder="Ej: Ideal para grupos pequeños"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1"
                  />
                </div>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => removeRule(index)}
                className="text-red-500 hover:text-red-700 p-2"
                title="Eliminar regla"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {/* Preview */}
            <div className="mt-3 pt-3 border-t text-sm text-gray-600">
              📋 Recomendará "{pack?.name}" para eventos con {rule.minAttendees || 0} a {rule.maxAttendees || '∞'} asistentes
            </div>
          </div>
        );
      })}

      {availablePacks.length > 0 ? (
        <button
          onClick={addRule}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-resona hover:text-resona transition-colors"
        >
          + Añadir Regla de Recomendación
        </button>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">
          Primero selecciona packs disponibles arriba
        </p>
      )}
    </div>
  );
};
```

### **4. Actualizar useCalculatorConfig Hook**

```typescript
// hooks/useCalculatorConfig.ts

// Añadir métodos:
const updateEventType = (index: number, field: string, value: any) => {
  const newConfig = { ...config };
  newConfig.eventTypes[index] = {
    ...newConfig.eventTypes[index],
    [field]: value
  };
  setConfig(newConfig);
};
```

### **5. Cargar Packs en CalculatorManagerNew**

```typescript
// En CalculatorManagerNew.tsx

import { useQuery } from '@tanstack/react-query';
import { productService } from '../../services/product.service';

// Dentro del componente:
const { data: catalogProducts = [] } = useQuery({
  queryKey: ['catalog-products'],
  queryFn: async () => {
    const result = await productService.getProducts({ limit: 200 });
    return result || [];
  },
});
```

---

## 📋 **EJEMPLO DE CONFIGURACIÓN:**

### **Boda - Packs:**

```json
{
  "id": "boda",
  "name": "Boda",
  "availablePacks": [
    "pack-boda-basico",
    "pack-boda-premium",
    "pack-boda-luxury"
  ],
  "recommendedPacks": [
    {
      "packId": "pack-boda-basico",
      "minAttendees": 0,
      "maxAttendees": 100,
      "priority": 1,
      "reason": "Perfecto para bodas íntimas"
    },
    {
      "packId": "pack-boda-premium",
      "minAttendees": 100,
      "maxAttendees": 200,
      "priority": 1,
      "reason": "Ideal para bodas medianas"
    },
    {
      "packId": "pack-boda-luxury",
      "minAttendees": 200,
      "maxAttendees": 999999,
      "priority": 1,
      "reason": "Para grandes celebraciones"
    }
  ]
}
```

---

## 🎯 **FLUJO COMPLETO:**

```
1. ADMIN: Crear Packs
   ├─ Productos → Crear Producto
   ├─ Marcar isPack = true
   └─ Configurar componentes del pack

2. ADMIN: Configurar Evento
   ├─ Calculator Manager → Seleccionar evento
   ├─ Sección "Packs Disponibles"
   │   └─ Seleccionar qué packs puede ver el cliente
   └─ Sección "Reglas de Recomendación"
       ├─ Añadir regla
       ├─ Seleccionar pack
       ├─ Definir rango de asistentes
       ├─ Prioridad (1 = más alta)
       └─ Razón (opcional)

3. CLIENTE: Usa Calculadora
   ├─ Selecciona "Boda"
   ├─ Indica "150 personas"
   ├─ En Step 4 ve:
   │   ├─ ✨ Pack Premium (Recomendado)
   │   │   └─ "Ideal para bodas medianas"
   │   └─ 📦 Otros packs disponibles
   └─ Selecciona pack recomendado
```

---

## ✅ **CHECKLIST DE IMPLEMENTACIÓN:**

```
✅ Tipos actualizados (calculator.types.ts)
✅ Lógica de recomendación (EventCalculatorPage.tsx)
⬜ Componente PackSelector
⬜ Componente PackRecommendationEditor
⬜ Actualizar useCalculatorConfig hook
⬜ Añadir sección en CalculatorManagerNew
⬜ Cargar productos en admin
⬜ Testing completo
```

---

## 🧪 **TESTING:**

```
1. Crear 3 packs diferentes
2. Ir a Calculator Manager
3. Seleccionar evento "Boda"
4. Añadir los 3 packs como disponibles
5. Crear reglas:
   - Pack 1: 0-100 personas
   - Pack 2: 100-200 personas
   - Pack 3: 200+ personas
6. Guardar
7. Ir a calculadora pública
8. Probar con diferentes números de asistentes
9. Verificar que recomienda el correcto
```

---

**¿Quieres que implemente alguno de estos componentes ahora o prefieres hacerlo tú mismo siguiendo esta guía?**
