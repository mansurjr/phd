import { memo } from 'react';
import AppRouter from "./pages"
import { Toaster } from 'sonner';

const App = () => {
  return (
    <>
      <AppRouter/>
      <Toaster position="top-center" richColors />
    </>
  );
};

export default memo(App);