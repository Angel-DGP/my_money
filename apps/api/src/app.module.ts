import { Module } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { UsersModule } from "./users/users.module";
import { SessionsModule } from "./sessions/sessions.module";
import { AuthModule } from "./auth/auth.module";
import { AuditModule } from "./audit/audit.module";
import { AccountsModule } from "./modules/accounts/accounts.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { TransactionsModule } from "./modules/transactions/transactions.module";
import { BudgetsModule } from "./modules/budgets/budgets.module";
import { GoalsModule } from "./modules/goals/goals.module";
import { NotificationsModule } from './modules/notifications/notifications.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { InsightsModule } from './modules/insights/insights.module';
import { AutomationsModule } from './modules/automations/automations.module';
import { CatalogsModule } from './modules/catalogs/catalogs.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { CashflowModule } from './modules/cashflow/cashflow.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    PrismaModule,
    UsersModule,
    SessionsModule,
    AuthModule,
    AuditModule,
    AccountsModule,
    CategoriesModule,
    TransactionsModule,
    BudgetsModule,
    GoalsModule,
    NotificationsModule,
    DashboardModule,
    InsightsModule,
    AutomationsModule,
    CatalogsModule,
    AnalyticsModule,
    CashflowModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
