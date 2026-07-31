import { Controller, Get, Post, Delete, Body, Param, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';
import { CreateCategoryUseCase } from '../application/use-cases/create-category.use-case';
import { DeleteCategoryUseCase } from '../application/use-cases/delete-category.use-case';
import { ListCategoriesUseCase } from '../application/use-cases/list-categories.use-case';
import { CreateCategoryDto, CategoryDto } from '../presentation/dtos/category.dto';
import { SessionGuard } from '../../../auth/session.guard';

@ApiTags('Categories')
@ApiCookieAuth('session_id')
@UseGuards(SessionGuard)
@Controller('api/v1/categories')
export class CategoriesController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase,
    private readonly listCategoriesUseCase: ListCategoriesUseCase
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, description: 'List of all categories including system ones.', type: [CategoryDto] })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getCategories(@Request() req: any) {
    const data = await this.listCategoriesUseCase.execute(req.user.id);
    return { data };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, description: 'The created category.' })
  async createCategory(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: any,
    @Body() dto: CreateCategoryDto
  ) {
    const data = await this.createCategoryUseCase.execute(req.user.id, dto);
    return { data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a category' })
  @ApiResponse({ status: 204, description: 'Category successfully deleted.' })
  async deleteCategory(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: any,
    @Param('id') id: string
  ) {
    await this.deleteCategoryUseCase.execute(req.user.id, id);
  }
}
