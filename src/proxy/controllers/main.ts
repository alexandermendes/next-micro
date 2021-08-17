import { IncomingMessage, ServerResponse } from 'http';
import { Controller, ControllerContext } from './index';
import { abort } from '../abort';

export const getMainRequestHandler =
  (ctx: ControllerContext): Controller =>
  (req: IncomingMessage, res: ServerResponse): void => {
    const { router, proxy } = ctx;
    const service = router.getServiceFromRequest(req);

    if (!service) {
      abort(404, res);

      return;
    }

    proxy.web(req, res, {
      target: `http://127.0.0.1:${service.port}`,
      autoRewrite: true,
    });
  };
