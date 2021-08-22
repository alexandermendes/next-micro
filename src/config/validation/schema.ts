import Joi from 'joi';
import { file, dir, uniqueRootPort } from './validators';

const serviceSchema = Joi.object().keys({
  rootDir: Joi.string().required().custom(dir),
  name: Joi.string(),
  port: Joi.number().positive(),
  routes: Joi.array().items(Joi.string()),
  script: Joi.string().custom(file),
  ttl: Joi.number().positive(),
  env: Joi.object(),
});

export const getSchema = (): Joi.ObjectSchema =>
  Joi.object({
    port: Joi.number().positive(),
    autoload: Joi.boolean(),
    autostart: Joi.boolean(),
    services: Joi.array().items(serviceSchema).unique('port').unique('name'),
  }).custom(uniqueRootPort);
