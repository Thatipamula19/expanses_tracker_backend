import { ActiveUser } from '@/auth/decorators/active-user.decorator';
import { Body, Controller, Get, HttpCode, HttpStatus, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserProfileDto } from './dtos/update-user.dto';

@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {

    constructor(private readonly usersService: UsersService) { }

    @Get('profile')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get user profile' })
    async getUserProfile(@ActiveUser('sub') user_id: string) {
        return await this.usersService.getUserProfile(user_id);
    }

    @Put('update-profile')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update user profile' })
    async updateUserProfile(@ActiveUser('sub') user_id: string, @Body() updateUserProfileDto: UpdateUserProfileDto) {
        return await this.usersService.updateUserProfile(user_id, updateUserProfileDto);
    }
}
