import { forwardRef, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import authConfig from './config/auth.config';
import { HashingProvider } from './provider/hashing.provider';
import { JwtService } from '@nestjs/jwt';
import type { ConfigType } from '@nestjs/config';
import { UsersService } from '@/users/users.service';
import { User } from '@/users/entities/user.entity';
import { ActiveUserType } from './interfaces/active-user.interface';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { CreateUserDto } from '@/users/dtos/create-user.dto';

@Injectable()
export class AuthService {
    constructor(@Inject(forwardRef(() => UsersService)) private readonly userService: UsersService,
        @Inject(authConfig.KEY) private readonly authConfiguration: ConfigType<typeof authConfig>,
        private readonly hashingProvider: HashingProvider,
        private readonly jwtService: JwtService
    ) { }

    isAuthenticated: boolean = false;

    public async login(email: string, password: string) {
        const user = await this.userService.findOneByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }
        const isPasswordValid = await this.hashingProvider.comparePassword(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid password');
        }
        this.isAuthenticated = true;
        return this.generateToken(user);
    }

    public async createUser(createUserDto: CreateUserDto){
        return await this.userService.createUser(createUserDto);
    }

    public async refreshToken(refreshTokenDto: RefreshTokenDto) {
        try {
            const { sub } = await this.jwtService.verifyAsync(refreshTokenDto?.refresh_token, {
                secret: this.authConfiguration.secret,
                audience: this.authConfiguration.audience,
                issuer: this.authConfiguration.issuer
            });

            const user = await this.userService.findOneById(Number(sub));
            if (!user) {
                throw new Error('User not found');
            }


            return await this.generateToken(user);

        } catch (error) {
            throw new UnauthorizedException(error.message);

        }
    }

    private async signToken<T>(userId: number, expiresIn: number, payload?: T) {
        return await this.jwtService.signAsync({
            sub: userId,
            ...payload
        }, {
            secret: this.authConfiguration.secret,
            expiresIn: expiresIn,
            audience: this.authConfiguration.audience,
            issuer: this.authConfiguration.audience
        })
    }

    private async generateToken(user: User) {
        const accessToken = await this.signToken<Partial<ActiveUserType>>(Number(user.id), this.authConfiguration.expiresIn, { email: user.email });

        const refreshToken = await this.signToken(Number(user.id), this.authConfiguration.refreshTokenExpiresIn);

        return { token: accessToken, refreshToken: refreshToken };
    }

}
