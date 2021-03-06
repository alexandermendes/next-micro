import { mocked } from 'ts-jest/utils';
import { cosmiconfig } from 'cosmiconfig';
import appRoot from 'app-root-path';
import { loadConfig } from '../../../src/config';
import { validate } from '../../../src/config/validation';

jest.mock('cosmiconfig');
jest.mock('../../../src/config/validation');

const cosmiconfigMock = mocked(cosmiconfig);

const getCosmiconfigExplorerMock = () => ({
  load: jest.fn(),
  search: jest.fn(),
  clearLoadCache: jest.fn(),
  clearSearchCache: jest.fn(),
  clearCaches: jest.fn(),
});

describe('Config: Load', () => {
  it('loads the config from file with any expected defaults', async () => {
    const explorerMock = getCosmiconfigExplorerMock();
    const config = {
      services: [
        {
          name: 'my-service',
        },
      ],
    };

    cosmiconfigMock.mockReturnValue(explorerMock);
    explorerMock.search.mockResolvedValue({ config });

    await loadConfig();

    expect(cosmiconfig).toHaveBeenCalledTimes(1);
    expect(cosmiconfig).toHaveBeenCalledWith('nextmicro', {
      stopDir: appRoot.path,
    });

    expect(explorerMock.search).toHaveBeenCalledTimes(1);
    expect(explorerMock.search).toHaveBeenCalledWith(appRoot.path);
    expect(await loadConfig()).toEqual({
      port: 3000,
      autostart: true,
      autoload: true,
      services: [{ name: 'my-service' }],
      ignore: ['/node_modules/'],
    });
  });

  it('validates the config', async () => {
    const explorerMock = getCosmiconfigExplorerMock();
    const config = {
      port: 1000,
      services: [
        {
          name: 'my-service',
        },
      ],
    };

    cosmiconfigMock.mockReturnValue(explorerMock);
    explorerMock.search.mockResolvedValue({ config });

    await loadConfig();

    expect(validate).toHaveBeenCalledTimes(1);
    expect(validate).toHaveBeenCalledWith({
      port: 1000,
      services: [
        {
          name: 'my-service',
        },
      ],
    });
  });
});
