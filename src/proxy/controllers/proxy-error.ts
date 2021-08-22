import { IncomingMessage, ServerResponse } from 'http';
import { ControllerContext } from './index';
import { abort } from '../abort';

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

    if (!shouldRunScript) {
      abort(404, res);

      return;
    }

    const launched = await service.launch();

    if (!launched) {
      abort(404, res);

      return;
    }

    service.refreshTTL();
    proxy.web(req, res, {
      target: `http://127.0.0.1:${service.getPort()}`,
      autoRewrite: true,
    });
  };
