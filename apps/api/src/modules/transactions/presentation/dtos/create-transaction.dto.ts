import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, IsNumberString, Matches, IsBoolean, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType } from '../../domain/transaction-type.enum';

export class TransactionInstallmentDto {
  @IsNumber()
  @IsNotEmpty()
  total_installments!: number;

  @IsNumber()
  @IsOptional()
  interest_rate?: number;

  @IsNumber()
  @IsOptional()
  grace_months?: number;
}

export class CreateTransactionDto {
  @IsUUID()
  @IsNotEmpty()
  account_id!: string;

  @IsUUID()
  @IsOptional()
  category_id?: string;

  @IsEnum(TransactionType)
  @IsNotEmpty()
  type!: TransactionType;

  @IsNumberString()
  @IsNotEmpty()
  amount!: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be in YYYY-MM-DD format' })
  @IsNotEmpty()
  date!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  is_third_party?: boolean;

  @IsString()
  @IsOptional()
  third_party_owner?: string;

  @IsString()
  @IsOptional()
  third_party_note?: string;

  @IsString()
  @IsOptional()
  payment_method?: string;

  @IsUUID()
  @IsOptional()
  card_id?: string;

  @IsUUID()
  @IsOptional()
  subscription_id?: string;

  @IsUUID()
  @IsOptional()
  product_id?: string;

  @ValidateNested()
  @Type(() => TransactionInstallmentDto)
  @IsOptional()
  installment?: TransactionInstallmentDto;
}

export class UpdateTransactionDto {
  @IsUUID()
  @IsOptional()
  category_id?: string;

  @IsNumberString()
  @IsOptional()
  amount?: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be in YYYY-MM-DD format' })
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  is_third_party?: boolean;

  @IsString()
  @IsOptional()
  third_party_owner?: string;

  @IsString()
  @IsOptional()
  third_party_note?: string;

  @IsString()
  @IsOptional()
  payment_method?: string;

  @IsUUID()
  @IsOptional()
  card_id?: string;

  @IsUUID()
  @IsOptional()
  subscription_id?: string;

  @IsUUID()
  @IsOptional()
  product_id?: string;

  @ValidateNested()
  @Type(() => TransactionInstallmentDto)
  @IsOptional()
  installment?: TransactionInstallmentDto;
}


