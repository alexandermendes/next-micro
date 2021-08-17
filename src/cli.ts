import { program } from 'commander';
import { Command, dev } from './commands';
import { logger } from './logger';

/**
 * Wrap async commands and ensure we exit the CLI with a non-zero exit code.
 */
const wrapAsync = (cmd: Command) => async () => {
  try {
    await cmd();
  } catch (err) {
    // eslint-disable-next-line no-console
    logger.error(err);

    process.exit(1);
  }
};

/**
 * Run the CLI.
 */
export const cli = (): void => {
  program
    .command('dev')
    .description('launch the local dev server')
    .action(wrapAsync(dev));

  program.parseAsync(process.argv);
};
