import { Table } from 'console-table-printer';
import { Service } from './service';

/**
 * Print a table containing metadata about the managed services.
 */
export const printServicesTable = (services: Service[]): void => {
  const table = new Table({
    columns: [
      { name: 'name', alignment: 'left' },
      { name: 'port', alignment: 'left' },
      { name: 'watching', alignment: 'left' },
    ],
  });

  table.addRows(
    services.map((service) => ({
      // id: service.id,
      name: service.name,
      port: service.getPort(),
      // version: service.version,
      // pid: service.getPid(),
      // status: service.getStatus(),
      watching: service.watch,
    })),
  );

  table.printTable();
};

