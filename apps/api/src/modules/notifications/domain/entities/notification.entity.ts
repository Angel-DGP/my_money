export class NotificationEntity {
  id!: string;
  user_id!: string;
  type!: 'ERROR' | 'WARNING' | 'SUCCESS' | 'INFO' | 'SYSTEM';
  title!: string;
  body!: string | null;
  entity_type!: string | null;
  entity_id!: string | null;
  action_url!: string | null;
  read_at!: Date | null;
  created_at!: Date;

  constructor(partial: Partial<NotificationEntity>) {
    Object.assign(this, partial);
  }

  isRead(): boolean {
    return this.read_at !== null;
  }
}
