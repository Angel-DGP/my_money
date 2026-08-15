import { Test, TestingModule } from '@nestjs/testing';
import { CatalogsController } from './catalogs.controller';
import { CatalogsService } from './catalogs.service';

describe('CatalogsController', () => {
  let controller: CatalogsController;
  let service: Partial<CatalogsService>;

  beforeEach(async () => {
    service = {
      getCards: jest.fn(),
      createCard: jest.fn(),
      updateCard: jest.fn(),
      deleteCard: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatalogsController],
      providers: [{ provide: CatalogsService, useValue: service }],
    }).compile();

    controller = module.get<CatalogsController>(CatalogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
