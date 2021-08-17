import { launch } from '../launch';

export type DevCommand = {
  (): Promise<void>;
};

/**
 * Launch the dev server.
 */
export const dev: DevCommand = async (): Promise<void> => {
  await launch(true);
};
