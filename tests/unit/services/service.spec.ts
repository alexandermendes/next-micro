import { Service, ServiceConfig } from '../../../src/services/service';

describe('Services: Service', () => {
  it('sets a service to running', () => {
    const serviceConfig = { name: 'service-one' } as ServiceConfig;
    const service = new Service(serviceConfig);

    expect(service.isRunning()).toBe(false);

    service.setRunning(true);

    expect(service.isRunning()).toBe(true);
  });
});
