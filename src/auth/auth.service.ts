import { BadRequestException, forwardRef, Inject, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import authConfig from './config/auth.config';
import { HashingProvider } from './provider/hashing.provider';
import { JwtService } from '@nestjs/jwt';
import type { ConfigType } from '@nestjs/config';
import { UsersService } from '@/users/users.service';
import { User } from '@/users/entities/user.entity';
import { ActiveUserType } from './interfaces/active-user.interface';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { CreateUserDto } from '@/users/dtos/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { ForgetPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { PASSWORD_RESET } from '@/common/constants/constants';
import { MailService } from '@/mail/mail.service';
@Injectable()
export class AuthService {
    constructor(@Inject(forwardRef(() => UsersService)) private readonly userService: UsersService,
        @Inject(authConfig.KEY) private readonly authConfiguration: ConfigType<typeof authConfig>,
        private readonly hashingProvider: HashingProvider,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        @InjectRepository(PasswordResetToken)
        private readonly passwordResetTokenRepository: Repository<PasswordResetToken>
    ) { }

    isAuthenticated: boolean = false;

    public async login(email: string, password: string) {
        const user = await this.userService.findOneByEmail(email);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await this.hashingProvider.comparePassword(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.generateToken(user);
    }

    public async createUser(createUserDto: CreateUserDto) {
        return await this.userService.createUser(createUserDto);
    }

    public async refreshToken(refreshTokenDto: RefreshTokenDto) {
        try {
            const { sub } = await this.jwtService.verifyAsync(
                refreshTokenDto?.refresh_token,
                {
                    secret: this.authConfiguration.secret,
                    audience: this.authConfiguration.audience,
                    issuer: this.authConfiguration.issuer,
                },
            );

            const user = await this.userService.findOneById(Number(sub));
            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            return await this.generateToken(user);

        } catch (error) {
            throw new UnauthorizedException(error?.message ?? 'Invalid refresh token');
        }
    }


    public async forgotPassword(forgetPasswordDto: ForgetPasswordDto) {
        const { email } = forgetPasswordDto;

        const user = await this.userRepository.findOne({ where: { email } });

        if (!user) {
            throw new UnauthorizedException(`User with email ${email} not found`);
        }

        await this.passwordResetTokenRepository.update(
            { user_id: user.id, used: false },
            { used: true },
        );

        const payload = {
            sub: user.id,
            email: user.email,
            purpose: PASSWORD_RESET,
        };

        const rawToken = await this.jwtService.signAsync(payload, {
            secret: process.env.PASSWORD_RESET_SECRET,
            expiresIn: '15m',
        });

        const tokenHash = await this.hashingProvider.hashPassword(rawToken);

        await this.passwordResetTokenRepository.save({
            user_id: user.id,
            token_hash: tokenHash,
            expires_at: new Date(Date.now() + 15 * 60 * 1000),
            used: false,
        });

        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(rawToken)}`;

        await this.mailService.sendPasswordResetMail(
            user.email,
            user.user_name ?? 'there',
            resetLink,
        );

        return { message: 'If the email exists, a reset link has been sent.' };
    }


    public async resetPassword(resetPasswordDto: ResetPasswordDto) {
        const { token, password } = resetPasswordDto;

        let payload: { sub: string; email: string; purpose: string };
        try {
            payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.PASSWORD_RESET_SECRET,
            });
        } catch {
            throw new BadRequestException('Reset link is invalid or has expired.');
        }

        if (payload.purpose !== PASSWORD_RESET) {
            throw new BadRequestException('Invalid token purpose.');
        }

        const validTokens = await this.passwordResetTokenRepository.find({
            where: {
                user_id: payload.sub,
                used: false,
                expires_at: MoreThan(new Date()),
            },
            relations: ['user'],
        });

        if (!validTokens.length) {
            throw new BadRequestException('Reset link is invalid or has expired.');
        }

        let matchedToken: PasswordResetToken | null = null;

        for (const t of validTokens) {
            const isMatch = await this.hashingProvider.comparePassword(token, t.token_hash);
            if (isMatch) {
                matchedToken = t;
                break;
            }
        }

        if (!matchedToken) {
            throw new BadRequestException('Reset link is invalid or has expired.');
        }

        const user = matchedToken.user;

        if (!user) {
            throw new BadRequestException('User not found.');
        }

        await this.userRepository.update(user.id, { password: await this.hashingProvider.hashPassword(password) });

        await this.passwordResetTokenRepository.update(
            { user_id: payload.sub, used: false },
            { used: true },
        );

        await this.mailService.sendPasswordResetSuccessMail(
            user.email,
            user.user_name ?? 'there',
        );

        return { message: 'Password reset successfully.' };
    }

    private async signToken<T>(userId: string, expiresIn: number, payload?: T) {
        return await this.jwtService.signAsync(
            {
                sub: userId,
                ...payload,
            },
            {
                secret: this.authConfiguration.secret,
                expiresIn: expiresIn,
                audience: this.authConfiguration.audience,
                issuer: this.authConfiguration.issuer,
            },
        );
    }

    private async generateToken(user: User) {
        const [accessToken, refreshToken] = await Promise.all([
            this.signToken<Partial<ActiveUserType>>(
                String(user.id),
                this.authConfiguration.expiresIn,
                { email: user.email },
            ),
            this.signToken(
                String(user.id),
                this.authConfiguration.refreshTokenExpiresIn,
            ),
        ]);

        return { access_token: accessToken, refresh_token: refreshToken };
    }

}
