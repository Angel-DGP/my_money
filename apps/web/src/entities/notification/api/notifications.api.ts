import { apiClient } from '@shared/api/client';
import type { ListNotificationsResponse } from '../model/notification.types';

export const notificationsApi = {
  list: async () => {
    const { data } = await apiClient.get<ListNotificationsResponse>('/notifications');
    return data;
  },
  
  markAsRead: async (id: string) => {
    await apiClient.patch(`/notifications/${id}/read`);
  }
};
