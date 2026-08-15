import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CatalogsService } from './catalogs.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCardDto } from './dto/catalogs.dto';

describe('CatalogsService & Card DTOs', () => {
  let service: CatalogsService;
  let prisma: {
    card: {
      create: jest.Mock;
      update: jest.Mock;
      findMany: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      card: {
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatalogsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CatalogsService>(CatalogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('CreateCardDto validation', () => {
    it('should validate DEBIT card with empty strings without errors', async () => {
      const plain = {
        name: 'Débito Banco Pichincha',
        last_four: '4321',
        institution_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        brand_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        type: 'DEBIT',
        base_interest_rate: '',
        billing_day: '',
        payment_day: '',
      };

      const dto = plainToInstance(CreateCardDto, plain);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate DEBIT card with null values without errors', async () => {
      const plain = {
        name: 'Débito Banco Guayaquil',
        last_four: '1111',
        institution_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        brand_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        type: 'DEBIT',
        base_interest_rate: null,
        billing_day: null,
        payment_day: null,
      };

      const dto = plainToInstance(CreateCardDto, plain);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate CREDIT card with valid parameters', async () => {
      const plain = {
        name: 'Visa Signature',
        last_four: '9876',
        institution_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        brand_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        type: 'CREDIT',
        base_interest_rate: '16.5',
        billing_day: 15,
        payment_day: 5,
      };

      const dto = plainToInstance(CreateCardDto, plain);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject CREDIT card with invalid billing day > 31', async () => {
      const plain = {
        name: 'Visa Signature',
        last_four: '9876',
        institution_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        brand_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        type: 'CREDIT',
        billing_day: 45,
      };

      const dto = plainToInstance(CreateCardDto, plain);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'billing_day')).toBe(true);
    });
  });

  describe('createCard and updateCard in CatalogsService', () => {
    it('should create DEBIT card with null credit fields', async () => {
      prisma.card.create.mockResolvedValue({ id: 'card-1' });

      await service.createCard('user-1', {
        name: 'Débito Principal',
        last_four: '1234',
        institution_id: 'inst-1',
        brand_id: 'brand-1',
        type: 'DEBIT',
        base_interest_rate: '15.5', // should be ignored for DEBIT
        billing_day: 15, // should be ignored for DEBIT
      });

      expect(prisma.card.create).toHaveBeenCalledWith({
        data: {
          name: 'Débito Principal',
          last_four: '1234',
          institution_id: 'inst-1',
          brand_id: 'brand-1',
          type: 'DEBIT',
          base_interest_rate: null,
          billing_day: null,
          payment_day: null,
          user_id: 'user-1',
        },
      });
    });

    it('should create CREDIT card preserving numeric credit fields', async () => {
      prisma.card.create.mockResolvedValue({ id: 'card-2' });

      await service.createCard('user-1', {
        name: 'Mastercard Black',
        last_four: '5678',
        institution_id: 'inst-1',
        brand_id: 'brand-1',
        type: 'CREDIT',
        base_interest_rate: '18.25',
        billing_day: 20,
        payment_day: 10,
      });

      expect(prisma.card.create).toHaveBeenCalledWith({
        data: {
          name: 'Mastercard Black',
          last_four: '5678',
          institution_id: 'inst-1',
          brand_id: 'brand-1',
          type: 'CREDIT',
          base_interest_rate: 18.25,
          billing_day: 20,
          payment_day: 10,
          user_id: 'user-1',
        },
      });
    });
  });
});
