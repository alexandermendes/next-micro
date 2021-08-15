import { Router } from '../../router';
import HttpProxy from 'http-proxy';

export type ControllerContext = {
  router: Router;
  proxy: HttpProxy;
};

export { getMainRequestHandler } from './main';
export { getProxyResHandler } from './proxy-res';
