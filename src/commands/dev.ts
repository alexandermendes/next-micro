import { launch } from '../launch';

export type DevArgs = {
  names: string[];
};

export type DevCommand = {
  (args: DevArgs): Promise<void>;
};

/**
 * Launch the dev server.
 */
export const dev: DevCommand = async (args: DevArgs): Promise<void> => {
  await launch(true, args.names);
};
