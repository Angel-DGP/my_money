import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useSessionStore } from '@entities/session';
import { useGlobalErrorStore } from '../../store/global-error.store';
import { API_CONFIG } from '../config';
import { formatApiErrorMessage } from '../../utils/formatApiError';

// ── Tipos ──────────────────────────────────────────────────────────────────

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface RefreshResponse {
  token: string;
  user: { id: string; email: string; name: string };
}

type QueueEntry = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

// ── Estado del refresh (módulo-level, compartido entre interceptaciones) ───

let isRefreshing = false;
let failedQueue: QueueEntry[] = [];

function processQueue(error: unknown, token: string | null): void {
  failedQueue.forEach((entry) => {
    if (error) entry.reject(error);
    else entry.resolve(token!);
  });
  failedQueue = [];
}

// ── Refresh directo: usa axios base, NO apiClient, para evitar bucles ──────

async function doRefresh(): Promise<RefreshResponse> {
  const response = await axios.post<RefreshResponse>(
    `${API_CONFIG.baseURL}/auth/refresh`,
    {},
    { withCredentials: true } // refresh token viaja en cookie HttpOnly
  );
  return response.data;
}

// ── Limpieza y redirección ─────────────────────────────────────────────────

function handleSessionExpired(): void {
  useSessionStore.getState().clearSession();
  if (typeof window !== 'undefined') {
    window.location.replace('/login');
  }
}

// ── Interceptor ────────────────────────────────────────────────────────────

export const errorInterceptor = async (error: AxiosError): Promise<never> => {
  const originalRequest = error.config as RetryConfig | undefined;
  
  const { showError } = useGlobalErrorStore.getState();

  // Network Error (No response from server)
  if (!error.response) {
    showError('Error de conexión', 'No se pudo conectar con el servidor. Verifica tu conexión a internet o intenta más tarde.');
    return Promise.reject(error);
  }

  const status = error.response.status;
  const data = error.response.data;

  // Validation / Business Error (400, 404, 409, 422)
  if (status === 400 || status === 404 || status === 409 || status === 422) {
    const formattedMsg = formatApiErrorMessage(data);
    if (error.response.data && typeof error.response.data === 'object') {
      (error.response.data as { formattedMessage?: string }).formattedMessage = formattedMsg;
    }
    showError('Error de validación', formattedMsg);
  }

  // Server Error (5xx)
  if (status >= 500) {
    showError('Error del servidor', 'Ocurrió un problema inesperado en nuestros servidores. Intenta más tarde.');
  }

  // Solo actuar con refresh token en errores 401
  if (status !== 401) {
    return Promise.reject(error);
  }

  // Protección 1: no reintentar si el request que falló ya era el endpoint de refresh.
  // Evita cualquier bucle si el backend devuelve 401 en /auth/refresh.
  if (originalRequest?.url?.includes('/auth/refresh')) {
    handleSessionExpired();
    return Promise.reject(error);
  }

  // Protección 2: no reintentar si ya es un segundo intento para este request.
  if (originalRequest?._retry) {
    return Promise.reject(error);
  }

  // Encolar si ya hay un refresh en curso
  if (isRefreshing) {
    return new Promise<never>((resolve, reject) => {
      failedQueue.push({
        resolve: (token) => {
          if (originalRequest?.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          resolve(axios(originalRequest!) as unknown as never);
        },
        reject,
      });
    });
  }

  // Primer 401: marcar como reintento y lanzar el refresh
  if (originalRequest) {
    originalRequest._retry = true;
  }
  isRefreshing = true;

  try {
    const refreshed = await doRefresh();

    useSessionStore.getState().setSession(refreshed.token, refreshed.user);

    if (originalRequest?.headers) {
      originalRequest.headers.Authorization = `Bearer ${refreshed.token}`;
    }

    processQueue(null, refreshed.token);

    return axios(originalRequest!) as unknown as never;
  } catch (refreshError) {
    // Refresh falló: rechazar la cola y limpiar sesión
    processQueue(refreshError, null);
    handleSessionExpired();
    return Promise.reject(refreshError);
  } finally {
    // Garantizado: siempre se resetea isRefreshing, incluso si hay
    // una excepción inesperada no capturada en el catch.
    isRefreshing = false;
  }
};

// ── Sincronización entre pestañas ──────────────────────────────────────────
// Si el usuario hace logout en otra pestaña, auth-storage se borra del
// localStorage. El evento 'storage' lo detecta y limpia la sesión local.

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'auth-storage' && event.newValue === null) {
      useSessionStore.getState().clearSession();
    }
  });
}
