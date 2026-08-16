import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { CatalogsService } from './catalogs.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';
import {
  CreateInstitutionDto,
  CreateCardBrandDto,
  CreateCardDto,
  CreateSubscriptionDto,
  CreateProductServiceDto,
  UpdateSubscriptionDto,
  ExtendSubscriptionDto,
} from './dto/catalogs.dto';



// ─── Controller ──────────────────────────────────────────────────────────────

@Controller({ path: 'catalogs', version: '1' })
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

  @Post('subscriptions/:id/extend')
  extendSubscription(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() data: ExtendSubscriptionDto,
  ) {
    return this.catalogsService.extendSubscription(req.user.id, id, data);
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
