export interface NotificationDto {
  id: string;
  type: 'ERROR' | 'WARNING' | 'SUCCESS' | 'INFO' | 'SYSTEM';
  title: string;
  body: string | null;
  entity_type: string | null;
  entity_id: string | null;
  action_url: string | null;
  read_at: string | null;
  created_at: string;
}

export interface ListNotificationsResponse {
  data: {
    items: NotificationDto[];
    unread_count: number;
  };
}
