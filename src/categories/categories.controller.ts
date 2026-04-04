import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AddCategoryDto } from './dtos/add-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { UserRole } from '@/common/enums';
import { Roles } from '@/auth/decorators/roles.decorator';
import { ApiOperation } from '@nestjs/swagger';
@ApiBearerAuth("access-token")
@Controller('categories')
@UseGuards(RolesGuard)  // ← apply both guards at controller level
@Roles(UserRole.ADMIN) 
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all categories' })
    async getCategories() {
        return await this.categoriesService.getCategories();
    }

    @Get(':category_id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get category by id' })
    async getCategory(@Param('category_id') category_id: string) {
        return await this.categoriesService.getCategory(category_id);
    }

    @Post('/create')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create category' })
    async createCategory(@Body() addCategoryDto: AddCategoryDto) {
        return await this.categoriesService.addCategory(addCategoryDto);
    }

    @Put('/update/:category_id')
    @ApiOperation({ summary: 'Update category' })
    @HttpCode(HttpStatus.OK)
    async updateCategory(@Param('category_id') category_id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
        return await this.categoriesService.updateCategory(category_id, updateCategoryDto);
    }

    @Delete('/delete')
    @ApiOperation({ summary: 'Delete category' })
    @HttpCode(HttpStatus.OK)
    async deleteCategory(@Body() deleteCategoryDto: any) {
        return await this.categoriesService.deleteCategory(deleteCategoryDto);
    }
}
