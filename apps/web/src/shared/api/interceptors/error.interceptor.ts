import { AxiosError } from 'axios';
import { useSessionStore } from '../../../entities/session/model/store';

export const errorInterceptor = (error: AxiosError) => {
  if (error.response?.status === 401) {
    useSessionStore.getState().clearSession();
  }
  return Promise.reject(error);
};
