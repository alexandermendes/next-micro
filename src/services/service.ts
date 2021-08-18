import { spawn, ChildProcess, StdioOptions, Serializable } from 'child_process';
import { Logger, createLogger, createLogStream, logger } from '../logger';

export interface ServiceConfig {
  name: string;
  port: number;
  routes: string[];
  script?: string;
  watch?: boolean;
  ttl?: number;
}

export class Service implements ServiceConfig {
  readonly name: string;
  readonly port: number;
  readonly routes: string[];
  readonly script: string | undefined;
  readonly watch: boolean;
  readonly ttl: number | undefined;

  private childLogger: Logger;
  private childProcess: ChildProcess | undefined;

  constructor(serviceConfig: ServiceConfig) {
    this.name = serviceConfig.name;
    this.port = serviceConfig.port;
    this.routes = serviceConfig.routes;
    this.script = serviceConfig.script;
    this.watch = serviceConfig.watch || false;
    this.ttl = serviceConfig.ttl;

    this.childLogger = createLogger({ tag: `service: ${this.name}` });
  }

  async launch(): Promise<void> {
    // TODO: Handle calls in quick succession - redirect
    if (this.childProcess) {
      logger.error(new Error(`Service is already running: ${this.name}`));

      return;
    }

    // TODO: decide what to do when no script
    // TODO: Watch in dev mode, or with watch option.
    if (!this.script) {
      logger.error(new Error(`Service has no startup script: ${this.name}`));

      return;
    }

    logger.info(`Launching service: ${this.name}`);

    // The ipc option is important so that `process.send` will be available in
    // the child process (nodemon) so it can communicate back with parent
    // process (through `.on()`, `.send()`)
    // https://nodejs.org/api/child_process.html#child_process_options_stdio
    const stdio: StdioOptions = ['pipe', 'pipe', 'pipe', 'ipc'];

    // TODO: Add watch mode and --watch flag
    this.childProcess = spawn('node', [this.script], {
      stdio,
      // cwd: serviceConfig.dir, // TODO: Add root dir option to config
      env: {
        // TODO: Pass through other arbritary env vars
        ...process.env,
        PORT: String(this.port),
      },
    });

    this.childProcess.stdout?.pipe(createLogStream(this.childLogger.log));
    this.childProcess.stderr?.pipe(createLogStream(this.childLogger.error));

    return new Promise((resolve) => {
      this.childProcess?.on('message', (event: Serializable) => {
        if (event === 'ready') {
          logger.success(`Service launched: ${this.name}`);

          resolve();
        }
      });
    });
  }

  // async close(): Promise<void> {
  //   if (!this.childProcess) {
  //     logger.warn(`Process is not running: ${this.name}`);

  //     return;
  //   }

  //   const promise: Promise<void> = new Promise((resolve) => {
  //     this.childProcess?.on('exit', resolve);
  //   });

  //   this.childProcess.send('quit');

  //   return promise;
  // }
}
