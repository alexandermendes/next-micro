import { IncomingMessage, Server, ServerResponse } from 'http';
import { ControllerContext } from './index';
import { abort } from '../abort';
import { logger } from '../../logger';

export const getProxyErrorHandler =
  (ctx: ControllerContext) =>
  async (
    err: NodeJS.ErrnoException,
    req: IncomingMessage,
    res: ServerResponse,
  ): Promise<void> => {
    const { router, proxy, autostart, devMode } = ctx;
    const service = router.getServiceFromRequest(req);

    if (!service) {
      abort(404, res);

      return;
    }

    const shouldRunScript = autostart && devMode && err.code === 'ECONNREFUSED';
    const canRunScript = shouldRunScript && service.script;

    if (shouldRunScript && !canRunScript) {
      logger.warn(
        `Service is not running and cannot be started automatically as no script was defined: ${service.name}`,
      );
    }

    if (canRunScript) {
      const launched = await service.launch();

      if (launched) {
        service.refreshTTL();

        proxy.web(req, res, {
          target: `http://127.0.0.1:${service.port}`,
          autoRewrite: true,
        });

        return;
      }
    }

    // TODO: Handle possible scenarios:
    // - Service was launched but not waited for
    // - We could not connect to the service but not because of ECONNREFUSED
    res.writeHead(400);
    res.end(`Should be served by ${service.name}`);
  };
