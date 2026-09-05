# CONTEXTO TÉCNICO — soap-ecommerce

> **Documento autoritativo y autocontenido del proyecto.** El **Tech Leader** debe
> leer este archivo ANTES de tomar cualquier decisión de diseño o despachar trabajo.
> Contiene: visión, stack, arquitectura, inventario de archivos, modelo de datos,
> contratos de dominio (entidades, casos de uso, puertos), API HTTP, frontend,
> persistencia, pagos, reglas de negocio, verificación, flujo operativo y roadmap.
>
> Rige junto con `rules.md` (reglas intransigentes) y `agents/system-prompts.md`
> (roles). Se actualiza en cada hito que cambie contratos o arquitectura.

---

## 1. Visión del producto

Plataforma de **comercio electrónico de jabones artesanales y cosmética natural**.
Flujo core del negocio:

```
Catálogo (productos)  ->  Carrito  ->  Checkout (orden + pago)
     catalog/             cart/          checkout/ (+ customers/)
```

Moneda base del dominio: **COP**. Presentación: tienda web estática (dashboard)
consumiendo una API REST local. Persistencia actual: en memoria (para demo);
diseñada para migrar a **PostgreSQL + TypeORM**.

---

## 2. Stack tecnológico

| Capa | Tecnología | Notas |
|---|---|---|
| Lenguaje | TypeScript **estricto** ^5.4 | `strict`, `noImplicitAny`, `strictNullChecks`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `exactOptionalPropertyTypes` |
| Runtime | Node.js + ts-node | ejecución directa TS, sin paso de build para dev |
| HTTP (adapter) | Express ^4.19 | `src/web/server.ts` |
| Frontend | HTML/CSS/JS vanilla + Tailwind (Play CDN) | estático en `public/` |
| ORM relacional (target) | TypeORM ^0.3.20 + `reflect-metadata` | sugerido; archivos en `infrastructure/persistence/typeorm/` |
| Persistencia actual | En memoria (`InMemory*Repository`) | volatil; se resetea al reiniciar el proceso |
| Pago | Puerto `PaymentGateway` + `MockPaymentGateway` | simulación; integración real pendiente |

**Scripts (`package.json`)**
- `npm run typecheck` → `tsc --noEmit` (validación obligatoria de todo cambio)
- `npm run build` → `tsc --project tsconfig.json` (salida a `dist/`)
- `npm run dev` → demo de dominio en consola (`src/index.ts`)
- `npm start` → servidor web + API + frontend en `http://localhost:3000`

---

## 3. Arquitectura y regla de dependencia

**Clean Architecture + Screaming Architecture.**
La estructura grita el dominio: `catalog/`, `cart/`, `checkout/`, `customers/`,
`shared/`. Cada módulo tiene capas internas `domain|infrastructure`.

Regla inviolable: **`domain/` NUNCA importa de `infrastructure/` ni de frameworks.**
Las dependencias apuntan hacia adentro. La infraestructura implementa **puertos**
(interfaces) del dominio. El adapter web (`web/`) y los repositorios se inyectan
por composición en un root de composición.

Dependencias entre módulos (solo dominio, apuntando a abstracciones):
```
cart/domain -> catalog/domain   (usecases usan ProductRepository)
checkout/domain -> cart/domain , customers/domain , shared/domain
customers/domain -> shared/domain
catalog/domain -> shared/domain
web/* -> todos los usecases + repositorios + seed
```

---

## 4. Inventario completo de archivos

```
soap-ecommerce/
├── opencode.json                    # Config opencode: default_agent tech-leader + instructions
├── AGENTS.md                        # Auto-inicialización de sesiones/agentes
├── package.json / package-lock.json / tsconfig.json / .gitignore
├── README.md
├── docs/governance/
│   ├── context.md                   # ESTE documento
│   ├── rules.md                     # Reglas estrictas de desarrollo
│   └── agents/system-prompts.md     # Roles de los 4 agentes
├── .opencode/agent/                 # Agentes opencode (proyecto)
│   ├── tech-leader.md (primary)     frontend-dev.md · coding-agent.md · qa.md · devops.md
├── public/                          # FRONTEND (estático)
│   ├── index.html                   # Layout: header, filtros, catálogo grid, drawer carrito
│   └── app.js                       # Lógica frontend (fetch API, estados, carrito)
├── src/
│   ├── index.ts                     # Demo de dominio (consola)
│   ├── shared/domain/
│   │   ├── Money.ts                 # Value Object moneda
│   │   └── SkinType.ts              # Enums SkinType, ProductCategory
│   ├── catalog/
│   │   ├── domain/entities/Product.ts, ProductFilterCriteria.ts
│   │   ├── domain/repositories/ProductRepository.ts
│   │   ├── domain/usecases/ListProducts.ts, FilterProducts.ts
│   │   └── infrastructure/InMemoryProductRepository.ts
│   ├── cart/
│   │   ├── domain/entities/Cart.ts, CartItem.ts
│   │   ├── domain/repositories/CartRepository.ts
│   │   ├── domain/usecases/AddItemToCart.ts, GetCart.ts
│   │   └── infrastructure/InMemoryCartRepository.ts
│   ├── checkout/
│   │   ├── domain/entities/Order.ts, OrderItem.ts
│   │   ├── domain/ports/PaymentGateway.ts
│   │   ├── domain/repositories/OrderRepository.ts
│   │   ├── domain/usecases/ProcessCheckout.ts
│   │   └── infrastructure/InMemoryOrderRepository.ts, MockPaymentGateway.ts
│   ├── customers/
│   │   ├── domain/entities/Customer.ts
│   │   ├── domain/repositories/CustomerRepository.ts
│   │   └── infrastructure/InMemoryCustomerRepository.ts
│   ├── infrastructure/persistence/typeorm/    # SUGERENCIA ORM (no conectado aún)
│   │   ├── data-source.ts                     # DataSource PostgreSQL
│   │   ├── entities/ProductOrmEntity.ts       # Entidad de persistencia decorada
│   │   └── ProductTypeOrmRepository.ts        # Adaptador + mappers toDomain/toPersistence
│   └── web/
│       ├── server.ts              # Root de composición + rutas REST + serve estático
│       └── seed.ts                # 10 productos seed + imágenes SVG (data URI) + cliente demo
```

---

## 5. Modelo de datos / entidades de dominio

### 5.1 Product (catalog/domain/entities/Product.ts)
| Atributo | Tipo | Notas |
|---|---|---|
| id | string | |
| name | string | |
| description | string | |
| price | Money | moneda COP |
| category | ProductCategory | enum §6.2 |
| ingredients | string[] | lista completa |
| organicIngredients | string[] | **subconjunto** de `ingredients` (invariante) |
| recommendedSkinType | SkinType | enum §6.1 |
| handmade | boolean | indicador de producto hecho a mano |
| stock | number | entero; **invariante >= 0** |
| batch | string | lote de producción |
| active | boolean | si está en venta |
| createdAt | Date | inmutable |

Métodos de negocio: `hasStock(q): boolean`, `isAvailable(): boolean` (`active && stock>0`),
`decreaseStock(q)` (lanza si no hay stock), `getPrice/getStock/getName/getBatch/getDescription/
getCategory/getIngredients/getOrganicIngredients/getRecommendedSkinType/isActive/isHandmade`.

Invocaciones de `Product.create` lanzan `Error` si: `stock < 0` o
`organicIngredients.length > ingredients.length`.

### 5.2 CartItem (cart/domain/entities/CartItem.ts)
`productId`, `name`, `unitPrice: Money`, `quantity`, `batch`.
- `CartItem.fromProduct(product, quantity)` lanza si `quantity <= 0`.
- `increase(q)` suma; `getQuantity()`; `lineTotal() = unitPrice * quantity`.

### 5.3 Cart (cart/domain/entities/Cart.ts)
`id: string`, `customerId: string`, items privado.
- `Cart.create(id, customerId)`.
- `addItem(item)` mergea por `productId` (incrementa la cantidad).
- `getItems(): readonly CartItem[]`, `isEmpty()`, `total(): Money` (0 si vacío).

### 5.4 OrderItem (checkout/domain/entities/OrderItem.ts)
`productId`, `name`, `quantity`, `unitPrice: Money`; `lineTotal()`.

### 5.5 Order (checkout/domain/entities/Order.ts)
`id`, `customerId`, `items: OrderItem[]`, `total: Money`, `createdAt`, estado privado.
- Estados: **pending | paid | failed | cancelled** (enum `OrderStatus`).
- `Order.create(id, customerId, items)` lanza si `items.length === 0`; total = suma de líneas.
- Transiciones vía `markAsPaid(paymentId)`, `markAsFailed()`. Getters: `getStatus`, `getPaymentId`, `getTotal`.

### 5.6 Customer (customers/domain/entities/Customer.ts)
`id`, `fullName`, `email`, `shippingAddress`.
- `Customer.create` lanza si email no contiene `@` o dirección vacía.
- Getters: `getEmail`, `getFullName`, `getShippingAddress`.

### 5.7 Money (shared/domain/Money.ts) — Value Object
Monto + moneda ISO-3 (default **COP**). Invariantes: monto no negativo, moneda de 3 letras.
`Money.of(amount, currency?)` redondea a 2 decimales. `add`, `multiply`, `equals`.
`add` lanza si la moneda difiere. **Nunca usar `number` crudo para precios en el dominio.**

---

## 6. Enums

### 6.1 SkinType
`dry | oily | combination | sensitive | normal | all`

### 6.2 ProductCategory
`soap | shampoo_bar | body_butter | lotion | lip_balm | other`

---

## 7. Puertos (interfaces de infraestructura)

### 7.1 ProductRepository (catalog/domain/repositories)
```ts
findById(id: string): Promise<Product | null>
findAll(): Promise<Product[]>
save(product: Product): Promise<void>
search(criteria: ProductFilterCriteria): Promise<Product[]>
```
`ProductFilterCriteria` (entrada de búsqueda):
`{ category?, recommendedSkinType?, handmadeOnly?, organicOnly?, minPrice?, maxPrice?, searchTerm?, inStockOnly? }`
(todas opcionales; "organicOnly" = que tenga ingredientes orgánicos > 0; "inStockOnly" = disponible).

### 7.2 CartRepository
```ts
findById(id: string): Promise<Cart | null>
findByCustomerId(customerId: string): Promise<Cart | null>
save(cart: Cart): Promise<void>
```

### 7.3 OrderRepository
```ts
save(order: Order): Promise<void>
findById(id: string): Promise<Order | null>
```

### 7.4 CustomerRepository
```ts
findById(id: string): Promise<Customer | null>
save(customer: Customer): Promise<void>
```

### 7.5 PaymentGateway (checkout/domain/ports)
```ts
charge(request: PaymentRequest): Promise<PaymentResult>
PaymentRequest = { orderId: string; amount: Money; customerEmail: string; reference: string }
PaymentResult  = { success: boolean; transactionId: string; message: string }
```

---

## 8. Casos de uso (firmas y reglas de negocio)

| Caso de uso | Firma | Reglas que aplica |
|---|---|---|
| ListProducts | `execute(input?: { onlyAvailable?: boolean }): Promise<{ products, total }>` | lista Product del repo; filtra disponibles si `onlyAvailable` |
| FilterProducts | `execute(criteria: ProductFilterCriteria): Promise<{ products, total }>` | delega en `repo.search(criteria)` |
| AddItemToCart | `execute(input: { cartId, customerId, productId, quantity }): Promise<Cart>` | `quantity > 0`; producto existe; **valida stock** antes de agregar; crea carrito si no existe; mergea por producto |
| GetCart | `execute(cartId): Promise<GetCartResult \| null>` | vista serializable (items + total) |
| ProcessCheckout | `execute(input: { cartId, customerId }): Promise<{ orderId, status, total, transactionId? }>` | carrito existe y no vacío; cliente existe; construye Order; cobra vía `PaymentGateway`; éxito → `markAsPaid`, fallo → `markAsFailed`; guarda la orden siempre |

**Detalles de AddItemToCart:** mensajes de error existentes:
- `La cantidad a agregar debe ser mayor a cero.`
- `Producto no encontrado: {id}`
- `Stock insuficiente para "{name}". Disponible: {stock}, solicitado: {qty}.`

**Detalles de ProcessCheckout:** errores:
- `El carrito esta vacio o no existe.`
- `Cliente no encontrado: {id}`
- El `unitPrice` de cada OrderItem se deriva de `lineTotal / quantity` del carrito.
- ID de orden: `crypto.randomUUID()` o fallback `ord_{ts}_{rnd}`.

**GetCartResult shape:** `{ cartId, customerId, items: [{ productId, name, quantity, unitPrice: {amount,currency}, lineTotal: {amount,currency} }], total: {amount,currency}, isEmpty }`.

---

## 9. API HTTP (adapter web — `src/web/server.ts`)

Base: `http://localhost:3000`. Middleware: JSON body + estáticos de `public/`.
Cliente demo fijo: `c1` (`DEFAULT_CUSTOMER_ID`), provisto en seed.

| Método | Ruta | Entrada | Respuesta 200 (JSON) | Errores |
|---|---|---|---|---|
| GET | `/api/products` | query: `search`, `skin`(SkinType), `category`, `handmade=true`, `organic=true`, `available=true` | `{ total, products[] }` | 400 `{error}` |
| POST | `/api/cart/items` | `{ cartId, productId, quantity }` | vista del carrito (GetCartResult) | 400 `{error}` |
| GET | `/api/cart/:cartId` | — | GetCartResult | 404 `{ error }` |
| POST | `/api/checkout` | `{ cartId }` | `{ orderId, status, total: {amount,currency}, transactionId? }` | 400 `{error}` |

**Shape de producto en `/api/products`:** `{ id, name, description, price: {amount,currency},
category, ingredients[], organicIngredients[], recommendedSkinType, handmade, stock, batch,
available, image }` — `image` es un **SVG data URI** proveniente de `seed.PRODUCT_IMAGES`.
`available = active && stock > 0`. Los filtros se traducen a `ProductFilterCriteria`.

**Nota de evolución (pendiente):** el adapter no aplica aún validación de DTO en bordes
(no existe validador); se valida solo en el dominio. Roadmap: agregar validación de request.

---

## 10. Frontend (`public/`)

- **index.html:** Tailwind (Play CDN + `tailwind.config` con paleta `brand`), header sticky,
  barra de filtros (búsqueda, tipo de piel, handmade, orgánico, en stock), grid de tarjetas,
  drawer de carrito a la derecha (animado con `translate-x-full`), overlay.
- **app.js:** vanilla JS. `cartId` persistido en `localStorage` (clave `cartId`,
  formato `cart_*`). Estados de UI: loading/error/empty vía mensajes y botones deshabilitados.
  Formatos con `Intl.NumberFormat('es-CO')`. Llama a los 4 endpoints con `fetch`.
  Tras checkout exitoso resetea el carrito local y recarga.
- **Regla frontend (no negociable):** PROHIBIDO hardcodear datos; todo viene de la API.
  La `image` llega en el payload; si falta, fallback a emoji 🧼.
- Los 10 productos seed traen `image` (SVG generado en `web/seed.ts` con degradado + emoji + nombre).

---

## 11. Persistencia: estado actual y migración sugerida

**Actual (demo):** `InMemoryProductRepository`, `InMemoryCartRepository`,
`InMemoryOrderRepository`, `InMemoryCustomerRepository`. Volátiles: al reiniciar
`npm start`, los datos (incluido el carrito) se reinician.

**Target (sugerido, archivos ya preparados en `infrastructure/persistence/typeorm/`):**
- `ProductOrmEntity` (tabla `products`) con decoradores TypeORM; `priceAmount` DECIMAL(12,2) + `priceCurrency`.
- `ProductTypeOrmRepository` implementa `ProductRepository` con **mappers** `toDomain`/`toPersistence`.
- `data-source.ts`: DataSource PostgreSQL (variables `DB_HOST|DB_PORT|DB_USER|DB_PASSWORD|DB_NAME`, defaults locales).
- **Pendiente:** conectar `server.ts` (root de composición) al DataSource y aplicar el mismo
  patrón para `Cart`, `Order`, `Customer` (entidad + repo + mapper).

Reglas para la migración (resumen de `rules.md §4`): transacciones atómicas en checkout,
sin `SELECT *`, evitar N+1, mappers explícitos.

---

## 12. Pagos

- Puerto: `PaymentGateway` (§7.5). Única implementación: `MockPaymentGateway`
  (config `{ failWithProbability?, latencyMs? }`), devuelve `success` aleatorio y
  `transactionId: txn_{orderId}_{ts}`. Integración real (Stripe/otros) = nueva clase
  que implementa el mismo puerto; sin cambios en dominio.
- `ProcessCheckout` cobra con `reference = ORDER-{orderId}` y `customerEmail` del cliente.

---

## 13. Datos de catálogo seed (web/seed.ts) — 10 productos

| id | nombre | precio (COP) | categoría | piel recomendada | stock | lote |
|---|---|---|---|---|---|---|
| p1 | Jabon de Lavanda | 18000 | soap | sensitive | 12 | LOT-LAV-01 |
| p2 | Jabon de Carbon Activado | 22000 | soap | oily | 8 | LOT-CAR-01 |
| p3 | Jabon de Avena y Miel | 19500 | soap | dry | **0** (agotado) | LOT-AVE-01 |
| p4 | Balsamo de Cacao | 15500 | lip_balm | all | 20 | LOT-BAL-01 |
| p5 | Jabon de Calendula | 17500 | soap | sensitive | 15 | LOT-CAL-01 |
| p6 | Jabon de Menta | 18500 | soap | combination | 10 | LOT-MEN-01 |
| p7 | Jabon de Rosas | 21000 | soap | dry | 6 | LOT-ROS-01 |
| p8 | Manteca de Karite | 24500 | body_butter | all | 9 | LOT-KAR-01 |
| p9 | Shampoo Solido | 23000 | shampoo_bar | normal | 11 | LOT-SHA-01 |
| p10 | Jabon Exfoliante de Cafe | 20000 | soap | oily | 7 | LOT-CFE-01 |

Todos `handmade: true`, `active: true`, e imágenes SVG en `PRODUCT_IMAGES`.
`p3` demuestra el flujo "agotado" (badge y botón deshabilitado + filtro "En stock").

---

## 14. Reglas de negocio consolidadas (fuente de verdad para QA)

1. Moneda única (COP) en todo el dominio.
2. `stock` nunca negativo; no se puede agregar al carrito más de lo disponible.
3. Cantidades `quantity >= 1` en carrito y órdenes.
4. `organicIngredients` ⊆ `ingredients`.
5. Un carrito pertenece a un cliente (`customerId`).
6. Agregar el mismo producto al carrito incrementa cantidad (no duplica línea).
7. No se puede pagar un carrito vacío o inexistente.
8. No se genera checkout sin cliente registrado.
9. Una orden debe tener al menos un item; su total es la suma de líneas.
10. Estados de orden: pending -> paid | failed (cancelled reservado).
11. La orden se persiste AUNQUE el pago falle (estado `failed`).
12. El frontend no inventa datos: consume la API; `image` tiene fallback.

---

## 15. Verificación obligatoria (para todo cambio)

```
npm run typecheck   # exit 0 obligatorio
npm run build       # compila dist/
npm start           # levanta la tienda y API (http://localhost:3000)
npm run dev         # demo de dominio en consola
```
Reglas transversales: tipado estricto, sin `any`/`unknown` ambiguo, sin `@ts-ignore`,
`domain/` puro, cambios dentro del alcance asignado (ver `rules.md`).

---

## 16. Flujo operativo de los agentes (resumen para Tech Leader)

- **Tech Leader (orquestador):** planifica, define contratos, distribuye a
  `frontend-dev`, `coding-agent`, `qa`, `devops` y **aprueba/veta** en fase 4.
- Protocolo de 4 fases (ver `rules.md §5`): Planificación -> Modularidad atómica ->
  Ámbito estricto -> Validación/Confirmación (typecheck + QA + aprobación).
- Conventional Commits: `feat|fix|chore|docs|refactor|test|build|ci` (+scope).
- Cobertura de QA mínima por feature: happy-path + edge/error.

---

## 17. Decisiones registradas (ADR)

| # | Decisión | Estado |
|---|---|---|
| ADR-001 | Clean + Screaming Architecture; `domain/` aislado de framework/BD | vigente |
| ADR-002 | Money como Value Object (nunca `number` para precios) | vigente |
| ADR-003 | Persistencia in-memory para demo; TypeORM/PostgreSQL como target | en curso (migración) |
| ADR-004 | Pago vía puerto `PaymentGateway` + mock; integración real pendiente | vigente |
| ADR-005 | Gobernanza multi-agente: orquestación desde `tech-leader`; auto-init vía AGENTS.md | vigente |

---

## 18. Roadmap (backlog)

1. Conectar repositorios TypeORM/PostgreSQL (Product en marcha; migrar Cart/Order/Customer).
2. Validación de entrada en bordes HTTP (DTOs + validador) en `web/server.ts`.
3. Transacciones atómicas reales en checkout (persistencia).
4. Migrar Tailwind CDN -> build pipeline (PostCSS/JIT) para producción.
5. CI/CD (lint, typecheck, build, test) + Husky/pre-commit (Conventional Commits).
6. Suites de prueba (unitarias de casos de uso + e2e del flujo carrito->checkout).
7. Autenticación real de clientes (hoy cliente fijo `c1`).
8. Integración de pasarela de pago real (reemplazo de `MockPaymentGateway`).