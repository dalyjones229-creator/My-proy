# Reglas de Desarrollo — soap-ecommerce

Reglas intransigentes que rigen a todos los colaboradores y agentes. Cualquier
violación bloquea el merge. Estas reglas se aplican en conjunto con `context.md`
y los roles definidos en `docs/governance/agents/system-prompts.md`.

---

## 1. Clean Code & Arquitectura

- **Screaming Architecture:** la estructura refleja el dominio (`catalog`, `cart`,
  `checkout`, `customers`, `shared`). PROHIBIDO organizar por capas técnicas
  genéricas en la raíz.
- **Regla de dependencia:** `domain/` NUNCA importa de `infrastructure/` ni de
  frameworks. Las dependencias apuntan hacia adentro.
- **SOLID:** una única responsabilidad por clase/caso de uso; interfaces segregadas;
  depender de abstracciones (puertos), no de concretos.
- **DRY / KISS:** prohibida la duplicación y la complejidad innecesaria. Extraer
  lógica repetida a funciones/componentes reutilizables.
- **Early Returns:** salir antes cuando sea posible; evitar `else` anidados profundos.
- **Prohibición absoluta** de código muerto, variables/imports sin uso, y lógica
  comentada. (tsconfig activa `noUnusedLocals`, `noUnusedParameters`.)

## 2. Tipado & Lenguaje

- **Tipado estricto** en entradas y retornos de todas las funciones/casos de uso.
- **PROHIBIDO** `any` y `unknown` ambiguos. Si se requiere `unknown`, estrechar con
  guards de tipo antes de usar.
- **PROHIBIDO** `@ts-ignore`, `@ts-nocheck` y casts no validados (`as` sin guardia).
- **Interfaces obligatorias** para contratos de entrada/salida (DTOs, records,
  ports, props de entidades). No exponer tipos primitivos sueltos cuando un contrato los agrupa.
- Sobrecargar contexto con `exactOptionalPropertyTypes: true` (activado): no asignar
  `undefined` a propiedades opcionales de forma explícita sin serlo.

## 3. Seguridad & Datos

- **Validación y sanitización en bordes** de entrada/salida: DTOs de request con
  validadores estrictos en el adapter HTTP (`web/server.ts`) antes de llamar casos de uso.
- **Prohibición de logs con datos sensibles:** nunca registrar passwords, tokens,
  tarjetas, emails de clientes en logs. Solo datos de diagnóstico no sensibles.
- **Manejo centralizado de excepciones tipadas:** errores del dominio con tipos
  propios; el adapter traduce a respuestas HTTP coherentes (400/404/409/500).
- Validar identidad/cantidad/stock en el dominio (invariantes), nunca solo en la UI.

## 4. Bases de Datos & Persistencia

- **Normalización** de entidades; evitar columnas derivadas innecesarias.
- **Transacciones atómicas obligatorias** en mutaciones compuestas (ej. checkout:
  crear orden + actualizar stock + cobrar deben ser atómicos).
- **PROHIBIDO** queries ciegas (`SELECT *`); seleccionar columnas explícitas.
- **Mitigación preventiva de N+1:** usar `JOIN`/`relations`/`IN` según ORM; revisar
  los accesos a colecciones en loops.
- La capa de persistencia traduce a entidades de dominio mediante **mappers**
  (`toDomain`/`toPersistence`); el dominio queda desacoplado del ORM.

## 5. Flujo de Trabajo Operativo — Protocolo de 4 fases

Toda tarea/feature sigue este protocolo. Un agente no puede saltarse fases.

1. **Planificación (Planificación):** entender el requisito, definir ámbito, contrato
   y criterios de aceptación. Registrar decisión si altera arquitectura.
2. **Modularidad atómica:** dividir en cambios pequeños e independientes; un commit
   resuelve un solo problema.
3. **Ámbito estricto:** no tocar código fuera del alcance acordado; no "scope creep".
   Los cambios fuera de alcance se rechazan en revisión.
4. **Validación/Confirmación:** ejecutar `typecheck`, build y tests; QA dictamina
   criterios de aceptación; Tech Leader aprueba antes del merge. Sin aprobación no
   hay merge a la rama principal.

### Convenciones de commit (Conventional Commits)
Formato: `tipo(scope): descripción`. Tipos: `feat | fix | chore | docs | refactor |
test | build | ci`. Ejemplo: `feat(cart): validar stock en AddItemToCart`.

### Verificación obligatoria previa a merge
```
npm run typecheck   # debe pasar sin errores
npm run build       # debe compilar dist/
npm test            # cuando existan suites
```
Cualquier fallo = PR devuelto. Cero excepciones de proceso.
