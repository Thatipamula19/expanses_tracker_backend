// src/mail/mail.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
    private resend = new Resend(process.env.RESEND_API_KEY);

    async sendPasswordResetMail(
        toEmail: string,
        userName: string,
        resetLink: string,
    ): Promise<void> {
        if (!process.env.MAIL_FROM) {
            throw new InternalServerErrorException('MAIL_FROM environment variable is not set');
        }
        const { error } = await this.resend.emails.send({   
            from: process.env.MAIL_FROM,
            to: toEmail,
            subject: 'Reset your password',
            html: `
                <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
                    <h2>Password Reset Request</h2>
                    <p>Hi ${userName ?? 'there'},</p>
                    <p>We received a request to reset your password. Click the button below to set a new one.</p>
                    <p style="margin: 28px 0;">
                        <a href="${resetLink}"
                            style="background:#4F46E5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">
                            Reset Password
                        </a>
                    </p>
                    <p style="color:#888;font-size:13px;">
                        This link expires in <strong>15 minutes</strong>.<br/>
                        If you didn't request a password reset, you can safely ignore this email.
                    </p>
                </div>
            `,
        });

        if (error) {
            throw new InternalServerErrorException(
                error.message ?? 'Failed to send reset email.',
            );
        }
    }

    async sendPasswordResetSuccessMail(
        toEmail: string,
        userName: string,
    ): Promise<void> {
        if (!process.env.MAIL_FROM) {
            throw new InternalServerErrorException('MAIL_FROM environment variable is not set');
        }
        const { error } = await this.resend.emails.send({
            from: process.env.MAIL_FROM,
            to: toEmail,
            subject: 'Your password has been reset',
            html: `
                <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
                    <h2>Password Reset Successful</h2>
                    <p>Hi ${userName ?? 'there'},</p>
                    <p>Your password has been successfully updated.</p>
                    <p style="color:#888;font-size:13px;">
                        If you did not make this change, please contact support immediately.
                    </p>
                </div>
            `,
        });

        if (error) {
            throw new InternalServerErrorException(
                error.message ?? 'Failed to send confirmation email.',
            );
        }
    }
}