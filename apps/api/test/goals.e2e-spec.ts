import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('GoalsController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    app.use((req, res, next) => {
      if (!req.user) {
        req.user = { id: userId };
      }
      next();
    });

    await app.init();

    prisma = app.get(PrismaService);

    // Setup user
    const user = await prisma.user.create({
      data: {
        email: 'goals-e2e@example.com',
        password_hash: 'hashedpassword',
        name: 'Goals Tester',
      }
    });
    userId = user.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.goal.deleteMany({ where: { user_id: userId } });
    await prisma.session.deleteMany({ where: { user_id: userId } });
    await prisma.user.delete({ where: { id: userId } });
    await app.close();
  });

  describe('/goals', () => {
    let createdGoalId: string;

    it('POST /goals - creates a new goal', async () => {
      const response = await request(app.getHttpServer())
        .post('/goals')
        .send({
          name: 'Vacation',
          target_amount: 5000,
          currency: 'USD',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Vacation');
      expect(response.body.target_amount.value).toBe('5000.0000');
      expect(response.body.status).toBe('ACTIVE');

      createdGoalId = response.body.id;
    });

    it('GET /goals - gets all goals', async () => {
      const response = await request(app.getHttpServer())
        .get('/goals')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].id).toBe(createdGoalId);
    });

    it('GET /goals/:id - gets specific goal', async () => {
      const response = await request(app.getHttpServer())
        .get(`/goals/${createdGoalId}`)
        .expect(200);

      expect(response.body.id).toBe(createdGoalId);
      expect(response.body.name).toBe('Vacation');
    });

    it('POST /goals/:id/add-progress - adds progress', async () => {
      const response = await request(app.getHttpServer())
        .post(`/goals/${createdGoalId}/add-progress`)
        .send({
          amount: 1000,
          currency: 'USD',
        })
        .expect(200);

      expect(response.body.current_amount.value).toBe('1000.0000');
      expect(response.body.progress_percentage).toBe(20);
      expect(response.body.status).toBe('ACTIVE');
    });

    it('POST /goals/:id/add-progress - completes the goal when target is reached', async () => {
      const response = await request(app.getHttpServer())
        .post(`/goals/${createdGoalId}/add-progress`)
        .send({
          amount: 4500, // exceeds the remaining 4000
          currency: 'USD',
        })
        .expect(200);

      expect(response.body.current_amount.value).toBe('5000.0000');
      expect(response.body.progress_percentage).toBe(100);
      expect(response.body.status).toBe('COMPLETED');
    });
  });
});
