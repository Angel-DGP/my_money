import { PartialType } from '@nestjs/swagger';
import { CreateAutoRuleDto } from './create-auto-rule.dto';

export class UpdateAutoRuleDto extends PartialType(CreateAutoRuleDto) {}
