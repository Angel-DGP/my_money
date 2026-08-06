export type InsightType = 'WARNING' | 'SUGGESTION' | 'SUCCESS' | 'INFO';

export interface InsightDto {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  action_label?: string;
  action_url?: string;
  created_at: string;
}
