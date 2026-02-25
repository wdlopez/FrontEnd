# Tres sugerencias para aprovechar mejor el espacio en las páginas

## 1. Título y acciones en una sola fila (aprovechar el ancho)

**Problema:** El título "Gestión de Clientes" y la descripción ocupan toda la fila; los botones (Columnas, +, refrescar, exportar) están dentro del bloque de la tabla, dejando mucho espacio vacío a la derecha del título.

**Sugerencia:** Poner en la misma fila:
- **Izquierda:** título + icono (i) + descripción (en una línea o debajo del título, según diseño).
- **Derecha:** botones de acción de página (Nuevo cliente, Refrescar, Exportar).

Así usas el ancho de la pantalla y evitas una fila casi vacía. Puedes sacar `headerButtons` del `InteractiveTable` y renderizarlos en el layout de la página, alineados a la derecha con `justify-between` o `ml-auto`.

**Ejemplo de estructura:**
```jsx
<div className="flex flex-wrap items-center justify-between gap-3">
  <div>
    <div className="flex gap-2 items-center">
      <InfoTooltip ...><span className="material-symbols-outlined">info</span></InfoTooltip>
      <h1>Gestión de Clientes</h1>
    </div>
    <p className="text-gray-500 text-sm">Administra la base de datos centralizada.</p>
  </div>
  <div className="flex items-center gap-2">
    <HeaderActions onAdd={...} showExport={true} onRefresh={...} />
  </div>
</div>
```

El botón "Columnas" puede quedarse dentro de la tabla (toolbar) o subir también a esta barra, según prefieras.

---

## 2. Contenedor con altura útil y menos hueco bajo la tabla

**Problema:** Debajo de la tabla y la paginación queda un gran espacio en blanco hasta el final de la pantalla.

**Sugerencia:** Hacer que el contenido principal ocupe la altura disponible y que la tabla “empuje” la paginación hacia abajo, en lugar de dejar un bloque rígido en el centro.

- En el **layout de la página** (o del contenido principal), usar algo como:
  - `flex flex-col min-h-[calc(100vh-8rem)]` (o el valor que deje espacio para header + sidebar).
  - El bloque de la tabla con `flex-1 flex flex-col min-h-0`.
- Dentro de `InteractiveTable`, el contenedor con la tabla puede tener `flex-1 min-h-0` y `overflow-auto`, y la paginación ir al final de ese contenedor.

Así la zona de tabla + paginación ocupa el alto disponible y el “hueco” blanco debajo se reduce o desaparece.

---

## 3. Reducir padding y espaciado vertical

**Problema:** `p-6` y `space-y-6` generan bastante aire entre el breadcrumb, el título y la tabla, y pueden hacer que la página se sienta vacía.

**Sugerencia:** Ajustar a valores más compactos sin que se vea apretado:

- Contenedor principal: de `p-6 space-y-6` a **`p-4 space-y-4`** (o `p-5 space-y-4`).
- Opcional: menos margen entre el título y la tabla (por ejemplo, una sola clase `mb-3` o `mb-4` en el bloque del título en lugar de depender solo de `space-y`).

Con esto ganas sensación de densidad y menos “pared” de espacio vacío entre secciones.

---

## Resumen

| Sugerencia | Beneficio principal |
|------------|---------------------|
| 1. Título + acciones en una fila | Aprovecha el ancho; elimina la franja vacía a la derecha del título. |
| 2. Contenedor con altura útil | Reduce o elimina el hueco blanco bajo la tabla. |
| 3. Menos padding / space-y | Página más compacta y menos sensación de espacio desperdiciado. |

Puedes aplicar primero la 1 y la 3 (cambios en el layout de la página) y después la 2 (ajustes en layout global y en `InteractiveTable` si hace falta).
