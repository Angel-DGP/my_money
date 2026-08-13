import axios from 'axios';
import { API_CONFIG } from './config';
import { authInterceptor } from './interceptors/auth.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';

export const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(authInterceptor);
apiClient.interceptors.response.use((res) => {
  if (res.data && typeof res.data === 'object' && 'data' in res.data) {
    const { data, meta } = res.data;
    if (meta && data && typeof data === 'object') {
      Object.defineProperty(data, 'meta', {
        value: meta,
        writable: true,
        enumerable: false,
        configurable: true
      });
    }
    res.data = data;
    if (meta) {
      (res as { meta?: unknown }).meta = meta;
    }
  }
  return res;
}, errorInterceptor);
