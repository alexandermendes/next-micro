import { ServiceConfig } from '../services/service';

export type MicroproxyConfig = {
  port: number;
  services: ServiceConfig[];
};
