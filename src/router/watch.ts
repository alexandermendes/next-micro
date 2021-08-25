import glob from 'glob';
import chokidar from 'chokidar';
import { Service } from '../services';

type WatchNextRoutesCallback = {
  (): Promise<void>;
};

/**
 * Get the Next.js pages dirs for each service.
 */
const getPageDirs = (services: Service[]): Promise<string[]> => {
  const serviceDirs = services.map((service) => service.getRootDir());

  return Promise.all(
    serviceDirs.map(async (cwd) => {
      const [pagesDir] = glob.sync('{src/,}pages/', { cwd });

      return pagesDir;
    }),
  );
};

/**
 * Watch for potential route changes.
 */
export const watchNextRoutes = async (
  services: Service[],
  callback: WatchNextRoutesCallback,
): Promise<void> => {
  const pagesDirs = await getPageDirs(services);

  chokidar
    .watch(
      pagesDirs.filter((x) => x),
      {
        ignoreInitial: true,
        ignored: /(^|[/\\])\../, // ignore dotfiles
      },
    )
    .on('all', callback);
};
