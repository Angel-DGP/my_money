import { IsString, IsOptional, IsNumber, IsISO8601, Min, Length, Max } from 'class-validator';

/**
 * DTO para actualizar una meta existente.
 * Todos los campos son opcionales — solo los enviados serán modificados.
 */
export class UpdateGoalDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  target_amount?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsISO8601()
  target_date?: string | null;

  @IsOptional()
  @IsString()
  @Length(1, 1000)
  description?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(3)
  priority?: number;

  @IsOptional()
  @IsString()
  @Length(7, 7)
  color?: string | null;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  icon?: string | null;

  @IsOptional()
  @IsString()
  account_id?: string | null;
}
