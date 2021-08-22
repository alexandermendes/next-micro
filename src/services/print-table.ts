import { Table } from 'console-table-printer';
import { Service } from './service';

/**
 * Print a table containing metadata about the managed services.
 */
export const printServicesTable = (services: Service[]): void => {
  const table = new Table({
    columns: [
      { name: 'name', alignment: 'left' },
      { name: 'port', alignment: 'center' },
      { name: 'version', alignment: 'center' },
      { name: 'watching', alignment: 'center' },
    ],
  });

  table.addRows(
    services.map((service) => ({
      name: service.getName(),
      port: service.getPort(),
      version: service.getVersion(),
      // pid: service.getPid(),
      // status: service.getStatus(),
      // watching: service.watch,
    })),
  );

  table.printTable();
};
