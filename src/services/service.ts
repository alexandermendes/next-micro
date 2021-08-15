export interface ServiceConfig {
  [index: string]: unknown;
  name: string;
  port: number;
  routes: string[];
  script: string;
  watch?: boolean;
  ttl?: number;
}

export class Service implements ServiceConfig {
  [index: string]: unknown;
  readonly name: string;
  readonly port: number;
  readonly routes: string[];
  readonly script: string;
  readonly watch: boolean;
  readonly ttl: number | undefined;

  private running: boolean;

  constructor(serviceConfig: ServiceConfig) {
    this.name = serviceConfig.name;
    this.port = serviceConfig.port;
    this.routes = serviceConfig.routes;
    this.script = serviceConfig.script;
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
