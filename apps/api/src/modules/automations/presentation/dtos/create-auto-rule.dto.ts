import { IsString, IsNotEmpty, IsEnum, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { TriggerType, ActionType } from '../../domain/auto-rule.entity';

export class CreateAutoRuleDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TriggerType)
  @IsNotEmpty()
  trigger_type!: TriggerType;

  @IsObject()
  @IsOptional()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  conditions?: Record<string, any>;

  @IsEnum(ActionType)
  @IsNotEmpty()
  action_type!: ActionType;

  @IsObject()
  @IsNotEmpty()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action_params!: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
