import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('BudgetsController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let testUserId: string;
  let testCategoryId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Si la app usa middlewares globales para autenticación, inyéctalos aquí o búscales un mock
    // Por simplicidad, simularemos un middleware que inyecta user.id
    app.use((req, res, next) => {
      if (!req.user) {
        req.user = { id: testUserId };
      }
      next();
    });

    await app.init();
    
    prisma = app.get(PrismaService);

    // Setup Test Data
    const user = await prisma.user.create({
      data: {
        email: 'budget-e2e-test@example.com',
        password_hash: 'hash',
        name: 'Test User',
      }
    });
    testUserId = user.id;

    const category = await prisma.category.create({
      data: {
        user_id: testUserId,
        name: 'Food',
        type: 'EXPENSE',
        icon: 'food',
        color: '#ff0000',
      }
    });
    testCategoryId = category.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.transaction.deleteMany({ where: { user_id: testUserId } });
    await prisma.budget.deleteMany({ where: { user_id: testUserId } });
    await prisma.category.deleteMany({ where: { user_id: testUserId } });
    await prisma.user.delete({ where: { id: testUserId } });
    
    await app.close();
  });

  let createdBudgetId: string;

  it('/budgets (POST) - should create a budget', () => {
    return request(app.getHttpServer())
      .post('/budgets')
      .send({
        category_id: testCategoryId,
        period: 'MONTHLY',
        amount: '1000',
        currency: 'USD',
        start_date: '2026-07-01',
        alert_threshold: 80
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.id).toBeDefined();
        expect(res.body.amount.value).toBe('1000');
        createdBudgetId = res.body.id;
      });
  });

  it('/budgets (GET) - should list budgets', () => {
    return request(app.getHttpServer())
      .get('/budgets')
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].id).toBe(createdBudgetId);
      });
  });

  it('/budgets/:id (GET) - should get a specific budget', () => {
    return request(app.getHttpServer())
      .get(`/budgets/${createdBudgetId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(createdBudgetId);
      });
  });

  it('/budgets/:id (PATCH) - should update a budget', () => {
    return request(app.getHttpServer())
      .patch(`/budgets/${createdBudgetId}`)
      .send({ amount: '1200' })
      .expect(200)
      .expect((res) => {
        expect(res.body.amount.value).toBe('1200');
      });
  });

  it('/budgets/:id/deactivate (POST) - should deactivate a budget', () => {
    return request(app.getHttpServer())
      .post(`/budgets/${createdBudgetId}/deactivate`)
      .expect(200);
  });

  it('/budgets/:id/reactivate (POST) - should reactivate a budget', () => {
    return request(app.getHttpServer())
      .post(`/budgets/${createdBudgetId}/reactivate`)
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ACTIVE');
      });
  });
});
