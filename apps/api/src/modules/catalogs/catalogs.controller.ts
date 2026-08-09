import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { CatalogsService, CreateProductServiceDto, UpdateSubscriptionDto } from './catalogs.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';

// ─── Catalog Create DTOs ─────────────────────────────────────────────────────

interface CreateInstitutionDto {
  name: string;
  type: string;
  logo_url?: string;
}

interface CreateCardBrandDto {
  name: string;
  logo_url?: string;
}

interface CreateCardTypeDto {
  name: string;
}

interface CreateCardDto {
  name: string;
  last_four: string;
  institution_id: string;
  brand_id: string;
  type_id: string;
  expiry_month?: number;
  expiry_year?: number;
}

interface CreateSubscriptionDto {
  name: string;
  category_id: string;
  amount: number;
  currency: string;
  billing_cycle: string;
  next_billing_date: string;
  card_id?: string;
}



// ─── Controller ──────────────────────────────────────────────────────────────

@Controller('catalogs')
@UseGuards(JwtAuthGuard)
export class CatalogsController {
  constructor(private readonly catalogsService: CatalogsService) {}

  @Get('institutions')
  getInstitutions(@Req() req: AuthenticatedRequest) {
    return this.catalogsService.getInstitutions(req.user.id);
  }

  @Post('institutions')
  createInstitution(@Req() req: AuthenticatedRequest, @Body() data: CreateInstitutionDto) {
    return this.catalogsService.createInstitution(req.user.id, data);
  }

  @Put('institutions/:id')
  updateInstitution(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() data: Partial<CreateInstitutionDto>) {
    return this.catalogsService.updateInstitution(req.user.id, id, data);
  }

  @Delete('institutions/:id')
  deleteInstitution(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.catalogsService.deleteInstitution(req.user.id, id);
  }

  // --- Card Brands ---
  @Get('card-brands')
  getCardBrands(@Req() req: AuthenticatedRequest) {
    return this.catalogsService.getCardBrands(req.user.id);
  }

  @Post('card-brands')
  createCardBrand(@Req() req: AuthenticatedRequest, @Body() data: CreateCardBrandDto) {
    return this.catalogsService.createCardBrand(req.user.id, data);
  }

  @Put('card-brands/:id')
  updateCardBrand(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() data: CreateCardBrandDto) {
    return this.catalogsService.updateCardBrand(req.user.id, id, data);
  }

  @Delete('card-brands/:id')
  deleteCardBrand(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.catalogsService.deleteCardBrand(req.user.id, id);
  }

  // --- Card Types ---
  @Get('card-types')
  getCardTypes(@Req() req: AuthenticatedRequest) {
    return this.catalogsService.getCardTypes(req.user.id);
  }

  @Post('card-types')
  createCardType(@Req() req: AuthenticatedRequest, @Body() data: CreateCardTypeDto) {
    return this.catalogsService.createCardType(req.user.id, data);
  }

  @Put('card-types/:id')
  updateCardType(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() data: CreateCardTypeDto) {
    return this.catalogsService.updateCardType(req.user.id, id, data);
  }

  @Delete('card-types/:id')
  deleteCardType(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.catalogsService.deleteCardType(req.user.id, id);
  }

  // --- Cards ---
  @Get('cards')
  getCards(@Req() req: AuthenticatedRequest) {
    return this.catalogsService.getCards(req.user.id);
  }

  @Post('cards')
  createCard(@Req() req: AuthenticatedRequest, @Body() data: CreateCardDto) {
    return this.catalogsService.createCard(req.user.id, data);
  }

  @Put('cards/:id')
  updateCard(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() data: Partial<CreateCardDto>) {
    return this.catalogsService.updateCard(req.user.id, id, data);
  }

  @Delete('cards/:id')
  deleteCard(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.catalogsService.deleteCard(req.user.id, id);
  }

  @Get('subscriptions')
  getSubscriptions(@Req() req: AuthenticatedRequest) {
    return this.catalogsService.getSubscriptions(req.user.id);
  }

  @Post('subscriptions')
  createSubscription(@Req() req: AuthenticatedRequest, @Body() data: CreateSubscriptionDto) {
    return this.catalogsService.createSubscription(req.user.id, data);
  }

  @Put('subscriptions/:id')
  updateSubscription(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() data: UpdateSubscriptionDto) {
    return this.catalogsService.updateSubscription(req.user.id, id, data);
  }

  @Delete('subscriptions/:id')
  deleteSubscription(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.catalogsService.deleteSubscription(req.user.id, id);
  }

  @Get('product-services')
  getProductServices(@Req() req: AuthenticatedRequest) {
    return this.catalogsService.getProductServices(req.user.id);
  }

  @Post('product-services')
  createProductService(@Req() req: AuthenticatedRequest, @Body() data: CreateProductServiceDto) {
    return this.catalogsService.createProductService(req.user.id, data);
  }

  @Put('product-services/:id')
  updateProductService(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() data: Partial<CreateProductServiceDto>) {
    return this.catalogsService.updateProductService(req.user.id, id, data);
  }

  @Delete('product-services/:id')
  deleteProductService(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.catalogsService.deleteProductService(req.user.id, id);
  }
}
