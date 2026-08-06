import { Injectable, Inject } from '@nestjs/common';
import { IAutoRuleRepository, AUTO_RULE_REPOSITORY } from '../../domain/auto-rule.repository.interface';
import { AutoRuleDto } from '../../presentation/dtos/auto-rule.dto';

@Injectable()
export class GetAutoRulesUseCase {
  constructor(
    @Inject(AUTO_RULE_REPOSITORY)
    private readonly autoRuleRepository: IAutoRuleRepository,
  ) {}

  async execute(userId: string, activeOnly: boolean = false): Promise<AutoRuleDto[]> {
    const rules = activeOnly 
      ? await this.autoRuleRepository.findActiveByUser(userId)
      : await this.autoRuleRepository.findAllByUser(userId);
      
    return rules.map(AutoRuleDto.fromDomain);
  }
}
