import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { LoginDto } from './dtos/login.dto';
import { AuthService } from './auth.service';
import { CreateUserDto } from '@/users/dtos/create-user.dto';
import { AllowAnonymous } from './decorators/allow-anonaymous.decorator';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { ForgetPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ActiveUser } from './decorators/active-user.decorator';
import { ChangePasswordDto } from './dtos/change-password.dto';
@ApiBearerAuth('access-token')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @AllowAnonymous()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto.email, loginDto.password);
  }

  @AllowAnonymous()
  @HttpCode(201)
  @Post('create')
  @ApiOperation({ summary: 'Create user' })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.authService.createUser(createUserDto);
  }

  @AllowAnonymous()
  @HttpCode(HttpStatus.OK)
  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh token' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return await this.authService.refreshToken(refreshTokenDto);
  }

  @AllowAnonymous()
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  @ApiOperation({ summary: 'Forgot password' })
  async forgotPassword(@Body() forgetPasswordDto: ForgetPasswordDto) {
    return await this.authService.forgotPassword(forgetPasswordDto);
  }

  @AllowAnonymous()
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(resetPasswordDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('change-password')
  @ApiOperation({ summary: 'Change password' })
  async changePassword(
    @ActiveUser('sub') user_id: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return await this.authService.changePassword(user_id, changePasswordDto);
  }
}
