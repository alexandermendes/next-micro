import path from 'path';
import { spawn, ChildProcess, Serializable } from 'child_process';
import { Logger, createLogger, createLogStream, logger } from '../logger';
import { ServiceConfig } from '../config';
import { Package } from '../package';

export class Service {
  private id: number;
  private serviceConfig: ServiceConfig;
  private port: number | undefined;
  private childLogger: Logger;
  private childProcess: ChildProcess | undefined;
  private ttlTimer: NodeJS.Timeout | undefined;
  private nextConfig: Record<string, unknown> | null;
  private env: string | undefined;
  private pkg: Package | null;
  private running: boolean;

  constructor(
    id: number,
    serviceConfig: ServiceConfig,
    nextConfig: Record<string, unknown> | null,
    pkg: Package | null,
    env?: string,
  ) {
    this.id = id;
    this.serviceConfig = serviceConfig;
    this.port = serviceConfig.port;
    this.nextConfig = nextConfig;
    this.pkg = pkg;
    this.env = env;
    this.childLogger = createLogger({ tag: `service: ${this.getName()}` });
    this.running = false;
  }

  async launch(): Promise<boolean> {
    const launchTimeout = this.serviceConfig.scriptWaitTimeout || 60000;

    if (this.isRunning()) {
      logger.debug(`Service is already running: ${this.getName()}`);

      return true;
    }

    // Launch may be in progress, wait.
    if (this.childProcess) {
      return new Promise((resolve) => {
        setInterval(() => {
          if (this.isRunning()) {
            resolve(true);
          }
        }, 500);

        setTimeout(() => {
          logger.debug(
            new Error(
              `Timed out waiting for service to launch: ${this.getName()}`,
            ),
          );
          resolve(false);
        }, launchTimeout);
      });
    }

    const scriptArgs = this.getScriptArgs();

    if (!scriptArgs) {
      return false;
    }

    logger.debug(`Launching service: ${this.getName()}`);

    // TODO: Add watch mode for non Next.js services.
    this.childProcess = spawn('node', scriptArgs, {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
      cwd: this.serviceConfig.rootDir,
      env: this.getEnvVars(),
    });

    this.childProcess.stdout?.pipe(createLogStream(this.childLogger.log));
    this.childProcess.stderr?.pipe(createLogStream(this.childLogger.error));

    return await new Promise((resolve) => {
      const scriptWaitTimer = setTimeout(() => {
        logger.debug(
          `Timed out while waiting for service to launch: ${this.getName()}`,
        );

        resolve(false);
      }, launchTimeout);

      this.childProcess?.on('message', (event: Serializable) => {
        if (event === 'ready') {
          logger.success(`Service launched: ${this.getName()}`);

          this.running = true;
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
    this.running = false;
  }

  refreshTTL(): void {
    if (!this.serviceConfig.ttl) {
      return;
    }

    if (this.ttlTimer) {
      clearTimeout(this.ttlTimer);
    }

    this.ttlTimer = setTimeout(() => {
      this.close();
    }, this.serviceConfig.ttl);
  }

  getPort(): number | undefined {
    return this.port;
  }

  setPort(port: number): void {
    this.port = port;
  }

  setRunning(value: boolean): void {
    this.running = value;
  }

  getName(): string {
    return this.serviceConfig.name || this.pkg?.name || `service ${this.id}`;
  }

  getRoutes(): string[] {
    return this.serviceConfig.routes || [];
  }

  getVersion(): string {
    return this.pkg?.version || 'unknown';
  }

  getRootDir(): string {
    return this.serviceConfig.rootDir;
  }

  getNextConfig(): Record<string, unknown> | null {
    return this.nextConfig;
  }

  isRunning(): boolean {
    return this.running;
  }

  private getScriptArgs(): string[] | null {
    const customScript = this.getCustomScript();

    if (customScript) {
      return [customScript];
    }

    if (this.nextConfig) {
      return [
        path.join(__dirname, 'next-worker.js'),
        '--dir',
        this.getRootDir(),
        '--port',
        String(this.getPort()),
      ];
    }

    logger.error(
      new Error(
        `Service has no startup script and is not a Next.js service: ${this.getName()}`,
      ),
    );

    return null;
  }

  private getCustomScript = (): string | null => {
    if (!this.serviceConfig.script) {
      return null;
    }

    const { rootDir, script } = this.serviceConfig;

    return path.isAbsolute(script) ? script : path.join(rootDir, script);
  };

  /**
   * Get env vars to pass to the child process.
   */
  private getEnvVars(): NodeJS.ProcessEnv {
    const starEnvVarKeys = Object.keys(this.serviceConfig).filter((key) =>
      key.startsWith('env_'),
    );

    const starEnvVarKey = starEnvVarKeys.find(
      (key) => key.replace(/^env_/, '') === this.env,
    );

    const starEnvVars = starEnvVarKey ? this.serviceConfig[starEnvVarKey] : {};

    if (this.env && !starEnvVarKey) {
      logger.warn(`Unknown environment: ${this.env}`);
    }

    return {
      ...process.env,
      ...this.serviceConfig.env,
      ...(typeof starEnvVars === 'object' ? starEnvVars : {}),
      PORT: String(this.port),
    };
  }
}
