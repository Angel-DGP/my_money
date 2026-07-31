# Table

El componente `Table` provee una representación puramente visual de una tabla de datos. Sigue la regla arquitectónica de no incluir lógica interna compleja.

## Filósofia
El Design System provee únicamente **Layout Primitives**. La tabla no incluye:
- Sorting (Ordenamiento)
- Pagination (Paginación)
- Filtering (Filtros)
- Fetching (Llamadas a red)

Cualquier comportamiento inteligente debe implementarse en la capa de **Features** de la aplicación, utilizando este componente primitivo como su motor de renderizado.

## Composición

El componente envuelve de forma estilizada los elementos nativos de una tabla HTML:
- `<Table>` (`<table>`)
- `<TableHeader>` (`<thead>`)
- `<TableBody>` (`<tbody>`)
- `<TableFooter>` (`<tfoot>`)
- `<TableRow>` (`<tr>`)
- `<TableHead>` (`<th>`)
- `<TableCell>` (`<td>`)
- `<TableCaption>` (`<caption>`)

## Props Especiales

### `align` en `TableHead` y `TableCell`
Puedes alinear fácilmente el texto de las celdas (especialmente útil para columnas de montos o números) usando la prop `align`.

```tsx
<TableHead align="right">Amount</TableHead>
<TableCell align="right">$1,250.00</TableCell>
```
Valores soportados: `'left' | 'center' | 'right'`.
