import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUnitOfWork, UNIT_OF_WORK } from '@mymoney/shared';
import { IAutoRuleRepository, AUTO_RULE_REPOSITORY } from '../../domain/auto-rule.repository.interface';

@Injectable()
export class DeleteAutoRuleUseCase {
  constructor(
    @Inject(AUTO_RULE_REPOSITORY)
    private readonly autoRuleRepository: IAutoRuleRepository,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(userId: string, id: string): Promise<void> {
    const rule = await this.autoRuleRepository.findById(id, userId);
    if (!rule) {
      throw new NotFoundException('Automation rule not found');
    }

    await this.unitOfWork.execute(async () => {
      await this.autoRuleRepository.delete(id, userId);
    });
  }
}
