import path from 'path';
import { spawn, ChildProcess, Serializable } from 'child_process';
import { Logger, createLogger, createLogStream, logger } from '../logger';
import { ServiceConfig } from '../config';

export class Service {
  private name: string | undefined;
  private version: string | undefined;
  private port: number | undefined;
  private routes: string[];
  private script: string | undefined;
  private scriptWaitTimeout: number;
  private rootDir: string;
  private watch: boolean;
  private ttl: number | undefined;
  private env: Record<string, unknown>;

  private childLogger: Logger;
  private childProcess: ChildProcess | undefined;
  private ttlTimer: NodeJS.Timeout | undefined;

  constructor(serviceConfig: ServiceConfig) {
    this.name = serviceConfig.name;
    this.version = serviceConfig.version;
    this.port = serviceConfig.port;
    this.routes = serviceConfig.routes || [];
    this.script = serviceConfig.script;
    this.rootDir = serviceConfig.rootDir;
    this.watch = serviceConfig.watch || false;
    this.ttl = serviceConfig.ttl;
    this.scriptWaitTimeout = serviceConfig.scriptWaitTimeout || 60000;
    this.env = serviceConfig.env || {};

    this.childLogger = createLogger({ tag: `service: ${this.name}` });
  }

  async launch(): Promise<boolean> {
    // TODO: Handle calls in quick succession - redirect
    if (this.childProcess) {
      logger.error(new Error(`Service is already running: ${this.name}`));

      return false;
    }

    // TODO: Watch in dev mode, or with watch option.
    if (!this.script) {
      logger.error(new Error(`Service has no startup script: ${this.name}`));

      return false;
    }

    logger.debug(`Launching service: ${this.name}`);

    const scriptPath = path.isAbsolute(this.script)
      ? this.script
      : path.join(this.rootDir, this.script);

    // TODO: Add watch mode and --watch flag
    this.childProcess = spawn('node', [scriptPath], {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
      cwd: this.rootDir,
      env: {
        ...process.env,
        ...this.env,
        PORT: String(this.port), // TODO: Document or remove
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

  getPort(): number | undefined {
    return this.port;
  }

  setPort(port: number): void {
    this.port = port;
  }

  // TODO: assign default name, based on assigned id.
  getName(): string | undefined {
    return this.name;
  }

  getRoutes(): string[] {
    return this.routes;
  }

  getVersion(): string {
    return this.version || 'unknown';
  }

  getRootDir(): string {
    return this.rootDir;
  }

  hasScript(): boolean {
    return !!this.script;
  }
}
