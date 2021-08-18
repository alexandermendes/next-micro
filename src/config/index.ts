import { ServiceConfig } from '../services/service';

export type MicroproxyConfig = {
  port?: number;
  autostart?: boolean;
  services: ServiceConfig[];
};

export type ConcreteMicroproxyConfig = {
  port: number;
  autostart: boolean;
  services: ServiceConfig[];
};
