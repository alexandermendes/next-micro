import path from 'path';
import { spawn, ChildProcess, Serializable } from 'child_process';
import { Logger, createLogger, createLogStream, logger } from '../logger';
import { ServiceConfig } from '../config';
import { Package } from '../package';

export class Service {
  // TODO: Simplify args and just use config.
  private name: string | undefined;
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
  private nextConfig: Record<string, unknown> | null;
  private pkg: Package | null;

  constructor(
    serviceConfig: ServiceConfig,
    nextConfig: Record<string, unknown> | null,
    pkg: Package | null,
  ) {
    this.name = serviceConfig.name;
    this.port = serviceConfig.port;
    this.routes = serviceConfig.routes || [];
    this.script = serviceConfig.script;
    this.rootDir = serviceConfig.rootDir;
    this.watch = serviceConfig.watch || false;
    this.ttl = serviceConfig.ttl;
    this.scriptWaitTimeout = serviceConfig.scriptWaitTimeout || 60000;
    this.env = serviceConfig.env || {};

    this.nextConfig = nextConfig;
    this.pkg = pkg;
    this.childLogger = createLogger({ tag: `service: ${this.getName()}` });
  }

  async launch(): Promise<boolean> {
    // TODO: Handle calls in quick succession - redirect
    if (this.childProcess) {
      logger.error(new Error(`Service is already running: ${this.getName()}`));

      return false;
    }

    const scriptArgs = this.getScriptArgs();

    if (!scriptArgs) {
      return false;
    }

    logger.debug(`Launching service: ${this.getName()}`);

    // TODO: Add watch mode and --watch flag
    this.childProcess = spawn('node', scriptArgs, {
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
          `Timed out while waiting for service to launch: ${this.getName()}`,
        );

        resolve(false);
      }, this.scriptWaitTimeout);

      this.childProcess?.on('message', (event: Serializable) => {
        if (event === 'ready') {
          logger.success(`Service launched: ${this.getName()}`);

          clearTimeout(scriptWaitTimer);
          resolve(true);
        }
      });
    });
  }

  close(): void {
    if (!this.childProcess) {
      logger.warn(`Service is not running: ${this.getName()}`);

      return;
    }

    logger.debug(`Shutting down service: ${this.getName()}`);

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
    return this.name || this.pkg?.name;
  }

  getRoutes(): string[] {
    return this.routes;
  }

  getVersion(): string {
    return this.pkg?.version || 'unknown';
  }

  getRootDir(): string {
    return this.rootDir;
  }

  getNextConfig(): Record<string, unknown> | null {
    return this.nextConfig;
  }

  isRunning(): boolean {
    return !!this.childProcess;
  }

  private getScriptArgs(): string[] | undefined {
    if (this.nextConfig) {
      return [
        path.join(__dirname, 'next-worker.js'),
        '--dir',
        this.getRootDir(),
        '--port',
        String(this.getPort()),
      ];
    }

    if (!this.script) {
      logger.error(
        new Error(
          `Service has no startup script and is not a Next.js service: ${this.getName()}`,
        ),
      );

      return;
    }

    const finalScript = path.isAbsolute(this.script)
      ? this.script
      : path.join(this.rootDir, this.script);

    return [finalScript];
  }
}
