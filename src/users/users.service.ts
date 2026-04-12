import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from '@/common/pagination/dto/pagination-query.dto';
import { PaginationProvider } from '@/common/pagination/pagination.provider';
import { CreateUserDto } from './dtos/create-user.dto';
import { userAlreadyExitsException } from '@/common/CoustomException/user-already-exits.exception';
import { HashingProvider } from '@/auth/provider/hashing.provider';
import { UpdateUserProfileDto } from './dtos/update-user.dto';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly paginateService: PaginationProvider,

    @Inject(forwardRef(() => HashingProvider))
    private readonly hashProvider: HashingProvider,
  ) { }

  public async getAllUsers(pageQueryDto: PaginationQueryDto) {
    try {
      return await this.paginateService.paginateQuery(
        pageQueryDto,
        this.userRepository,
      );
    } catch (error) {
      if ((error.code = 'ECONNREFUSED')) {
        throw new RequestTimeoutException(
          'An error has occurred, please try again later',
          {
            description: 'Could not connect to database',
          },
        );
      }
    }
  }

  public async getUserProfile(user_id: string) {
    try {
      return await this.userRepository.findOne({
        where: { id: user_id },
        select: ['id', 'email', 'role', 'user_name', 'avatar_url', 'preferred_currency', 'language', 'monthly_start_date', 'notify_budget_alerts', 'notify_goal_reminders', 'notify_weekly_summary'],
      });
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new RequestTimeoutException(
          'An error has occurred, please try again later',
          {
            description: 'Could not connect to database',
          },
        );
      }
    }
  }

  public async createUser(userDto: CreateUserDto) {
    try {
      const isExistingWithUserName = await this.userRepository.findOne({
        where: { user_name: userDto.user_name },
      });

      if (isExistingWithUserName) {
        throw new userAlreadyExitsException('user_name', userDto.user_name);
      }

      const isExistingWithEmail = await this.userRepository.findOne({
        where: { email: userDto?.email || '' },
      });

      if (isExistingWithEmail) {
        throw new userAlreadyExitsException('email', userDto.email);
      }

      // Create user Object
      let user = this.userRepository.create({
        ...userDto,
        password: await this.hashProvider.hashPassword(userDto.password),
      });

      const newUser = await this.userRepository.save(user);

      return newUser;
    } catch (error) {
      console.log('error', error);
      if (error.code === 'ECONNREFUSED') {
        throw new RequestTimeoutException(
          'An error has occurred, please try again later',
          {
            description: 'Could not connect to database',
          },
        );
      }

      throw error;
    }
  }

  public async updateUserProfile(user_id: string, updateUserProfileDto: UpdateUserProfileDto) {
    try {

      const user = await this.userRepository.findOne({ where: { id: user_id } });

      if (!user) {
        throw new NotFoundException(`User with id ${user_id} not found`);
      }
      const updatedUser = await this.userRepository.update(user_id, updateUserProfileDto);
      return {
        user_id: user.id,
        user_name: user.user_name,
        email: user.email,
        role: user.role,
        message: 'User updated successfully',
      };
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new RequestTimeoutException(
          'An error has occurred, please try again later',
          {
            description: 'Could not connect to database',
          },
        );
      }
    }
  }

  public async findOneByEmail(email: string): Promise<User | undefined> {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
        select: ['id', 'email', 'password', 'role', 'user_name'],
      });
      if (!user) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: `User with email ${email} not found`,
            table: 'users',
            code: 'USER_NOT_FOUND',
          },
          HttpStatus.NOT_FOUND,
          {
            description: `User with email ${email} not found`,
          },
        );
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  public async findOneById(id: string): Promise<User | undefined> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
      });
      if (!user) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: `User with id ${id} not found`,
            table: 'users',
            code: 'USER_NOT_FOUND',
          },
          HttpStatus.NOT_FOUND,
          {
            description: `User with id ${id} not found`,
          },
        );
      }
      return user;
    } catch (error) {
      throw error;
    }
  }
}
