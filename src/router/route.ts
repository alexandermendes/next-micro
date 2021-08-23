import { Service } from '../services';

export type Route = {
  readonly pattern: string | RegExp;
  readonly service: Service;
};

export const createRoute = (
  pattern: string | RegExp,
  service: Service,
): Route => ({
  pattern,
  service,
});
