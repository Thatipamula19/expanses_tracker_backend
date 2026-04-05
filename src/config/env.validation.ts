import Joi from 'joi';
export default Joi.object({
    NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
    DB_PORT: Joi.number().port().default(5432),
    DB_HOST: Joi.string().required(),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_NAME: Joi.string().required(),
    DB_SSL: Joi.boolean().default(false),
    JWT_SECRETE_KEY: Joi.string().required(),
    JWT_TOKEN_EXPIRES: Joi.number().required(),
    REFRESH_TOKEN_EXPIRES: Joi.number().required(),
    JWT_TOKEN_AUDIENCE: Joi.string().required(),
    JWT_TOKEN_ISSUER: Joi.string().required()
})