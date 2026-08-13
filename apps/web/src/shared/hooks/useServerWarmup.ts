import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../api/config';

interface ServerWarmupState {
  isWarmedUp: boolean;
  isWakingUp: boolean;
  elapsedSeconds: number;
}

let globalWarmupPromise: Promise<boolean> | null = null;
let globalIsWarmedUp = false;

export function pingServerWarmup(): Promise<boolean> {
  if (globalIsWarmedUp) return Promise.resolve(true);
  if (globalWarmupPromise) return globalWarmupPromise;

  const url = `${API_CONFIG.baseURL.replace(/\/v1\/?$/, '')}/health`;

  globalWarmupPromise = axios
    .get(url, { timeout: 65000 })
    .then(() => {
      globalIsWarmedUp = true;
      return true;
    })
    .catch(() => {
      // Fallback ping to baseURL directly
      return axios
        .get(API_CONFIG.baseURL, { timeout: 65000 })
        .then(() => {
          globalIsWarmedUp = true;
          return true;
        })
        .catch(() => false);
    });

  return globalWarmupPromise;
}

export function useServerWarmup(isSubmitting = false): ServerWarmupState {
  const [isWarmedUp, setIsWarmedUp] = useState(globalIsWarmedUp);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let interval: ReturnType<typeof setInterval> | null = null;

    if (!globalIsWarmedUp || isSubmitting) {
      // If after 2.5 seconds it hasn't resolved, show wake-up notice
      timer = setTimeout(() => {
        setIsWakingUp(true);
        const startTime = Date.now();
        interval = setInterval(() => {
          setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000) + 2);
        }, 1000);
      }, 2500);

      pingServerWarmup().then((success) => {
        if (success) {
          setIsWarmedUp(true);
          setIsWakingUp(false);
        }
        if (timer) clearTimeout(timer);
        if (interval) clearInterval(interval);
      });
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (interval) clearInterval(interval);
    };
  }, [isSubmitting]);

  return {
    isWarmedUp,
    isWakingUp: isWakingUp && isSubmitting,
    elapsedSeconds,
  };
}
