import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

type AnyProps = Record<string, any>;

/**
 * Combina props de React de forma inteligente:
 * - Concatena event handlers (ej. onClick, onChange).
 * - Une clases usando tailwind-merge y clsx.
 * - Prioriza el segundo objeto para otras props.
 */
export function mergeProps<T extends AnyProps, U extends AnyProps>(a: T, b: U): T & U {
  const result = { ...a } as any;

  for (const key in b) {
    if (Object.prototype.hasOwnProperty.call(b, key)) {
      const aValue = a[key];
      const bValue = b[key];

      if (
        typeof aValue === 'function' &&
        typeof bValue === 'function' &&
        key.startsWith('on') &&
        key.charCodeAt(2) >= 65 &&
        key.charCodeAt(2) <= 90 // Empieza con on[Mayúscula] (event handler)
      ) {
        result[key] = (...args: any[]) => {
          aValue(...args);
          bValue(...args);
        };
      } else if (key === 'className' && typeof aValue === 'string' && typeof bValue === 'string') {
        result[key] = twMerge(clsx(aValue, bValue));
      } else {
        result[key] = bValue;
      }
    }
  }

  return result;
}
