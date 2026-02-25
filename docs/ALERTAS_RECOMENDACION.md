# Alertas: comparación y recomendación

## Estado actual en tu proyecto

| Uso | Dónde | Comportamiento |
|-----|--------|----------------|
| **Alerts** (componente) | Páginas: estado `alert` + `<Alerts open message type setOpen />` | Overlay pantalla completa, auto-cierre 3.6s, un mensaje por página |
| **Swal** (SweetAlert2) | Modales y formularios: `Swal.fire("Título", "Mensaje", "success")` | Modal centrado, bloquea interacción hasta cerrar |

Problemas del componente actual:
- **success** está en azul y **error** en amarillo (debería ser verde/rojo).
- Overlay completo es pesado para un simple “Guardado correctamente”.
- Código dice 4 segundos pero usa 3600 ms (3.6 s).

---

## Cómo lo hacen grandes empresas

- **Toasts / notificaciones no bloqueantes**  
  Ej: Linear, Vercel, Notion, GitHub, Stripe.  
  Pequeña tarjeta en esquina (arriba o abajo), auto-cierre, no tapan la pantalla y permiten apilar varios mensajes. Ideal para éxito/error después de guardar o eliminar.

- **Banners arriba del contenido**  
  Ej: AWS Console, algunos dashboards.  
  Barra fija arriba (éxito, error, aviso). No modal, no overlay.

- **Modales solo para confirmaciones**  
  Ej: “¿Eliminar?”, “¿Descartar cambios?”.  
  Aquí sí tiene sentido bloquear y pedir OK/Cancelar. Swal encaja bien.

Conclusión: para mensajes de feedback (“Guardado”, “Error al cargar”) lo habitual es **toast o banner**; para “¿Estás seguro?” se usa **modal (Swal o similar)**.

---

## Opciones

### 1. Unificar todo con Swal

- Páginas dejan de usar `<Alerts>` y llaman `Swal.fire({ title: "Éxito", text: message, icon: "success" })`.
- **Pros:** Una sola API, ya la usas en modales, consistencia visual.
- **Contras:** Sigue siendo modal y bloqueante; para muchos “Guardado correctamente” puede resultar pesado.

### 2. Toasts (recomendado para feedback)

- Añadir librería de toasts (p. ej. **react-hot-toast** o **sonner**) o un componente propio tipo toast.
- Páginas y modales usan toasts para éxito/error; Swal solo para confirmaciones (eliminar, etc.).
- **Pros:** No bloquea, moderno, varias notificaciones a la vez, mejor UX para feedback rápido.
- **Contras:** Refactor de `setAlert` en páginas y posiblemente un contexto/provider.

### 3. Mejorar solo el componente Alerts (sin librería)

- Mantener la API actual (`open`, `message`, `type`, `setOpen`).
- Cambios: **success** → verde, **error** → rojo; quitar overlay y convertirlo en **banner fijo arriba** o **tarjeta flotante** (estilo toast); ajustar auto-cierre a 4 s si quieres; opcional icono por tipo.
- **Pros:** Poco cambio en el resto del código, sin dependencias nuevas.
- **Contras:** Sigue siendo un solo mensaje por página; no es un sistema de toasts apilables.

---

## Recomendación práctica

- **Corto plazo:**  
  Mejorar el componente **Alerts** actual: corregir colores (success verde, error rojo), quitar overlay y mostrarlo como **banner arriba** o **toast** en una esquina, con auto-cierre y mismo API. Así no tocas todas las páginas y la experiencia mejora.

- **Mediano plazo:**  
  Si quieres alinearte con productos tipo Linear/Stripe: introducir **toasts** (react-hot-toast o similar) para éxito/error y usar **Swal solo para confirmaciones**. Las páginas irían migrando de `setAlert` a algo como `toast.success(message)`.

Si indicas si prefieres “solo mejorar Alerts” o “avanzar hacia toasts + Swal solo para confirmar”, se puede bajar esto a cambios concretos en `Alerts.jsx` y/o en una página de ejemplo.
