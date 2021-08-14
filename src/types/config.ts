export type ServiceConfig = {
  [index:string]: unknown;
  name: string;
  location?: string;
  port: number;
  routes: string[];
  script: string;
  watch?: boolean | true;
  ttl?: number;
};

export type MicroproxyConfig = {
  services: ServiceConfig[];
};
