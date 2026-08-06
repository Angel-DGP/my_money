import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';
import { AUTO_RULE_REPOSITORY } from './domain/auto-rule.repository.interface';
import { PrismaAutoRuleRepository } from './infrastructure/prisma-auto-rule.repository';
import { CreateAutoRuleUseCase } from './application/use-cases/create-auto-rule.use-case';
import { UpdateAutoRuleUseCase } from './application/use-cases/update-auto-rule.use-case';
import { GetAutoRulesUseCase } from './application/use-cases/get-auto-rules.use-case';
import { DeleteAutoRuleUseCase } from './application/use-cases/delete-auto-rule.use-case';
import { AutomationsController } from './presentation/automations.controller';
import { AutomationsEngineService } from './application/services/automations-engine.service';

@Module({
  imports: [PrismaModule],
  controllers: [AutomationsController],
  providers: [
    {
      provide: AUTO_RULE_REPOSITORY,
      useClass: PrismaAutoRuleRepository,
    },
    CreateAutoRuleUseCase,
    UpdateAutoRuleUseCase,
    GetAutoRulesUseCase,
    DeleteAutoRuleUseCase,
    AutomationsEngineService,
  ],
  exports: [AUTO_RULE_REPOSITORY, AutomationsEngineService],
})
export class AutomationsModule {}
