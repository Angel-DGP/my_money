import { InternalAxiosRequestConfig } from 'axios';
import { useSessionStore } from '../../../entities/session/model/store';

export const authInterceptor = (config: InternalAxiosRequestConfig) => {
  const token = useSessionStore.getState().token;
  
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};
