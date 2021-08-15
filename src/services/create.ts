import { Service, ServiceConfig } from './service';

export const createServices = (serviceConfigs: ServiceConfig[]): Service[] =>
  serviceConfigs.map((serviceConfig) => new Service(serviceConfig));
