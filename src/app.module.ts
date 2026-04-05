import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { TransactionsModule } from './transactions/transactions.module';
import { BudgetsModule } from './budgets/budgets.module';
import { GoalsModule } from './goals/goals.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
const ENV = process.env.NODE_ENV;
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import envValidation from './config/env.validation';
import { JwtModule } from '@nestjs/jwt';
import authConfig from '@/auth/config/auth.config';
import { PaginationModule } from './common/pagination/pagination.module';
import { MailModule } from './mail/mail.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthorizeGuard } from './auth/guards/authorize.guard';
import { AnalyticsModule } from './analytics/analytics.module';
@Module({
  imports: [
    UsersModule,
    CategoriesModule,
    TransactionsModule,
    BudgetsModule,
    GoalsModule,
    AuthModule,
    PaginationModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ENV ? `.env.${ENV.trim()}` : '.env',
      load: [appConfig, databaseConfig],
      validationSchema: envValidation,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isSSL = configService.get<boolean>('database.ssl');
        return {
          type: 'postgres',
          host: configService.get('database.host'),
          port: Number(configService.get('database.port')),
          username: configService.get('database.username'),
          password: String(configService.get('database.password')),
          database: configService.get('database.name'),
          autoLoadEntities: configService.get('database.autoLoadEntities'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: configService.get<boolean>('database.synchronize'), // ← use config, not hardcoded true
          ssl: isSSL ? { rejectUnauthorized: false } : false,
          extra: isSSL
            ? {
                ssl: {
                  rejectUnauthorized: false,
                },
              }
            : {},
        };
      },
    }),
    ConfigModule.forFeature(authConfig),
    JwtModule.registerAsync(authConfig.asProvider()),
    MailModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthorizeGuard,
    },
  ],
})
export class AppModule {}
