import { IncomingMessage, ServerResponse } from 'http';
import { Router } from '../../router';
import HttpProxy from 'http-proxy';

export type ControllerContext = {
  router: Router;
  proxy: HttpProxy;
  devMode: boolean;
};

export type Controller = {
  (req: IncomingMessage, res: ServerResponse): unknown;
};

export { getMainRequestHandler } from './main';
export { getProxyResHandler } from './proxy-res';
