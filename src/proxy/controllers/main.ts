import { IncomingMessage, ServerResponse } from 'http';
import { ControllerContext } from './index';
import { abort } from '../abort';

export const getMainRequestHandler =
  (ctx: ControllerContext) =>
  (req: IncomingMessage, res: ServerResponse): void => {
    const { router, proxy } = ctx;
    const service = router.getServiceFromRequest(req);

    if (!service) {
      abort(404, res);

      return;
    }

    service.refreshTTL();

    proxy.web(req, res, {
      target: `http://127.0.0.1:${service.port}`,
      autoRewrite: true,
    });
  };
