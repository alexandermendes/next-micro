import { ServiceConfig } from '../services/service';

export interface MicroproxyConfig {
  port?: number;
  autostart?: boolean;
  services: ServiceConfig[];
}

export class Config {
  readonly port: number;
  readonly autostart: boolean;
  readonly services: ServiceConfig[];

  constructor({
    port = 3000,
    autostart = false,
    services = [],
  }: MicroproxyConfig) {
    this.port = port;
    this.autostart = autostart;
    this.services = services;
  }
}
