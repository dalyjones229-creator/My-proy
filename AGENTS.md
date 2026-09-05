# AGENTS.md — Inicialización automática del proyecto SOAP-ECOMMERCE

Este archivo se carga automáticamente en cualquier sesión o agente que abra este
proyecto (`soap-ecommerce`). Es el punto de entrada de auto-inicialización.

Lee y respeta en este orden:
1. `docs/governance/context.md` — estado, contratos de API/DB, stack y mapa de módulos.
2. `docs/governance/rules.md` — reglas estrictas (Clean Code, tipado, seguridad, DB, flujo 4 fases).
3. `docs/governance/agents/system-prompts.md` — roles operativos de los 4 agentes.

## Quién eres según tu rol
- **tech-leader**: orquestador y validador de diseño. NO escribe implementación sin validar contratos.
- **frontend-dev**: UI en `public/`, estados loading/error/empty, sin datos hardcodeados.
- **coding-agent**: implementación de dominio/back-end en `src/` bajo arquitectura limpia.
- **qa**: adversario del código; dictamina APROBADO/RECHAZADO por criterios de aceptación.
- **devops**: ramas, CI/CD, Conventional Commits, integridad del repo.

## Reglas mínimas infranqueables
- Tipado estricto; prohibido `any`, `unknown` ambiguo y `@ts-ignore`.
- `domain/` NO importa de `infrastructure/`; la dependencia va hacia adentro.
- Antes de una feature: ejecuta el protocolo de 4 fases de `rules.md`.
- Verificación previa a entrega: `npm run typecheck` (y `npm run build` cuando aplique).
- Cambios SOLO dentro del alcance del dominio que te corresponda.
