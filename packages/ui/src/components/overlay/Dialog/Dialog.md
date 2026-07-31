# Dialog y Modal

Este ecosistema separa la responsabilidad entre el **comportamiento** (`Dialog`) y la **presentación** (`Modal`, `Drawer`, etc.).

## Dialog (Comportamiento)
Provee estado (`open`), contexto (IDs para ARIA) y atajos de teclado (`Escape`). NO renderiza interfaz visible de forma directa (a menos que se use un `<Dialog.Trigger>`).

### Subcomponentes
- `<Dialog.Root>`: Provee el contexto `DialogContext`. Puede ser controlado (`open`, `onOpenChange`) o no controlado (`defaultOpen`).
- `<Dialog.Trigger>`: El botón o elemento que abre el modal. Usa `asChild` para polimorfismo.
- `<Dialog.Portal>`: Usa `createPortal` para renderizar su contenido directamente en `document.body` y escapar del apilamiento de `z-index`.
- `<Dialog.Close>`: El botón que cierra el dialog.
- `<Dialog.Title>` y `<Dialog.Description>`: Componentes que se enlazan automáticamente mediante `aria-labelledby` y `aria-describedby` a la implementación visual.

## Modal (Presentación)
Es la implementación visual concreta. Representa la clásica ventana en el medio de la pantalla con un fondo oscuro (backdrop).

- `<Modal>`: Contenedor visual. Escucha clics en el backdrop para cerrar.
- `<ModalHeader>`: Contenedor para el título y descripción.
- `<ModalFooter>`: Contenedor inferior para acciones.

## Ejemplo de Composición

```tsx
<Dialog.Root>
  <Dialog.Trigger asChild>
    <Button>Abrir Modal</Button>
  </Dialog.Trigger>
  
  <Dialog.Portal>
    <Modal>
      <ModalHeader>
        <Dialog.Title>Título</Dialog.Title>
        <Dialog.Description>Descripción</Dialog.Description>
      </ModalHeader>
      <div>Cuerpo del modal</div>
      <ModalFooter>
        <Dialog.Close asChild><Button>Cancelar</Button></Dialog.Close>
        <Button>Confirmar</Button>
      </ModalFooter>
    </Modal>
  </Dialog.Portal>
</Dialog.Root>
```
