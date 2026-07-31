import { Providers } from './app/providers';
import { AppRouter } from './app/router';
import { Toaster } from '@mymoney/ui';

export function App() {
  return (
    <Providers>
      <AppRouter />
      <Toaster />
    </Providers>
  );
}

export default App;
