import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsUUID,
  IsNumberString,
  Min,
  Max,
  IsDateString,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';

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
  @Transform(({ value }) => (value === '' || value === null || value === undefined ? null : String(value)))
  @ValidateIf((o) => o.type !== 'DEBIT' && o.type !== 'PREPAID' && o.base_interest_rate !== null && o.base_interest_rate !== undefined)
  @IsNumberString()
  base_interest_rate?: string | null;

  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null || value === undefined ? null : Number(value)))
  @ValidateIf((o) => o.type !== 'DEBIT' && o.type !== 'PREPAID' && o.billing_day !== null && o.billing_day !== undefined)
  @IsNumber()
  @Min(1)
  @Max(31)
  billing_day?: number | null;

  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null || value === undefined ? null : Number(value)))
  @ValidateIf((o) => o.type !== 'DEBIT' && o.type !== 'PREPAID' && o.payment_day !== null && o.payment_day !== undefined)
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
  @Transform(({ value }) => (value === '' || value === null || value === undefined ? null : value))
  @IsUUID()
  card_id?: string | null;

  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null || value === undefined ? null : Number(value)))
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
  @Transform(({ value }) => (value === '' || value === null || value === undefined ? null : value))
  @IsUUID()
  card_id?: string | null;

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
  @Transform(({ value }) => (value === '' || value === null || value === undefined ? null : Number(value)))
  @IsNumber()
  duration_months?: number;
}
