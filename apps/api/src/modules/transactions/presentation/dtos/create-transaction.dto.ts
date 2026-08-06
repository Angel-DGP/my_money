import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, IsNumberString, Matches, IsBoolean } from 'class-validator';
import { TransactionType } from '../../domain/transaction-type.enum';

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
}


