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
    const { router, proxy } = ctx;
    const service = router.getServiceFromRequest(req);

    if (!service) {
      abort(404, res);

      return;
    }

    if (err.code === 'ECONNREFUSED') {
      await service.launch();

      proxy.web(req, res, {
        target: `http://127.0.0.1:${service.port}`,
        autoRewrite: true,
      });

      return;
    }

    // TODO: Handle possible scenarios:
    // - Service was launched but not waited for
    // - We could not connect to the service but not because of ECONNREFUSED
    res.writeHead(400);
    res.end(`Should be served by ${service.name}`);
  };
