import { spawn, ChildProcess, Serializable } from 'child_process';
import { Logger, createLogger, createLogStream, logger } from '../logger';

export interface ServiceConfig {
  name: string;
  port: number;
  routes: string[];
  script?: string;
  scriptWaitTimeout: number;
  watch?: boolean;
  ttl?: number;
}

export class Service implements ServiceConfig {
  readonly name: string;
  readonly port: number;
  readonly routes: string[];
  readonly script: string | undefined;
  readonly scriptWaitTimeout: number;
  readonly watch: boolean;
  readonly ttl: number | undefined;

  private childLogger: Logger;
  private childProcess: ChildProcess | undefined;
  private ttlTimer: NodeJS.Timeout | undefined;

  constructor(serviceConfig: ServiceConfig) {
    this.name = serviceConfig.name;
    this.port = serviceConfig.port;
    this.routes = serviceConfig.routes;
    this.script = serviceConfig.script;
    this.watch = serviceConfig.watch || false;
    this.ttl = serviceConfig.ttl;
    this.scriptWaitTimeout = serviceConfig.scriptWaitTimeout || 60000;

    this.childLogger = createLogger({ tag: `service: ${this.name}` });
  }

  async launch(): Promise<boolean> {
    // TODO: Handle calls in quick succession - redirect
    if (this.childProcess) {
      logger.error(new Error(`Service is already running: ${this.name}`));

      return false;
    }

    // TODO: decide what to do when no script
    // TODO: Watch in dev mode, or with watch option.
    if (!this.script) {
      logger.error(new Error(`Service has no startup script: ${this.name}`));

      return false;
    }

    logger.debug(`Launching service: ${this.name}`);

    // TODO: Add watch mode and --watch flag
    this.childProcess = spawn('node', [this.script], {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
      // cwd: serviceConfig.dir, // TODO: Add root dir option to config
      env: {
        // TODO: Pass through other arbritary env vars
        ...process.env,
        PORT: String(this.port),
      },
    });

    this.childProcess.stdout?.pipe(createLogStream(this.childLogger.log));
    this.childProcess.stderr?.pipe(createLogStream(this.childLogger.error));

    return await new Promise((resolve) => {
      const scriptWaitTimer = setTimeout(() => {
        logger.debug(
          `Timed out while waiting for service to launch: ${this.name}`,
        );

        resolve(false);
      }, this.scriptWaitTimeout);

      this.childProcess?.on('message', (event: Serializable) => {
        if (event === 'ready') {
          logger.success(`Service launched: ${this.name}`);

          clearTimeout(scriptWaitTimer);
          resolve(true);
        }
      });
    });
  }

  close(): void {
    if (!this.childProcess) {
      logger.warn(`Service is not running: ${this.name}`);

      return;
    }

    logger.debug(`Shutting down service: ${this.name}`);

    this.childProcess.kill();
    this.childProcess = undefined;
  }

  refreshTTL(): void {
    if (!this.ttl) {
      return;
    }

    if (this.ttlTimer) {
      clearTimeout(this.ttlTimer);
    }

    this.ttlTimer = setTimeout(() => {
      this.close();
    }, this.ttl);
  }
}
