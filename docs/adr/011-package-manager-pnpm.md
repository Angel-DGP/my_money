# ADR-011: Package Manager Oficial — pnpm

**Fecha**: 2026-07-28
**Estado**: Aceptado
**Contexto**: Arquitectura del proyecto basada en Monorepo (Turborepo)

## Contexto

El documento de arquitectura (`01-architecture.md`) establece el uso de un Monorepo manejado con Turborepo, separando la lógica en `apps/` y `packages/`. Sin embargo, no se ha estandarizado formalmente cuál será el gestor de paquetes de Node.js a utilizar.
En un entorno de monorepo, la gestión de dependencias compartidas y la velocidad de instalación son críticas. Gestores tradicionales como `npm` o `yarn` pueden ser más lentos o tener estrategias de "hoisting" que generan problemas (phantom dependencies).

## Decisión

Se establece **`pnpm`** como el Package Manager oficial y único del proyecto.
A partir de este momento:

- Todo el monorepo utilizará **pnpm workspaces** (`pnpm-workspace.yaml`).
- La documentación, ejemplos y comandos oficiales usarán `pnpm` (ej. `pnpm dev`, `pnpm build`).
- El proyecto **no soportará** `npm`, `yarn` ni `bun` como gestores de paquetes para la instalación y dependencias.
- Se añadirá `pnpm-lock.yaml` como el lockfile único del repositorio, y cualquier `package-lock.json` o `yarn.lock` generado por error será rechazado o eliminado.
- Los pipelines de CI/CD y la documentación de instalación ejecutarán exclusivamente comandos basados en `pnpm`.

## Consecuencias

### Positivas
- **Velocidad y espacio en disco**: `pnpm` utiliza un almacén global (content-addressable store) y symlinks, lo que significa instalaciones casi instantáneas y ahorro de gigabytes en la máquina local.
- **Strictness (Dependencias reales)**: `pnpm` no hace un hoisting plano por defecto (como npm o yarn classic), evitando las "phantom dependencies" (poder requerir un paquete que no está en tu `package.json` explícitamente pero que otra dependencia instaló).
- **Integración con Turborepo**: Turborepo soporta `pnpm workspaces` nativamente y de forma excelente, aprovechando la estructura de dependencias.

### Negativas
- Curva de aprendizaje mínima para nuevos desarrolladores que solo hayan usado `npm`.
- Herramientas o scripts muy antiguos que asumen rígidamente la existencia de una estructura plana en `node_modules` podrían requerir configuración adicional (`shamefully-hoist=true`), aunque esto se evitará a menos que sea estrictamente necesario.
