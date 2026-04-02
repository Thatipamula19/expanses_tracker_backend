import { registerAs } from "@nestjs/config";

export default registerAs('auth', () => ({
    secret : process.env.JWT_SECRETE_KEY,
    expiresIn: parseInt(process.env.JWT_TOKEN_EXPIRES ?? '3600'),
    refreshTokenExpiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRES ?? '3600'),
    audience: process.env.JWT_TOKEN_AUDIENCE,
    issuer: process.env.JWT_TOKEN_ISSUER
}))