import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { CatalogsService } from './catalogs.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('catalogs')
@UseGuards(JwtAuthGuard)
export class CatalogsController {
  constructor(private readonly catalogsService: CatalogsService) {}

  @Get('institutions')
  getInstitutions(@Req() req: any) {
    return this.catalogsService.getInstitutions(req.user.id);
  }

  @Post('institutions')
  createInstitution(@Req() req: any, @Body() data: any) {
    return this.catalogsService.createInstitution(req.user.id, data);
  }

  // --- Card Brands ---
  @Get('card-brands')
  getCardBrands(@Req() req: any) {
    return this.catalogsService.getCardBrands(req.user.id);
  }

  @Post('card-brands')
  createCardBrand(@Req() req: any, @Body() data: any) {
    return this.catalogsService.createCardBrand(req.user.id, data);
  }

  // --- Card Types ---
  @Get('card-types')
  getCardTypes(@Req() req: any) {
    return this.catalogsService.getCardTypes(req.user.id);
  }

  @Post('card-types')
  createCardType(@Req() req: any, @Body() data: any) {
    return this.catalogsService.createCardType(req.user.id, data);
  }

  // --- Cards ---
  @Get('cards')
  getCards(@Req() req: any) {
    return this.catalogsService.getCards(req.user.id);
  }

  @Post('cards')
  createCard(@Req() req: any, @Body() data: any) {
    return this.catalogsService.createCard(req.user.id, data);
  }

  @Get('subscriptions')
  getSubscriptions(@Req() req: any) {
    return this.catalogsService.getSubscriptions(req.user.id);
  }

  @Post('subscriptions')
  createSubscription(@Req() req: any, @Body() data: any) {
    return this.catalogsService.createSubscription(req.user.id, data);
  }

  @Get('product-services')
  getProductServices(@Req() req: any) {
    return this.catalogsService.getProductServices(req.user.id);
  }

  @Post('product-services')
  createProductService(@Req() req: any, @Body() data: any) {
    return this.catalogsService.createProductService(req.user.id, data);
  }
}
