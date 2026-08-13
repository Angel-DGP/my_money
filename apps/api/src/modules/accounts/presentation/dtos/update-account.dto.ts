import { IsString, IsOptional, Matches, IsNumberString, IsEnum, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AccountType } from '../../domain/account-type.enum';

/**
 * DTO para actualizar una cuenta existente.
 * Todos los campos son opcionales — solo los enviados serán modificados.
 *
 * Nota: `currency` no es actualizable una vez la cuenta tiene transacciones.
 */
export class UpdateAccountDto {
  @ApiPropertyOptional({ example: 'Nueva Cartera' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: '150.00',
    description: 'Balance inicial. Solo funciona si la cuenta no tiene transacciones.',
  })
  @IsOptional()
  @IsNumberString()
  initial_balance?: string;

  @ApiPropertyOptional({ example: '#10B981' })
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'color must be a valid hex code (e.g. #FFFFFF)' })
  color?: string;

  @ApiPropertyOptional({ example: 'wallet' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ enum: AccountType, description: 'Tipo de cuenta' })
  @IsOptional()
  @IsEnum(AccountType)
  type?: AccountType;

  @ApiPropertyOptional({ description: 'ID de la institución financiera' })
  @IsOptional()
  @IsUUID()
  institution_id?: string;

  @ApiPropertyOptional({ description: 'Tipo específico, ej. Ahorro Flexible' })
  @IsOptional()
  @IsString()
  specific_type?: string;
}
