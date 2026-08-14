import { IsString, IsNotEmpty, IsOptional, IsNumber, IsUUID, IsNumberString, Min, Max, IsDateString } from 'class-validator';

export class CreateInstitutionDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsOptional()
  @IsString()
  logo_url?: string;
}

export class CreateCardBrandDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  logo_url?: string;
}

export class CreateCardDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  last_four!: string;

  @IsUUID()
  @IsNotEmpty()
  institution_id!: string;

  @IsUUID()
  @IsNotEmpty()
  brand_id!: string;

  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsOptional()
  @IsNumberString()
  base_interest_rate?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(31)
  billing_day?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(31)
  payment_day?: number | null;
}

export class CreateSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsUUID()
  @IsNotEmpty()
  category_id!: string;

  @IsNumber()
  @IsNotEmpty()
  amount!: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsString()
  @IsNotEmpty()
  billing_cycle!: string;

  @IsDateString()
  @IsNotEmpty()
  next_billing_date!: string;

  @IsOptional()
  @IsUUID()
  card_id?: string;

  @IsOptional()
  @IsNumber()
  duration_months?: number;
}

export class CreateProductServiceDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsUUID()
  @IsNotEmpty()
  category_id!: string;
}

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @IsOptional()
  @IsUUID()
  card_id?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  billing_cycle?: string;

  @IsOptional()
  @IsDateString()
  next_billing_date?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsNumber()
  duration_months?: number;
}
