'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import JoyrideProvider from '@/components/tutorial/joyride-provider';

const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <JoyrideProvider>{children}</JoyrideProvider>
    </QueryClientProvider>
  );
};

export default Providers;
