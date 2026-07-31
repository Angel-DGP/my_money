/**
 * Genera atributos de datos comunes utilizados en el Design System para 
 * accesibilidad, estilos basados en estado, y selectores de testing.
 */

export function createDataState(state: 'open' | 'closed' | 'active' | 'inactive' | 'loading' | 'disabled') {
  return { 'data-state': state };
}

export function createDataOrientation(orientation: 'horizontal' | 'vertical') {
  return { 'data-orientation': orientation };
}

export function createDataSide(side: 'top' | 'right' | 'bottom' | 'left') {
  return { 'data-side': side };
}

export function createDataAlign(align: 'start' | 'center' | 'end') {
  return { 'data-align': align };
}
