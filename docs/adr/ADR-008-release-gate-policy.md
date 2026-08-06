# ADR-008: Release Gate Policy

## Context
Tras estabilizar la arquitectura del proyecto y definir los *Module Boundaries*, las reglas de UI, FSD y el manejo asíncrono, se hace imperativo proteger la base del código para evitar que su calidad y coherencia se degraden con el tiempo. El crecimiento del equipo o la velocidad de entrega pueden introducir dependencias circulares, regresiones de tipos, o violaciones de estructura sin intencionalidad.

## Decision
Instituir un **Release Gate Estricto** como política de aceptación para cualquier nuevo código introducido al proyecto. Ningún cambio (Feature, Fix, Refactor) podrá ser integrado (Merge) si no cumple con la totalidad del Release Gate.

## Rules
El Release Gate exige **0 tolerancia** a errores en las siguientes áreas:

1. **TypeScript (`tsc --noEmit`)**:
   - Debe pasar con 0 errores.
   - Prohibido el uso de `// @ts-ignore` o `as any` como atajos. Las incompatibilidades deben arreglarse en la fuente (modelos DTO, interfaces o validaciones en *run-time*).
2. **Build (`pnpm build`)**:
   - La compilación del entorno de producción debe ser exitosa.
3. **Tests (`pnpm test`)**:
   - Toda la suite de pruebas unitarias/integración (Vitest) debe pasar.
4. **Storybook (`pnpm build-storybook`)**:
   - La compilación de los componentes documentados en UI debe ser exitosa, protegiendo el ecosistema visual.
5. **Dependencias Circulares (`madge --circular`)**:
   - Absoluta ausencia de dependencias circulares.
6. **Integridad FSD (Module Boundaries)**:
   - Respeto estricto a las direcciones permitidas (`app -> pages -> widgets -> features -> entities -> shared`).
   - Prohibición total del uso directo de Axios (fuera de `shared`).
   - Interacción entre módulos exclusivamente mediante `index.ts`. No se permiten imports profundos (`../../../`).
7. **Design System**:
   - Ningún Pull Request podrá alterar los componentes base ubicados en `packages/ui` o la configuración fundamental (como el sistema de invalidaciones centralizadas) a menos que posea un nuevo **Architecture Decision Record (ADR)** previamente aprobado.

## Enforcement
- El **CI Pipeline** (GitHub Actions, GitLab CI, etc.) estará configurado para correr estos comandos de manera obligatoria.
- Un fallo en cualquiera de las fases del Pipeline bloqueará el merge automático del PR, dejándolo en estado *Pending/Failed* hasta su resolución por parte del desarrollador responsable.
