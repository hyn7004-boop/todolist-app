import './i18n';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import './index.css';
import App from './App.tsx';
import { useToastStore } from './stores/toastStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60,
    },
    mutations: {
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          if (!error.response) {
            useToastStore.getState().show(
              '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
              'error'
            );
          } else if (error.response.status >= 500) {
            useToastStore.getState().show(
              '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
              'error'
            );
          }
        }
      },
    },
  },
});

const saved = localStorage.getItem('theme');
if (saved === 'dark') document.documentElement.classList.add('dark');

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
