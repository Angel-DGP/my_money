export interface InstitutionDto {
  id: string;
  name: string;
  type: string;
  created_at: string;
}

export interface CardBrandDto {
  id: string;
  name: string;
  created_at: string;
}


export interface CardDto {
  id: string;
  institution_id: string;
  name: string;
  brand_id: string;
  type: string;
  last_four: string;
  base_interest_rate?: string | null;
  billing_day?: number | null;
  payment_day?: number | null;
  institution?: InstitutionDto;
  brand?: CardBrandDto;
  created_at: string;
}

export interface SubscriptionDto {
  id: string;
  category_id: string;
  card_id?: string | null;
  name: string;
  amount: string;
  currency: string;
  billing_cycle: string;
  next_billing_date: string;
  start_date?: string;
  url?: string | null;
  status: string;
  card?: CardDto | null;
  duration_months?: number;
  pending_months?: number;
  is_completed?: boolean;
}

export interface ProductServiceDto {
  id: string;
  category_id: string;
  name: string;
  category?: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
}
