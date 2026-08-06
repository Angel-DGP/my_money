import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUnitOfWork, UNIT_OF_WORK } from '@mymoney/shared';
import { IAutoRuleRepository, AUTO_RULE_REPOSITORY } from '../../domain/auto-rule.repository.interface';
import { UpdateAutoRuleDto } from '../../presentation/dtos/update-auto-rule.dto';
import { AutoRuleDto } from '../../presentation/dtos/auto-rule.dto';

@Injectable()
export class UpdateAutoRuleUseCase {
  constructor(
    @Inject(AUTO_RULE_REPOSITORY)
    private readonly autoRuleRepository: IAutoRuleRepository,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(userId: string, id: string, dto: UpdateAutoRuleDto): Promise<AutoRuleDto> {
    const rule = await this.autoRuleRepository.findById(id, userId);
    if (!rule) {
      throw new NotFoundException('Automation rule not found');
    }

    rule.update({
      name: dto.name,
      description: dto.description,
      triggerType: dto.trigger_type,
      conditions: dto.conditions,
      actionType: dto.action_type,
      actionParams: dto.action_params,
    });

    if (dto.is_active !== undefined) {
      rule.toggle(dto.is_active);
    }

    await this.unitOfWork.execute(async () => {
      await this.autoRuleRepository.save(rule);
    });

    return AutoRuleDto.fromDomain(rule);
  }
}
