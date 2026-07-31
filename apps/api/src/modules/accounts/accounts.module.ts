import { Module } from '@nestjs/common';
import { AccountsController } from './presentation/accounts.controller';
import { 
  CreateAccountUseCase,
  UpdateAccountUseCase,
  DeleteAccountUseCase,
  GetAccountUseCase,
  ListAccountsUseCase
} from './application/use-cases';
import { PrismaAccountRepository } from './infrastructure/prisma';
import { ACCOUNT_REPOSITORY } from './domain/interfaces/account.repository.interface';
import { PrismaModule } from '../../prisma/prisma.module';
import { SessionsModule } from '../../sessions/sessions.module';

@Module({
  imports: [PrismaModule, SessionsModule],
  controllers: [AccountsController],
  providers: [
    {
      provide: ACCOUNT_REPOSITORY,
      useClass: PrismaAccountRepository,
    },
    CreateAccountUseCase,
    UpdateAccountUseCase,
    DeleteAccountUseCase,
    GetAccountUseCase,
    ListAccountsUseCase,
  ],
  exports: [
    ACCOUNT_REPOSITORY,
  ]
})
export class AccountsModule {}
