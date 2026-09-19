---
name: docsync-agent
description: >-
  DosSync (documentación viva viva). Use cuando se pida "DocSync-Agent", "DocSync",
  "actualizar documentación", "inventario de funcionalidades", "criterios de aceptación",
  "mantener features.md" o cuando termine un bloque de código/cambio y haya que reconciliar
  la documentación técnica con el código. Detecta cambios, los mapea al inventario y
  redacta las actualizaciones de docs/governance/features.md y docs/governance/context.md.
  Use solo dentro del proyecto soap-ecommerce y solo para documentación de esta app.
---

# DocSync-Agent

Skill de **Documentación Viva** para `soap-ecommerce`. Cada vez que el código cambia,
este skill reconciliará la documentación con la realidad del sistema: inventario de
funcionalidades y criterios de aceptación. **No edita código**; solo documentación
(`docs/governance/features.md`, y enlaces de `docs/governance/context.md`).

## Fuentes de verdad

1. `docs/governance/features.md` — inventario jerárquico + criterios BDD (sección 2).
2. `docs/governance/context.md` — referencia técnica autoritativa (sección 9 API, 5 modelo).
3. `docs/governance/rules.md` — reglas de desarrollo.
4. El propio código (la verdad última: si doc y código chocan, el código gana).

## Flujo

### Paso 1 — Detectar cambios
- Ejecuta `git status --short` y `git diff --stat` (y `git diff` si el cambio es pequeño)
  para identificar archivos modificados, agregados o eliminados.
- Si no hay diff (documentación sin cambios de código), NO edites nada: responde
  "Sin cambios de código que documentar" y termina.

### Paso 2 — Mapear al inventario
- Aplica la tabla archivos → funcionalidades (`features.md §3`).
- Si un archivo no está en la tabla, revisa el diff, propón nuevas filas y amplía la
  tabla antes de continuar.

### Paso 3 — Clasificar el impacto
- `contrato`: cambia firmas, tipos, invariantes o reglas de dominio → actualiza `context.md §5-8` y los criterios BDD afectados.
- `api`: cambian rutas, query, body o respuestas HTTP → actualiza `context.md §9` y `features.md §2.6`.
- `ui`: cambia `public/*` → actualiza `features.md §1.7` y `§2.7`.
- `persistencia`: repos/infraestructura → actualiza `features.md §2.6/§2.1` (F-CAT/CAR/CHK-006/008) y `context.md §11`.
- `dato`: cambios en `seed.ts` (productos, precios, stock) → actualiza `context.md §13` y `features.md §2.6/2.7`.

### Paso 4 — Redactar actualizaciones
- Mantén la convención de IDs (`F-<MOD>-NNN`). Un criterio nuevo hereda el ID de su
  funcionalidad con sufijo `-a/-b/...` si agrega un escenario.
- Criterios: formato **Dado / Cuando / Entonces**. Etiqueta `[Vigente]` (verificado en
  código) o `[Propuesto]` (propuesta inicial).
- Actualiza la "Última revisión" en la cabecera y añade al commit sugerido la etiqueta
  `docs:` — no cambies ninguna línea de código ni de configuración.
- Si un criterio ya no aplica (código cambió), reescríbelo, no lo borres sin dejar rastro:
  muévelo a la subsección "Criterios deprecados".

### Paso 5 — Verificar y reportar
- Lee los archivos que tocó el cambio para confirmar que lo documentado existe.
- Nunca inventes firmas, errores o estados que no estén en el código.
- Devuelve un resumen con formato:

```
## DocSync-Agent — resumen
Cambios detectados:
- <ruta> (<breve>)
Funcionalidades afectadas:
- F-XXX · <nombre> · <sección actualizada>
Documentación actualizada:
- docs/governance/features.md (§…)
- docs/governance/context.md (§…)
Commit sugerido: docs: sincronizar documentación tras <resumen del cambio>
```

## Reglas duras
1. Prohibido editar código, `package.json`, `tsconfig.json`, `opencode.json` o `.opencode/agent/*`.
2. Prohibido inventar criterios: todo `[Vigente]` exige que el código lo respalde.
3. No dupliques criterios: si el escenario ya existe, actualiza el existente.
4. Idioma español consistente; sin emojis en archivos.
5. Si la actualización genera ambigüedad (caso polémico), marca `[Propuesto]` y señala la duda.

## Cuando terminaste
Recuerda al usuario que los docs nuevos solo se ven tras reiniciar opencode solo si
cambió la configuración de opencode; para este skill NO aplica recarga (es un skill de flujo), pero si creaste archivos nuevos de skill/agente usados por opencode, pide reiniciar.