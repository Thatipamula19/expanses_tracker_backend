import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AddCategoryDto } from './dtos/add-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';

@ApiBearerAuth("access-token")
@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    async getCategories() {
        return await this.categoriesService.getCategories();
    }

    @Get(':category_id')
    @HttpCode(HttpStatus.OK)
    async getCategory(@Param('category_id') category_id: string) {
        return await this.categoriesService.getCategory(category_id);
    }

    @Post('/create')
    @HttpCode(HttpStatus.CREATED)
    async createCategory(@Body() addCategoryDto: AddCategoryDto) {
        return await this.categoriesService.addCategory(addCategoryDto);
    }

    @Put('/update/:category_id')
    @HttpCode(HttpStatus.OK)
    async updateCategory(@Param('category_id') category_id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
        return await this.categoriesService.updateCategory(category_id, updateCategoryDto);
    }

    @Delete('/delete')
    @HttpCode(HttpStatus.OK)
    async deleteCategory(@Body() deleteCategoryDto: any) {
        return await this.categoriesService.deleteCategory(deleteCategoryDto);
    }
}
