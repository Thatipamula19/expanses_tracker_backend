import { forwardRef, Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { JwtModule } from '@nestjs/jwt';
import authConfig from '@/auth/config/auth.config';
import { AuthModule } from '@/auth/auth.module';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
  imports: [
    TypeOrmModule.forFeature([Category]),
    forwardRef(() => AuthModule),
    JwtModule.registerAsync(authConfig.asProvider()),
  ],
})
export class CategoriesModule {}
