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

    // In case the service is running but the process is not being managed
    // by Next Micro.
    service.setRunning(true);

    // Assign headers to help us identify the backend service for debugging.
    Object.assign(proxyRes.headers, {
      'x-service-name': service.getName(),
      'x-service-port': service.getPort(),
    });
  };
