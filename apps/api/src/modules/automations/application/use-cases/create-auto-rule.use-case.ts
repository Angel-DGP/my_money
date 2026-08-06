import { Injectable, Inject } from '@nestjs/common';
import { IUnitOfWork, UNIT_OF_WORK } from '@mymoney/shared';
import { AutoRule } from '../../domain/auto-rule.entity';
import { IAutoRuleRepository, AUTO_RULE_REPOSITORY } from '../../domain/auto-rule.repository.interface';
import { CreateAutoRuleDto } from '../../presentation/dtos/create-auto-rule.dto';
import { AutoRuleDto } from '../../presentation/dtos/auto-rule.dto';

@Injectable()
export class CreateAutoRuleUseCase {
  constructor(
    @Inject(AUTO_RULE_REPOSITORY)
    private readonly autoRuleRepository: IAutoRuleRepository,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(userId: string, dto: CreateAutoRuleDto): Promise<AutoRuleDto> {
    const rule = AutoRule.create({
      userId,
      name: dto.name,
      description: dto.description,
      triggerType: dto.trigger_type,
      conditions: dto.conditions,
      actionType: dto.action_type,
      actionParams: dto.action_params,
      isActive: dto.is_active ?? true,
    });

    await this.unitOfWork.execute(async () => {
      await this.autoRuleRepository.save(rule);
    });

    return AutoRuleDto.fromDomain(rule);
  }
}
