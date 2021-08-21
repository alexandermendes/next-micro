import Joi from 'joi';
import { file, dir, uniqueRootPort } from './validators';

const serviceSchema = Joi.object().keys({
  name: Joi.string().required(),
  port: Joi.number().positive().required(),
  routes: Joi.array().required().items(Joi.string()),
  script: Joi.string().custom(file),
  ttl: Joi.number().positive(),
  env: Joi.object(),
  rootDir: Joi.string().custom(dir),
});

export const getSchema = (): Joi.ObjectSchema =>
  Joi.object({
    port: Joi.number().positive().required(),
    autostart: Joi.boolean(),
    services: Joi.array().items(serviceSchema).unique('port').unique('name'),
  }).custom(uniqueRootPort);
