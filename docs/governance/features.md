# INVENTARIO DE FUNCIONALIDADES Y CRITERIOS DE ACEPTACIÓN — soap-ecommerce

> **Documentación viva.** Mantenida y actualizada por el skill **DocSync-Agent**
> tras cada bloque de código. El origen de verdad es el código; este documento lo
> refleja. Si un criterio contradice el código, el criterio está obsoleto.
>
> Última revisión: 2026-09-19 · Convención: IDs `F-<MOD>-NNN` · Estado:
> `Vigente` (verificado en código) | `Propuesto` (definido sin verificación aún)

---

## 1. Inventario de funcionalidades (matriz jerárquica)

### 1.1 Módulo: `catalog/` — Catálogo de productos

| ID | Funcionalidad | Componente(s) | Tipo |
|---|---|---|---|
| F-CAT-001 | Listar productos del catálogo | `ListProducts`, `InMemoryProductRepository`, `GET /api/products` | Lógica de negocio + API |
| F-CAT-002 | Filtrar/buscar productos (categoría, piel, handmade, orgánico, precio, término, disponibilidad) | `FilterProducts`, `ProductFilterCriteria`, `GET /api/products?…` | Lógica de negocio + API |
| F-CAT-003 | Determinar disponibilidad de venta (activo + stock) | `Product.isAvailable()` | Regla de dominio |
| F-CAT-004 | Controlar stock (solo positivo, decremento validado) | `Product.decreaseStock()`, invariante `stock >= 0` | Regla de dominio |
| F-CAT-005 | Garantizar que los ingredientes orgánicos sean subconjunto de los ingredientes | invariante `Product` | Regla de dominio |
| F-CAT-006 | Persistencia del catálogo (memoria / TypeORM target) | `InMemoryProductRepository`, `ProductTypeOrmRepository`, `ProductOrmEntity` | Persistencia |
| F-CAT-007 | Validación de moneda y montos de precio | `Money` | Regla de dominio |

### 1.2 Módulo: `cart/` — Carrito de compras

| ID | Funcionalidad | Componente(s) | Tipo |
|---|---|---|---|
| F-CAR-001 | Obtener/crear carrito de un cliente | `Cart`, `CartRepository`, `GET /api/cart/:cartId` | Lógica + API |
| F-CAR-002 | Agregar item al carrito con validación de stock y merge por producto | `AddItemToCart`, `Cart.addItem`, `POST /api/cart/items` | Lógica de negocio + API |
| F-CAR-003 | Calcular total del carrito en COP | `Cart.total()`, `Money.add` | Regla de dominio |
| F-CAR-004 | Exponer vista serializable del carrito | `GetCart`, `GetCartResult` | Lógica de negocio |
| F-CAR-005 | Prohibir cantidades no positivas | `CartItem.fromProduct` | Regla de dominio |
| F-CAR-006 | Persistencia del carrito (memoria / TypeORM target) | `InMemoryCartRepository` | Persistencia |
| F-CAR-007 | Eliminar un item del carrito por producto | `RemoveItemFromCart`, `Cart.removeItem`, `DELETE /api/cart/:cartId/items/:productId` | Lógica + API |

### 1.3 Módulo: `checkout/` — Checkout y órdenes

| ID | Funcionalidad | Componente(s) | Tipo |
|---|---|---|---|
| F-CHK-001 | Procesar checkout y generar la orden | `ProcessCheckout`, `Order.create` | Lógica de negocio |
| F-CHK-002 | Cobrar el pago vía pasarela y marcar la orden | `PaymentGateway.charge`, `Order.markAsPaid` | Integración |
| F-CHK-003 | Persistir la orden aunque el pago falle (estado `failed`) | `ProcessCheckout`, `Order.markAsFailed` | Regla de negocio |
| F-CHK-004 | Rechazar checkout de carrito vacío/inexistente | `ProcessCheckout` | Regla de negocio |
| F-CHK-005 | Rechazar checkout con cliente inexistente | `ProcessCheckout` | Regla de negocio |
| F-CHK-006 | Validar que una orden tenga al menos un item | invariante `Order` | Regla de dominio |
| F-CHK-007 | Manejar la máquina de estados de la orden (pending/paid/failed/cancelled) | `Order` | Regla de dominio |
| F-CHK-008 | Persistencia de órdenes (memoria / TypeORM target) | `InMemoryOrderRepository` | Persistencia |
| F-PAY-001 | Simular resultados de pago (éxito/fallo aleatorio) | `MockPaymentGateway` | Integración (mock) |

### 1.4 Módulo: `customers/` — Clientes

| ID | Funcionalidad | Componente(s) | Tipo |
|---|---|---|---|
| F-CUS-001 | Registrar/consultar cliente con validación de email y dirección | `Customer.create`, `CustomerRepository` | Regla de dominio + persistencia |

### 1.5 Módulo: `shared/` — Core transaccional

| ID | Funcionalidad | Componente(s) | Tipo |
|---|---|---|---|
| F-SHR-001 | Representar dinero con moneda COP y operaciones seguras | `Money` | VO/regla de dominio |
| F-SHR-002 | Tipos de piel y categorías de producto tipados | `SkinType`, `ProductCategory` | VO/tipos |

### 1.6 Módulo: `web/` — Adapter REST (API)

| ID | Funcionalidad | Componente(s) | Tipo |
|---|---|---|---|
| F-WEB-001 | Endpoint `GET /api/products` con filtros vía query | `server.ts`, `FilterProducts` | API |
| F-WEB-002 | Endpoint `POST /api/cart/items` (agregar al carrito) | `server.ts`, `AddItemToCart` | API |
| F-WEB-003 | Endpoint `GET /api/cart/:cartId` (vista del carrito) | `server.ts`, `GetCart` | API |
| F-WEB-008 | Endpoint `DELETE /api/cart/:cartId/items/:productId` (eliminar item del carrito) | `server.ts`, `RemoveItemFromCart` | API |
| F-WEB-004 | Endpoint `POST /api/checkout` (generar orden) | `server.ts`, `ProcessCheckout` | API |
| F-WEB-005 | Seed del catálogo demo (10 productos + imágenes SVG) | `seed.ts`, `PRODUCT_IMAGES` | Datos demo |
| F-WEB-006 | Cliente demo fijo (`c1`) | `seed.ts` | Datos demo |
| F-WEB-007 | Servir frontend estático (`public/`) | `server.ts` | Infraestructura web |

### 1.7 Módulo: UI — Frontend (`public/`)

| ID | Funcionalidad | Componente(s) | Tipo |
|---|---|---|---|
| F-UI-001 | Grid de tarjetas de producto con badges e imagen | `index.html`, `app.js#renderCatalog` | UI |
| F-UI-002 | Barra de filtros vinculada a la API | `app.js#loadProducts`, eventos | UI + lógica |
| F-UI-003 | Drawer de carrito con contador y totales COP | `app.js#updateCartUI`, `openCart/closeCart` | UI |
| F-UI-004 | Flujo de checkout desde el drawer con mensajes de estado y txn | `app.js#checkoutBtn` | UI + lógica |
| F-UI-005 | Persistencia local del `cartId` | `getCartId()` + `localStorage` | UI/lógica |
| F-UI-006 | Manejo de estados vacío / agotado / búsqueda sin resultados | `renderCatalog`, `updateCartUI` | UI |
| F-UI-007 | Formato de dinero es-CO + fallback de imagen cuando no hay `image` | `formatMoney`, `renderCatalog` | UI |

### 1.8 Infraestructura sugerida — TypeORM (target, no conectado)

| ID | Funcionalidad | Componente(s) | Tipo |
|---|---|---|---|
| F-TOR-001 | DataSource PostgreSQL configurado | `data-source.ts` | Infraestructura |
| F-TOR-002 | Entidad de persistencia `products` con mappers | `ProductOrmEntity`, `ProductTypeOrmRepository` | Persistencia |

---

## 2. Criterios de aceptación vigentes / propuestos

Formato BDD: **Dado / Cuando / Entonces**. Se incluye el criterio técnico asociado.
`[Vigente]` = verificado contra el código actual; `[Propuesto]` = propuesta inicial.

### 2.1 Catálogo

**F-CAT-001 — Listar productos**
- [Vigente] Dado un catálogo con productos activos e inactivos, cuando se lista el catálogo, entonces se devuelven todos los productos con sus datos serializados (`id, name, description, price, ingredients, organicIngredients, category, recommendedSkinType, handmade, stock, batch, available, image`).
- [Vigente] Técnico: `GET /api/products` responde 200 con `{ total, products[] }`.

**F-CAT-002 — Filtrar y buscar**
- [Vigente] Dado el query de filtros (`search`, `skin`, `category`, `handmade`, `organic`, `available`, precios), cuando se consume `GET /api/products`, entonces solo se devuelven productos que cumplen TODOS los filtros combinados (AND).
- [Vigente] Dado un filtro `available=true`, cuando hay productos `active=false` o `stock=0`, entonces esos productos quedan excluidos.
- [Vigente] Técnico: query inválido responde 400 `{error}`; los filtros se traducen a `ProductFilterCriteria`.

**F-CAT-003 — Disponibilidad**
- [Vigente] Dado un producto `active=false` o `stock=0`, cuando se evalúa su disponibilidad, entonces `isAvailable()` = false y el frontend lo muestra "Agotado" con botón deshabilitado.

**F-CAT-004 — Stock**
- [Vigente] Dado un intento de crear un producto con `stock < 0`, cuando se ejecuta `Product.create`, entonces el dominio lanza un error (invariante).
- [Vigente] Dado un stock insuficiente, cuando se decrementa, entonces la operación lanza error y no modifica el stock.

**F-CAT-005 — Ingredientes orgánicos**
- [Vigente] Dado un producto cuyo conjunto de ingredientes orgánicos excede al de ingredientes, cuando se crea, entonces el dominio rechaza la creación (invariante).

**F-CAT-006 — Persistencia catálogo**
- [Vigente] Dado el repositorio en memoria, cuando se listan/guardan productos, entonces los datos persisten mientras el proceso esté vivo.
- [Propuesto] Técnico: al conectar `ProductTypeOrmRepository`, todo caso de uso debe seguir usando el mismo puerto `ProductRepository` sin cambios en `domain/`.

**F-CAT-007 — Moneda y montos**
- [Vigente] Dado un precio, cuando se representa en el dominio, entonces es un `Money` con moneda `COP`, monto no negativo y redondeo a 2 decimales; el frontend lo formatea con `Intl` locale es-CO.

### 2.2 Carrito

**F-CAR-001 — Carrito de cliente**
- [Vigente] Dado un `cartId` inexistente, cuando `AddItemToCart` agrega el primer item, entonces se crea el carrito ligado al `customerId` provisto.
- [Vigente] Dado un `cartId` existente, cuando se consulta `GET /api/cart/:cartId`, entonces se devuelve su vista serializada (200); si no existe, 404 `{error}`.

**F-CAR-002 — Agregar item (stock + merge)**
- [Vigente] Dado un producto con stock disponible, cuando se agrega con `quantity>0`, entonces el item se agrega o se fusiona (incrementa cantidad) por `productId`.
- [Vigente] Dado un producto sin stock suficiente, cuando se intenta agregar, entonces la operación falla con mensaje `Stock insuficiente para "{name}". Disponible: {stock}, solicitado: {qty}.` y el carrito no cambia.
- [Vigente] Dado un `productId` inexistente, cuando se agrega, entonces falla con `Producto no encontrado: {id}`.
- [Vigente] Dado `quantity <= 0`, cuando se agrega, entonces falla con `La cantidad a agregar debe ser mayor a cero.`

**F-CAR-003 — Total**
- [Vigente] Dado un carrito con N items, cuando se calcula el total, entonces es la suma de `lineTotal` de cada item; carrito vacío = 0 COP.

**F-CAR-004 — Vista serializable**
- [Vigente] Dado un carrito, cuando `GetCart` lo expone, entonces los montos viajan como `{amount, currency}` y no se exponen objetos `Money` internos.

**F-CAR-005 — Cantidades positivas**
- [Vigente] Dado `quantity <= 0`, cuando se crea un `CartItem`, entonces el dominio lanza error.

**F-CAR-006 — Persistencia carrito**
- [Vigente] Dado el repositorio en memoria, cuando se guarda un carrito, entonces persiste mientras el proceso esté vivo (se resetea al reiniciar `npm start`).
- [Propuesto] Técnico: la migración TypeORM de carrito/órdenes debe respetar `exactOptionalPropertyTypes`.

**F-CAR-007 — Eliminar item del carrito** [Vigente]
- Dado un carrito con un item `productId` concreto, cuando se ejecuta `DELETE /api/cart/:cartId/items/:productId`, entonces el item se elimina, el total y el contador se recalculan y la API devuelve la vista actualizada.
- Dado un carrito inexistente, cuando se elimina un item, entonces falla con `Carrito no encontrado.` y 400.
- Dado un item que no está en el carrito, cuando se intenta eliminar, entonces falla con `El articulo no esta en el carrito.` y 400.
- Dado el único item del carrito, cuando se elimina, entonces el carrito queda vacío (`isEmpty=true`, total 0).
- Desde la UI: cada fila del drawer muestra un botón ✕ (rojo); al pulsarlo, la fila se quita sin perder el `cartId` local.

### 2.3 Checkout y órdenes

**F-CHK-001 — Checkout exitoso**
- [Vigente] Dado un carrito con items y un cliente existente, cuando el pago simulado es exitoso, entonces se crea una orden `paid` con su `transactionId`, se persiste, y se devuelve `{orderId, status, total, transactionId?}`.

**F-CHK-002 — Pago fallido**
- [Vigente] Dado un carrito válido, cuando el pago simulado falla, entonces la orden se persiste con estado `failed` y `transactionId` ausente, y el checkout responde el fallo.
- [Vigente] Técnico: `MockPaymentGateway` ignora latencia y probabilidad de fallo por inyección de configuración.

**F-CHK-003 — Persistencia siempre**
- [Vigente] Dado cualquier resultado de pago (éxito o fallo), cuando se procesa el checkout, entonces la orden siempre queda guardada en el repositorio.

**F-CHK-004 — Carrito vacío/inexistente**
- [Vigente] Dado un carrito vacío o inexistente, cuando se ejecuta checker, entonces falla con `El carrito esta vacio o no existe.` y no se crea orden.

**F-CHK-005 — Cliente inexistente**
- [Vigente] Dado un `customerId` sin registro, cuando se ejecuta el checkout, entonces falla con `Cliente no encontrado: {id}`.

**F-CHK-006 — Orden con items**
- [Vigente] Dado el intento de crear una orden sin items, cuando se ejecuta `Order.create`, entonces el dominio lanza error (invariante).

**F-CHK-007 — Estados de orden**
- [Vigente] Dado el flujo pago, cuando la orden cambia de estado, entonces transita `pending -> paid | failed` vía `markAsPaid/markAsFailed`; `cancelled` queda reservado.
- [Propuesto] Cuando se implemente cancelación, la transición debe ser `pending -> cancelled` (nunca desde paid/failed).

**F-CHK-008 — Persistencia órdenes**
- [Vigente] Dado el repositorio de órdenes en memoria, cuando se guarda/busca una orden, entonces funciona mientras el proceso esté vivo.

**F-PAY-001 — Pasarela mock**
- [Vigente] Dado `MockPaymentGateway`, cuando se cobra, entonces devuelve `PaymentResult` con `success`, `transactionId` (formato `txn_{orderId}_{ts}`) y `message`; determinista por configuración inyectada.

### 2.4 Clientes

**F-CUS-001 — Cliente válido**
- [Vigente] Dado un email sin `@` o dirección vacía, cuando se crea un cliente, entonces el dominio rechaza la creación.
- [Vigente] Dado el seed (`c1`), cuando el frontend hace checkout, entonces el adapter asocia el carrito al cliente `c1` sin intervención del usuario.

### 2.5 Shared

**F-SHR-001 — Money**
- [Vigente] Dado dos montos en la misma moneda, cuando se suman/multiplican, entonces el resultado es un `Money` válido; sumar monedas distintas lanza error.

**F-SHR-002 — Tipos**
- [Vigente] Dado el modelo, cuando se tipa piel/categoría, entonces solo se aceptan valores de `SkinType` y `ProductCategory` (compile-time).

### 2.6 Web (API)

**F-WEB-001..004 — Contratos REST** ([Vigente], detalle en `context.md §9)
- `GET /api/products` → 200 `{total, products[]}` | 400 `{error}`
- `POST /api/cart/items` body `{cartId, productId, quantity}` → 200 vista carrito | 400 `{error}`
- `GET /api/cart/:cartId` → 200 GetCartResult | 404 `{error}`
- `DELETE /api/cart/:cartId/items/:productId` → 200 vista carrito actualizada | 400 `{error}`
- `POST /api/checkout` body `{cartId}` → 200 `{orderId, status, total, transactionId?}` | 400 `{error}`
- [Propuesto] Técnico: añadir validación de DTO en los bordes HTTP (hoy se valida solo en el dominio).

**F-WEB-005 — Seed**
- [Vigente] Dado que se inicia el servidor, cuando se lista el catálogo, entonces hay 10 productos (`p1..p10`) con imagen SVG data-URI; `p3` (Avena y Miel) está agotado (`stock=0`).
- [Vigente] [Propuesto] cada nuevo producto seed debe incluir `image`; si no, la UI usa el fallback 🧼.

**F-WEB-007 — Estático**
- [Vigente] Dado el servidor levantado, cuando se navega a `http://localhost:3000/`, entonces se sirve el frontend.

### 2.7 UI

**F-UI-001 — Grid/tarjetas** [Vigente]
- Dado el catálogo cargado, cuando se renderiza, entonces cada producto muestra nombre, descripción, badges (hecho a mano/orgánico/piel/agotado), precio COP e imagen; botón "Agregar" deshabilitado si no hay stock.

**F-UI-002 — Filtros** [Vigente]
- Dado que el usuario cambia un filtro, cuando se dispara el evento, entonces se recarga la lista desde la API; "Enter" en búsqueda también dispara la carga; búsqueda sin resultados muestra el mensaje de vacío.

**F-UI-003 — Drawer carrito** [Vigente]
- Dado un carrito con items, cuando se actualiza la UI, entonces el contador y los dos totales (header y drawer) reflejan cantidades y total COP; carrito vacío muestra "Tu carrito esta vacio.".

**F-UI-004 — Checkout UI** [Vigente]
- Dado el botón "Pagar", cuando el checkout falla, entonces se muestra mensaje en rojo; si tiene éxito, se muestra `Pedido {id} · {STATUS} · Txn {txn}` en color marca, se resetea el carrito local y se recarga la vista.

**F-UI-005 — cartId local** [Vigente]
- Dado el navegador, cuando se agrega el primer item, entonces se persiste `cartId` en `localStorage` y se reutiliza entre recargas.

---

## 3. Reglas de mapeo archivo -> funcionalidad (para DocSync-Agent)

| Tocado (archivo/carpeta) | Funcionalidades afectadas |
|---|---|
| `src/catalog/domain/**` | F-CAT-001 a F-CAT-005, F-CAT-007 |
| `src/catalog/infrastructure/**` · `infrastructure/persistence/typeorm/**` | F-CAT-006, F-TOR-001, F-TOR-002 |
| `src/cart/domain/**` | F-CAR-002 a F-CAR-005, F-CAR-007 |
| `src/cart/infrastructure/**` | F-CAR-006 |
| `src/checkout/domain/**` | F-CHK-001 a F-CHK-007 |
| `src/checkout/infrastructure/**` | F-CHK-008, F-PAY-001 |
| `src/customers/**` | F-CUS-001 |
| `src/shared/domain/**` | F-SHR-001, F-SHR-002 |
| `src/web/server.ts` | F-WEB-001 a F-WEB-004, F-WEB-007, F-WEB-008 |
| `src/web/seed.ts` | F-WEB-005, F-WEB-006 |
| `public/app.js` | F-UI-001 a F-UI-007 |
| `public/index.html` | F-UI-001 a F-UI-004 |

> Regla: si el cambio no está en esta tabla, DocSync-Agent debe revisar el diff,
> proponer nuevas filas/funcionalidades y ampliar la tabla antes de continuar.