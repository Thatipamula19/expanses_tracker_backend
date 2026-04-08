import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { AddCategoryDto } from './dtos/add-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async getCategories() {
    try {
      const categories = await this.categoryRepository.find();
      return {
        message: 'Categories fetched successfully',
        categories : categories?.map((category) => {
          return {
            id: category.id,
            name: category.name,
            icon: category.icon,
          }
        }),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message ?? 'Failed to get categories',
      );
    }
  }

  async getCategory(categoryId: string) {
    try {
      const category = await this.categoryRepository.findOne({
        where: { id: categoryId },
      });
      if (!category) {
        throw new InternalServerErrorException(
          `Category with id ${categoryId} not found`,
        );
      }
      return {
        message: 'Category fetched successfully',
        category,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message ?? 'Failed to get category',
      );
    }
  }

  async addCategory(addCategoryDto: AddCategoryDto) {
    try {
      const newCategory = await this.categoryRepository.save(addCategoryDto);
      return {
        message: 'Category added successfully',
        category: newCategory,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message ?? 'Failed to add category',
      );
    }
  }

  async updateCategory(
    categoryId: string,
    updateCategoryDto: UpdateCategoryDto,
  ) {
    try {
      const updatedCategory = await this.categoryRepository.update(
        categoryId,
        updateCategoryDto,
      );
      return {
        message: 'Category updated successfully',
        category: updatedCategory,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message ?? 'Failed to update category',
      );
    }
  }

  async deleteCategory(categoryId: string) {
    try {
      await this.categoryRepository.delete(categoryId);
      return {
        message: 'Category deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message ?? 'Failed to delete category',
      );
    }
  }
}
