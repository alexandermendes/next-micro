import Joi from 'joi';
import { dir, uniqueRootPort, script } from './validators';

const serviceSchema = Joi.object()
  .keys({
    rootDir: Joi.string().required().custom(dir),
    name: Joi.string(),
    port: Joi.number().positive(),
    version: Joi.string(),
    routes: Joi.array().items(Joi.string()),
    script: Joi.string(),
    ttl: Joi.number().positive(),
    env: Joi.object(),
  })
  .custom(script);

/**
 * Get the Joi schema.
 *
 * See https://joi.dev
 */
export const getSchema = (): Joi.ObjectSchema =>
  Joi.object({
    port: Joi.number().positive(),
    autoload: Joi.boolean(),
    autostart: Joi.boolean(),
    services: Joi.array().items(serviceSchema),
    ignore: Joi.array().items(Joi.string()),
  }).custom(uniqueRootPort);
