import { IncomingMessage } from 'http';
import { ControllerContext } from './index';

export const getProxyResHandler =
  (ctx: ControllerContext) =>
  async (proxyRes: IncomingMessage, req: IncomingMessage): Promise<void> => {
    const { router } = ctx;
    const service = router.getServiceFromRequest(req);

    if (!service) {
      return;
    }

    // Assign headers to help us identify the backend service for debugging.
    Object.assign(proxyRes.headers, {
      'x-service-name': service.name,
      'x-service-port': service.getPort(),
    });
  };
