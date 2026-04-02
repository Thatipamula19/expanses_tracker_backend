import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HashingProvider } from './provider/hashing.provider';
import { BcryptProvider } from './provider/bcrypt.provider';
import { UsersModule } from '@/users/users.module';
import authConfig from './config/auth.config';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [AuthController],
    providers: [AuthService, {
    provide: HashingProvider,
    useClass: BcryptProvider
  }, BcryptProvider],
  exports: [AuthService, HashingProvider],
  imports: [forwardRef(()=> UsersModule), 
    ConfigModule.forFeature(authConfig),
  JwtModule.registerAsync(authConfig.asProvider())]
})
export class AuthModule {}
