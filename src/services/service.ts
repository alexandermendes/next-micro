export interface ServiceConfig {
  name: string;
  port: number;
  routes: string[];
  start?: string;
  watch?: boolean;
  ttl?: number;
}

export class Service implements ServiceConfig {
  readonly name: string;
  readonly port: number;
  readonly routes: string[];
  readonly start: string | undefined;
  readonly watch: boolean;
  readonly ttl: number | undefined;

  private running: boolean;

  constructor(serviceConfig: ServiceConfig) {
    this.name = serviceConfig.name;
    this.port = serviceConfig.port;
    this.routes = serviceConfig.routes;
    this.start = serviceConfig.start;
    this.watch = serviceConfig.watch || false;
    this.ttl = serviceConfig.ttl;

    this.running = false;
  }

  isRunning(): boolean {
    return this.running;
  }

  setRunning(value: boolean): void {
    this.running = value;
  }
}
