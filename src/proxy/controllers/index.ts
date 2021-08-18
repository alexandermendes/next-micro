import { Router } from '../../router';
import HttpProxy from 'http-proxy';

export type ControllerContext = {
  router: Router;
  proxy: HttpProxy;
  devMode: boolean;
};

export { getMainRequestHandler } from './main';
export { getProxyResHandler } from './proxy-res';
export { getProxyErrorHandler } from './proxy-error';
