## Contexto de multi‑tenant por `clientId` y `key_client`

Este microservicio de autenticación ya soporta **aislamiento por cliente/esquema** usando la información que viaja en el JWT:

- **`clientId: string[]`**: lista de IDs de cliente a los que el usuario tiene acceso (en la mayoría de casos será **1 solo**).
- **`key_client: string[]`**: claves lógicas de esquema asociadas a esos clientes (por ejemplo `["microsoft"]`).
- **`tenantContext: "client" | "provider" | "system"`**: tipo de tenant para el que se emitió el token.
- **`role` y `permissions`**: controlan qué puede hacer el usuario dentro de su tenant, pero **no deben romper el aislamiento de cliente**.

Ejemplos reales de payload (recortados):

```json
{
  "sub": "cfa4871b-2741-40f2-9b1a-06a19800df5e",
  "role": ["client_contract_admin"],
  "permissions": ["clients.read", "contracts.read", "user.read", "..."],
  "clientId": ["9c1ab908-2a04-418a-9ae9-24b97be3ec1e"],
  "tenantContext": "system",
  "key_client": ["Microsoft"],
  "aud": "contract-auth-users",
  "iss": "contract-auth-service"
}
```

```json
{
  "sub": "280e89fa-0dc2-4d27-89ce-32ac43f8b2ee",
  "role": ["client_superadmin"],
  "permissions": ["clients.read", "contracts.read", "user.read", "..."],
  "clientId": ["9c1ab908-2a04-418a-9ae9-24b97be3ec1e"],
  "tenantContext": "system",
  "key_client": ["Microsoft"],
  "aud": "contract-auth-users",
  "iss": "contract-auth-service"
}
```

Ambos usuarios **tienen el mismo `clientId` y `key_client`**, por lo que **solo deben ver información de ese cliente/esquema**, aunque uno sea `client_superadmin` y otro `client_contract_admin`.

---

## 1. Qué hace hoy el Auth Service

- **Genera el JWT con `clientId` y `key_client`** en `SignInService`:

```ts
// src/modules/auth/infrastructure/services/sign-in.service.ts
const tokens = this.jwtService.generateTokens({
  sub: user.id,
  role: roles,
  permissions,
  fullName: `${user.firstName} ${user.lastName}`.trim(),
  email: user.email,
  clientId: roles.includes(ROLES.SUPER_ADMIN)
    ? [...SUPER_ADMIN_ACCESS.ALL_ACCESS_ARRAY]
    : (user.userClients?.map((client) => client.clientId) ?? undefined),
  providerId: user.providerId ?? undefined,
  tenantContext: this.determineTenantContext(user),
  key_client: roles.includes(ROLES.SUPER_ADMIN)
    ? [...SUPER_ADMIN_ACCESS.ALL_ACCESS_ARRAY]
    : (user.userClients?.map((client) => client.clientName || 'Unknown') ?? undefined),
  sessionId: session?.id,
});
```

- El `JwtService` **normaliza** el payload y deja listo lo que verán los otros microservicios:

```ts
// src/common/services/jwt/jwt.service.ts
generateTokens(payload: JwtPayload): JwtTokens {
  const isSuperAdmin = payload.role?.includes(ROLES.SUPER_ADMIN);

  const accessPayload = {
    ...payload,
    clientId: isSuperAdmin ? SUPER_ADMIN_ACCESS.ALL_ACCESS_ARRAY : payload.clientId,
    key_client: isSuperAdmin ? SUPER_ADMIN_ACCESS.ALL_ACCESS_ARRAY : payload.key_client,
    tenantContext: payload.tenantContext,
  };

  // ...
}
```

- El `PermissionsGuard` **inyecta el tenant** en el `Request` HTTP para que los controladores puedan usarlo:

```ts
// src/common/security/guards/permissions.guard.ts
if (user.clientId && user.clientId.length > 0) {
  request.tenantId = user.clientId[0];
  request.tenantContext = user.tenantContext || 'client';
}
```

Con esto, cualquier controlador/servicio puede usar `request.tenantId` como **filtro obligatorio** en sus consultas.

---

## 2. Qué debe hacer el frontend con `clientId` / `key_client`

### 2.1. Flujo general en el frontend

1. **Iniciar sesión** contra este Auth Service.
2. Guardar el **JWT de acceso** (por ejemplo en memoria, Redux, Zustand, etc.).
3. Decodificar el JWT (sin validarlo criptográficamente, solo leer el payload) y extraer:
   - `clientId[0]` → ID de cliente asignado.
   - `key_client[0]` → clave de esquema asignada.
   - `role` y `permissions` → para la UI (qué menús mostrar, botones, etc.).
4. Cada vez que llame a **otro microservicio** (contracts, deliveries, invoices, etc.):
   - Enviar siempre el **JWT completo en el header `Authorization: Bearer <token>`**.
   - Enviar además un **header claro de contexto de cliente/esquema**, por ejemplo:
     - `X-Client-Id: <clientId[0]>`
     - `X-Client-Key: <key_client[0]>`
     - `X-Tenant-Context: client` (o el valor real de `tenantContext`).

### 2.2. Recomendación práctica para el agente del frontend

Si vas a pasar este contexto a otro agente de frontend (por ejemplo otro repositorio o microfrontend), documenta estas reglas:

- **Regla 1 – Token único de sesión**  
  Todo microfrontend debe usar **el mismo JWT** emitido por este Auth Service y **no debe emitir tokens propios**.

- **Regla 2 – No confiar en los selects del UI**  
  Si el usuario es `client_superadmin` o `client_contract_admin`, aunque en la UI se muestre un select de clientes, **el backend siempre debe filtrar por el `clientId` del token**, no por lo que venga del cliente.

- **Regla 3 – Propagar contexto de tenant siempre**  
  Capa HTTP del frontend (axios/fetch wrapper) debe, para cada request:

  ```ts
  // Pseudocódigo de un HttpClient del frontend
  const token = authStore.accessToken;
  const payload = decodeJwt(token); // sin validar firma, solo decodificar base64

  const clientId = payload.clientId?.[0];
  const clientKey = payload.key_client?.[0];
  const tenantContext = payload.tenantContext ?? 'client';

  httpClient.interceptors.request.use((config) => {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
      'X-Client-Id': clientId,
      'X-Client-Key': clientKey,
      'X-Tenant-Context': tenantContext,
    };
    return config;
  });
  ```

- **Regla 4 – No exponer IDs de otros clientes**  
  El frontend **nunca** debe construir URLs con IDs de otros clientes manualmente. Siempre debe trabajar con los datos que el backend ya filtró por tenant.

---

## 3. Qué deben hacer los otros microservicios para respetar el aislamiento

Aunque este README está en el servicio de autenticación, la idea es que cada microservicio (contracts, deliveries, etc.) siga este patrón:

- **3.1. Validar el JWT** con el paquete `permissions-contractx` o con la misma lógica que usa este servicio:
  - Extraer `role`, `permissions`, `clientId`, `key_client`, `tenantContext`.
  - Rechazar (`401`/`403`) si el token no es válido o no tiene permisos.

- **3.2. Fijar el tenant desde el token, no desde el body**:

  - Ignorar cualquier `clientId` que venga en el body/query de la petición si el usuario **no es súper admin global**.
  - Tomar siempre el **`clientId[0]` que viene en el JWT**.
  - Usar `key_client[0]`/`tenantContext` para seleccionar el **schema** correcto en la base de datos.

- **3.3. Patrón de filtrado obligatorio en repositorios/queries**:

  Ejemplo genérico en otro microservicio:

  ```ts
  // Pseudocódigo de un handler en otro microservicio
  async findAllContracts(request: RequestWithUserAndTenant) {
    const tenantId = request.tenantIdFromToken; // viene del JWT

    return this.contractRepository.find({
      where: { clientId: tenantId },
    });
  }
  ```

  El objetivo es que **no haya ninguna consulta “global”** salvo que:

  - Sea un usuario con rol **súper admin global real** (no `client_superadmin` de un cliente concreto).
  - Y explícitamente el código lo permita (por ejemplo comprobando `SUPER_ADMIN_ACCESS.ALL_ACCESS_ARRAY`).

---

## 4. Casos concretos: por qué ves “todos los clientes/usuarios” en el frontend

Si con un usuario `client_superadmin` o `client_contract_admin` ves **todos los clientes/usuarios** en el frontend, normalmente está pasando una de estas cosas:

- **El frontend no está usando el `clientId` del token** y está llamando a endpoints sin filtro de tenant, o usando un filtro que el backend no respeta.
- **El microservicio de destino no filtra por `clientId` del token** y devuelve todo.
- Se está tratando a `client_superadmin` como si fuera un **súper admin global**, usando lógica de `SUPER_ADMIN_ACCESS.ALL_ACCESS_ARRAY` cuando no corresponde.

Para corregirlo:

1. **Frontend**: implementar el interceptor descrito en la sección 2.2 y asegurarse de que **todas** las llamadas pasan el JWT y los headers de tenant.
2. **Microservicios**: revisar handlers/listeners/repositorios para asegurar que:
   - Siempre filtran por `clientId`/`key_client` del token.
   - Ignoran `clientId` del body/query para roles que no sean súper admin global.
3. **Auth Service**: mantener la emisión del JWT con:
   - `clientId`: lista de IDs permitidos para ese usuario.
   - `key_client`: clave coherente con el `schema_name` que se crea en los otros microservicios (ver `MicroserviceClientService.transformToSchemaPayload`).

---

## 5. Resumen para pasar a otros agentes (frontend y backend)

- **El JWT es la fuente de verdad** del tenant (`clientId[]`, `key_client[]`, `tenantContext`).
- **El frontend debe propagar ese contexto en cada request** (Authorization + headers de tenant) y jamás inventar IDs de otros clientes.
- **Cada microservicio debe filtrar siempre por el tenant del token**, sin confiar en parámetros enviados por el cliente.
- Roles como `client_superadmin` o `client_contract_admin` tienen muchos permisos, pero **siguen encerrados en su `clientId`/`key_client`**, no son súper admins globales.

---

## 6. Guía rápida para nuevas pantallas del frontend ContractX

- **Siempre usa `useAuth()`** desde `src/context/AuthContext.jsx` para obtener:
  - `user.role`
  - `currentClientId` (primer elemento de `clientId[]`)
  - `currentKeyClient` (primer elemento de `key_client[]`)
  - `isGlobalAdmin` (verdadero solo para el súper admin global real).

- **Nunca inventes `clientId` ni `key_client` en la UI**:
  - No aceptes `clientId` como input libre en formularios ni en queries.
  - Si necesitas asociar algo a un cliente (por ejemplo, crear un usuario), usa el patrón de `entityId` (`c_<id>` / `p_<id>`) y deja que el backend valide contra el token.

- **Para llamadas HTTP, usa siempre los clientes centralizados de `src/config/api.js`**:
  - `api`, `apiProviders`, `apiContracts`, etc. ya añaden:
    - `Authorization: Bearer <token>`
    - `X-Client-Id: clientId[0]`
    - `X-Client-Key: key_client[0]`
    - `X-Tenant-Context: tenantContext` (por defecto `client`).
  - No construyas manualmente estos headers en cada servicio/página.

- **Reglas por rol en el frontend**:
  - `super_admin` (global):
    - Único que puede cambiar de esquema mediante el selector de cliente del Topbar (`x-target-schema`).
    - Puede ver/agregar/editar recursos de distintos clientes, siempre que el backend lo permita explícitamente.
  - `client_superadmin` y `client_contract_admin`:
    - Ven y operan solo dentro de su `clientId`/`key_client` del token.
    - Los selects de cliente en formularios deben estar bloqueados a su cliente.

- **Buenas prácticas al crear nuevas pantallas**:
  - Usa componentes de tabla/formulario que reciban datos ya filtrados por el backend; evita re-filtrar por `clientId` en frontend salvo para detalles de UI.
  - Si necesitas filtrar por cliente en una pantalla pensada para súper admin global, apóyate en el selector del Topbar y en `x-target-schema`, nunca en parámetros arbitrarios enviados por la UI.
