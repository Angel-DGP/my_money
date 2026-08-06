import type { InternalAxiosRequestConfig } from 'axios';
import { useSessionStore } from '@entities/session';

export const authInterceptor = (config: InternalAxiosRequestConfig) => {
  const token = useSessionStore.getState().token;
  
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};
