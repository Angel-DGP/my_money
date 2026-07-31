import * as React from 'react';

/**
 * Establece un valor en una ref (tanto ref callback como ref object).
 */
export function setRef<T>(ref: React.Ref<T> | undefined, value: T) {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref !== null && ref !== undefined) {
    (ref as React.MutableRefObject<T>).current = value;
  }
}

/**
 * Combina múltiples refs en una sola. Útil cuando necesitas pasar una ref interna
 * y a la vez aceptar una ref desde las props (ej: forwardRef).
 */
export function composeRefs<T>(...refs: (React.Ref<T> | undefined)[]): React.RefCallback<T> {
  return (node: T) => {
    refs.forEach((ref) => setRef(ref, node));
  };
}
