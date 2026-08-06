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

export interface CardTypeDto {
  id: string;
  name: string;
  created_at: string;
}

export interface CardDto {
  id: string;
  institution_id: string;
  name: string;
  brand_id: string;
  type_id: string;
  last_four: string;
  institution?: InstitutionDto;
  brand?: CardBrandDto;
  type?: CardTypeDto;
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
}

export interface ProductServiceDto {
  id: string;
  category_id: string;
  name: string;
}
