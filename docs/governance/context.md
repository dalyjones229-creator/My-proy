# Contexto Técnico del Proyecto — soap-ecommerce

Documento central que registra el estado, la visión técnica y los contratos del
proyecto. Se actualiza en cada hito. Todas las decisiones de diseño se reflejan aquí.

---

## 1. Visión general del producto y stack

**Producto:** Plataforma de comercio electrónico de jabones artesanales y cosmética
natural. Flujo: catálogo -> carrito -> checkout con pasarela de pago (simulada).

**Stack tecnológico base:**

| Capa | Tecnología | Versión / Notas |
|---|---|---|
| Lenguaje | TypeScript (estricto) | ^5.4.0 (tsconfig: `strict`, `exactOptionalPropertyTypes`) |
| Runtime/ejecución | Node.js + ts-node | scripts `dev` / `start` |
| Backend (HTTP) | Express | ^4.19.2 — adaptador de entrega |
| Frontend | HTML/CSS/JS vanilla + Tailwind (Play CDN) | estático en `public/` |
| ORM relacional (target) | TypeORM | ^0.3.20 (PostgreSQL) — sugerido en `infrastructure/persistence/typeorm` |
| Persistencia actual | En memoria (`InMemory*Repository`) | reemplazar por ORM en producción |
| Pasarela de pago | `PaymentGateway` (port) + `MockPaymentGateway` | simulación |

**Scripts (`package.json`):**
- `npm run typecheck` -> `tsc --noEmit`
- `npm run build` -> `tsc --project tsconfig.json`
- `npm run dev` -> demo de dominio (consola)
- `npm start` -> servidor web en `http://localhost:3000`

---

## 2. Mapa de dominios / módulos y arquitectura

**Arquitectura:** Clean Architecture + Screaming Architecture. La lógica de dominio
no depende de frameworks ni de la BD. Regla de dependencia: `domain/` no importa de
`infrastructure/`; los detalles entran por puertos (interfaces).

```
src/
├── shared/                     # Kernel compartido: Money, SkinType, ProductCategory
├── catalog/                    # Dominio Catálogo
│   ├── domain/entities|repositories|usecases
│   └── infrastructure/         # InMemoryProductRepository
├── cart/                       # Dominio Carrito
│   ├── domain/entities|repositories|usecases
│   └── infrastructure/
├── checkout/                   # Dominio Checkout
│   ├── domain/entities|ports|repositories|usecases
│   └── infrastructure/
├── customers/                  # Dominio Clientes
├── infrastructure/persistence/typeorm/   # Sugerencia ORM (mapa + repo + entidad)
├── web/                        # Adapter HTTP (Express) + seed
├── index.ts                    # Demo de dominio
public/                         # Frontend estático (index.html, app.js)
```

**Casos de uso principales:**
- `catalog/ListProducts`, `catalog/FilterProducts`
- `cart/AddItemToCart` (valida stock), `cart/GetCart`
- `checkout/ProcessCheckout` (carrito -> orden -> pago)
- Se usan en `web/server.ts` y en el demo `index.ts`.

---

## 3. Modelado de datos y contratos clave

### Entidades de dominio
- **Product** (`catalog/domain/entities/Product`): `id, name, description, price(Money),
  category, ingredients[], organicIngredients[], recommendedSkinType, handmade,
  stock, batch, active, createdAt`. Invariantes: `stock >= 0`, `organicIngredients`
  es subconjunto de `ingredients`. Métodos: `hasStock`, `isAvailable`, `decreaseStock`.
- **Cart** / **CartItem** (`cart/domain/entities`): carrito por cliente; lineTotal = unitPrice * quantity.
- **Order** / **OrderItem** (`checkout/domain/entities`): `status` en `pending|paid|failed|cancelled`.
- **Customer** (`customers/domain/entities`): `id, fullName, email, shippingAddress`.

### Value Objects / Enums
- **Money** (`shared/domain/Money`): `amount + currency(ISO-3)`. Invariante: no negativo, misma moneda al operar. Moneda base actual: **COP**.
- **SkinType**: `dry|oily|combination|sensitive|normal|all`.
- **ProductCategory**: `soap|shampoo_bar|body_butter|lotion|lip_balm|other`.

### Puertos (interfaces de infraestructura)
- `ProductRepository`, `CartRepository`, `OrderRepository`, `CustomerRepository`.
- `PaymentGateway` (`checkout/domain/ports`): `charge(PaymentRequest): Promise<PaymentResult>`.
  `PaymentRequest = { orderId, amount, customerEmail, reference }`. `PaymentResult = { success, transactionId, message }`.

### Contratos HTTP (expuestos en `web/server.ts`, base `http://localhost:3000`)
| Método | Ruta | Body/Query | Respuesta |
|---|---|---|---|
| GET | `/api/products` | query: `search`, `skin`, `handmade`, `organic`, `available`, `category` | `{ total, products[] }` |
| POST | `/api/cart/items` | `{ cartId, productId, quantity }` | vista del carrito |
| GET | `/api/cart/:cartId` | — | `{ cartId, customerId, items[], total }` |
| POST | `/api/checkout` | `{ cartId }` | `{ orderId, status, total, transactionId }` |

Reglas de negocio transversales: cantidad>0, validar stock antes de agregar,
carrito vacío no puede pagar, cliente debe existir para checkout.

---

## 4. Dependencias críticas y servicios de terceros

- **express** (HTTP), **typeorm + reflect-metadata** (persistencia target), types node/typescript.
- **Tailwind CSS (Play CDN)** — requiere internet en el navegador; para producción
  migrar a cadena de build (PostCSS) para purgar clases.
- **Pasarela de pago**: solo `MockPaymentGateway`. Integración real pendiente
  (port ya definido).
- No hay secretos en el repo; `.gitignore` excluye `.env`, `node_modules`, `dist`.

---

## 5. Estado actual del desarrollo y mapa de rutas

### Estado actual (funcionando)
- [x] Módulo catálogo con entidad Product y filtros.
- [x] Módulo carrito con validación de stock.
- [x] Módulo checkout con orden y pasarela simulada.
- [x] Módulo clientes.
- [x] API REST + frontend estático (10 productos seed con imágenes SVG embebidas).
- [ ] Persistencia real (PostgreSQL + TypeORM) — solo sugerida por ahora.
- [ ] Autenticación de clientes.

### Rutas / backlog técnico
1. Migrar repositorios en memoria -> TypeORM/PostgreSQL (`Map` -> tablas `products`,
   `carts`, `cart_items`, `orders`, `order_items`, `customers`), con transacciones.
2. Agregar validación de entrada en bordes HTTP (DTO + validador) en `web/server.ts`.
3. Migrar Tailwind CDN -> build pipeline para producción.
4. Pipelines CI/CD (linux: typecheck/buil/test) + pre-commit hooks (Husky).
5. Manejo centralizado de excepciones tipadas (error handling por dominio).
6. Pruebas unitarias de casos de uso y e2e del flujo carrito->checkout.
