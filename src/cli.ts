import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { Command, dev } from './commands';
import { DevArgs } from './commands/dev';
import { logger } from './logger';

/**
 * Wrap async commands and ensure we exit the CLI with a non-zero exit code.
 */
const wrapAsync = (cmd: Command) => async (args: DevArgs) => {
  try {
    await cmd(args);
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
  yargs(hideBin(process.argv))
    .command(
      'dev [names...]',
      'launch the local dev server',
      (yargs: yargs.Argv) => {
        return yargs.positional('names', {
          describe: 'a list of service names',
          default: [],
        });
      },
      wrapAsync(dev),
    )
    .option('env', {
      type: 'string',
      description: 'an environment name (see the env_* config setting)',
    })
    .strictCommands()
    .demandCommand(1).argv;
};
