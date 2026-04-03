import { forwardRef, HttpException, HttpStatus, Inject, Injectable, RequestTimeoutException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from '@/common/pagination/dto/pagination-query.dto';
import { PaginationProvider } from '@/common/pagination/pagination.provider';
import { CreateUserDto } from './dtos/create-user.dto';
import { userAlreadyExitsException } from '@/common/CoustomException/user-already-exits.exception';
import { HashingProvider } from '@/auth/provider/hashing.provider';
@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly paginateService: PaginationProvider,

        @Inject(forwardRef(() => HashingProvider))
        private readonly hashProvider: HashingProvider
    ) { }

    public async getAllUsers(pageQueryDto: PaginationQueryDto) {
        try {
            return await this.paginateService.paginateQuery(
                pageQueryDto,
                this.userRepository,
            )
        } catch (error) {
            if (error.code = 'ECONNREFUSED') {
                throw new RequestTimeoutException('An error has occurred, please try again later', {
                    description: 'Could not connect to database'
                })
            }
        }
    }

    public async createUser(userDto: CreateUserDto) {

        try {
            const isExistingWithUserName = await this.userRepository.findOne({
                where: { user_name: userDto.user_name }
            })

            if (isExistingWithUserName) {
                throw new userAlreadyExitsException('user_name', userDto.user_name);
            }

            const isExistingWithEmail = await this.userRepository.findOne({
                where: { email: userDto?.email || '' }
            })

            if (isExistingWithEmail) {
                throw new userAlreadyExitsException('email', userDto.email);
            }

            // Create user Object
            let user = this.userRepository.create({
                ...userDto,
                password: await this.hashProvider.hashPassword(userDto.password)
            });

            const newUser = await this.userRepository.save(user);

            return {
                message: 'User created successfully',
                user_id: newUser.id,
                user_name: newUser.user_name,
                email: newUser.email,
            }

        } catch (error) {
            console.log('error', error);
            if (error.code === 'ECONNREFUSED') {
                throw new RequestTimeoutException('An error has occurred, please try again later', {
                    description: 'Could not connect to database'
                })
            }

            throw error;
        }

        // const user = await this.userRepository.findOne({
        //     where : {email: userDto.email}
        // });

        // if(user){
        //     return "user is registered already!";
        // }

        // let newUser = this.userRepository.create(userDto);
        // newUser = await this.userRepository.save(newUser);
        // return newUser;
    }

    public async findOneByEmail(email: string): Promise<User | undefined> {
        try {
            const user = await this.userRepository.findOne({ where: { email }, select: ['id', 'email', 'password'] });
            if (!user) {
                throw new HttpException({
                    status: HttpStatus.NOT_FOUND,
                    error: `User with email ${email} not found`,
                    table: 'users',
                    code: 'USER_NOT_FOUND',
                }, HttpStatus.NOT_FOUND, {
                    description: `User with email ${email} not found`,
                });
            }
            return user;
        } catch (error) {
            throw error;
        }
    }

    public async findOneById(id: number): Promise<User | undefined> {
        try {
            const user = await this.userRepository.findOne({ where: { id: String(id) } });
            if (!user) {
                throw new HttpException({
                    status: HttpStatus.NOT_FOUND,
                    error: `User with id ${String(id)} not found`,
                    table: 'users',
                    code: 'USER_NOT_FOUND',
                }, HttpStatus.NOT_FOUND, {
                    description: `User with id ${id} not found`,
                });
            }
            return user;
        } catch (error) {
            throw error;
        }
    }
}
