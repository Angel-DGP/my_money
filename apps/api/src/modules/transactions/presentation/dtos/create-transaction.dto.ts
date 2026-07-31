import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, IsNumberString, Matches } from 'class-validator';
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
}

export class CreateTransferDto {
  @IsUUID()
  @IsNotEmpty()
  source_account_id!: string;

  @IsUUID()
  @IsNotEmpty()
  destination_account_id!: string;

  @IsNumberString()
  @IsNotEmpty()
  amount!: string;

  @IsNumberString()
  @IsNotEmpty()
  destination_amount!: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be in YYYY-MM-DD format' })
  @IsNotEmpty()
  date!: string;

  @IsString()
  @IsOptional()
  description?: string;
}
