import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional, Length } from 'class-validator';
import { CategoryType } from '../../domain/category.type';

export class SubcategoryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: CategoryType })
  type!: CategoryType;

  @ApiProperty()
  is_system!: boolean;

  @ApiProperty()
  parent_id!: string;

  @ApiProperty({ required: false })
  icon?: string;

  @ApiProperty({ required: false })
  color?: string;
}

export class CategoryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: CategoryType })
  type!: CategoryType;

  @ApiProperty()
  is_system!: boolean;

  @ApiProperty({ required: false })
  icon?: string;

  @ApiProperty({ required: false })
  color?: string;

  @ApiProperty({ type: [SubcategoryDto], required: false })
  subcategories?: SubcategoryDto[];
}

export class CreateCategoryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  name!: string;

  @ApiProperty({ enum: CategoryType })
  @IsEnum(CategoryType)
  type!: CategoryType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  parent_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  color?: string;
}

export class UpdateCategoryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  color?: string;
}
