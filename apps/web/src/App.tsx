import { Providers } from './app/providers';
import { AppRouter } from './app/router';
import { Toaster } from '@mymoney/ui';
import { GlobalErrorModal } from './shared/components/GlobalErrorModal';

export function App() {
  return (
    <Providers>
      <AppRouter />
      <Toaster />
      <GlobalErrorModal />
    </Providers>
  );
}

export default App;
