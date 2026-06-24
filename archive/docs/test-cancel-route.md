# Test Cancel Route

El servidor necesita ser reiniciado para que los cambios surtan efecto.

## Pasos para verificar:

1. **Detener el servidor backend**
```bash
cd packages/backend
# Ctrl+C en la terminal donde corre npm run dev
```

2. **Reiniciar el servidor**
```bash
npm run dev
```

3. **Verificar que la ruta está registrada**
El servidor debería mostrar en consola las rutas registradas al iniciar.

4. **Probar la cancelación**
- Ir a Admin → Pedidos
- Abrir un pedido
- Click en "Cancelar Pedido"
- Debería funcionar sin error 404

## Si persiste el error:

Verificar en el terminal del backend que se muestra:
```
POST /api/v1/orders/:id/cancel
```

Si no aparece, hay un problema con el registro de rutas.
