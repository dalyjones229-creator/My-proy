# Soap E-commerce (Clean / Screaming Architecture)

Plataforma de comercio electrónico para jabones artesanales y cosmética natural.
El código base aplica **Screaming Architecture** (la carpeta grita el dominio) y
**Arquitectura Limpia** (la lógica de negocio no depende de frameworks ni BD).

## Estructura de carpetas

```
src/
├── shared/                      # Kernel compartido (value objects sin dependencias de dominio)
│   └── domain/
│       ├── Money.ts             # Value object Moneda (invariante: >= 0, misma moneda)
│       └── SkinType.ts          # Enums de dominio (SkinType, ProductCategory)
│
├── catalog/                     # Módulo Catálogo
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── Product.ts                # Entidad Producto (cosmética natural)
│   │   │   └── ProductFilterCriteria.ts  # Criterios de búsqueda/filtro
│   │   ├── repositories/
│   │   │   └── ProductRepository.ts       # PUERTO (interfaz) de persistencia
│   │   └── usecases/
│   │       ├── ListProducts.ts            # Caso de uso: listar
│   │       └── FilterProducts.ts           # Caso de uso: filtrar
│   └── infrastructure/
│       └── InMemoryProductRepository.ts    # Adaptador en memoria (demo)
│
├── cart/                        # Módulo Carrito
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── Cart.ts                    # Entidad Carrito (agregado)
│   │   │   └── CartItem.ts                # Value object ítem de carrito
│   │   ├── repositories/CartRepository.ts
│   │   └── usecases/AddItemToCart.ts       # Caso de uso: agregar validando STOCK
│   └── infrastructure/InMemoryCartRepository.ts
│
├── checkout/                    # Módulo Checkout
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── Order.ts                   # Entidad Orden (estados)
│   │   │   └── OrderItem.ts
│   │   ├── ports/PaymentGateway.ts        # PUERTO de pasarela de pago
│   │   ├── repositories/OrderRepository.ts
│   │   └── usecases/ProcessCheckout.ts     # Orquesta carrito -> orden -> pago
│   └── infrastructure/
│       ├── InMemoryOrderRepository.ts
│       └── MockPaymentGateway.ts          # Adaptador SIMULADO de pasarela
│
├── customers/                   # Módulo Clientes
│   ├── domain/entities/Customer.ts
│   ├── domain/repositories/CustomerRepository.ts
│   └── infrastructure/InMemoryCustomerRepository.ts
│
├── infrastructure/
│   └── persistence/typeorm/     # SUGERENCIA ORM relacional (TypeORM)
│       ├── data-source.ts                 # DataSource (PostgreSQL)
│       ├── entities/ProductOrmEntity.ts    # Entidad de persistencia (decorada)
│       └── ProductTypeOrmRepository.ts     # Adaptador repositorio + MAPPER
│
└── index.ts                     # Composición de dependencias (demo ejecutable)
```

### Reglas de la arquitectura
- `domain/` nunca importa de `infrastructure/`. Las dependencias apuntan hacia
  adentro (la regla de dependencia de Clean Architecture).
- Las entidades son clases puras de TypeScript (sin anotaciones de BD).
- La persistencia y los frameworks entran por **puertos** (`repositories/*`,
  `ports/PaymentGateway`) implementados en `infrastructure/`.
- Tipado estricto en todo el proyecto (`strict`, `exactOptionalPropertyTypes`).

## Casos de uso clave implementados
- `ListProducts` / `FilterProducts` (catálogo, con criterios de piel, orgánico, stock…).
- `AddItemToCart` valida existencia del producto y **stock disponible** antes de agregar.
- `ProcessCheckout` construye la `Order`, cobra vía `PaymentGateway` (adaptador
  simulado `MockPaymentGateway`) y persiste el resultado.

## Repositorios con ORM relacional (TypeORM) — sugerencia
`src/infrastructure/persistence/typeorm/` muestra el patrón:
1. `ProductOrmEntity` modela la tabla `products` con decoradores `@Entity`/`@Column`.
2. `ProductTypeOrmRepository` implementa el puerto `ProductRepository` del dominio.
3. Un **mapper** (`toDomain` / `toPersistence`) traduce entre la entidad de dominio
   pura y la entidad de persistencia, manteniendo el dominio desacoplado del ORM.

Para producción se inyectaría `ProductTypeOrmRepository` en lugar de la versión en
memoria (ver `src/index.ts`). Patrones equivalentes aplican a `Cart`, `Order` y
`Customer` (mismos pasos: entidad ORM + repositorio + mapper).

### Ejemplo de uso con el repositorio TypeORM
```ts
import { AppDataSource } from "./infrastructure/persistence/typeorm/data-source";
import { ProductTypeOrmRepository } from "./infrastructure/persistence/typeorm/ProductTypeOrmRepository";

await AppDataSource.initialize();
const repo = new ProductTypeOrmRepository(
  AppDataSource.getRepository(ProductOrmEntity),
);
const list = new ListProducts(repo);
```

## Scripts
- `npm run typecheck` — valida tipos estrictos.
- `npm run dev` — ejecuta el escenario demo (`src/index.ts`).
