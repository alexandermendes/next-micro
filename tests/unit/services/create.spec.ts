import { createServices } from '../../../src/services/create';
import { ServiceConfig } from '../../../src/services/service';

describe('Services: Create', () => {
  it('creates the services', () => {
    const serviceConfigs = [
      { name: 'service-one' } as ServiceConfig,
      { name: 'service-two' } as ServiceConfig,
    ];

    const services = createServices(serviceConfigs);

    expect(services[0].name).toBe('service-one');
    expect(services[1].name).toBe('service-two');
  });
});
