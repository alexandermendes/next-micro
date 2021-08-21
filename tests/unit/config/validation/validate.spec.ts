import Joi, { ValidationResult } from 'joi';
import { mocked } from 'ts-jest/utils';
import { MicroproxyConfig } from '../../../../src/config';
import { validate } from '../../../../src/config/validation';
import { getSchema } from '../../../../src/config/validation/schema';

jest.mock('../../../../src/config/validation/schema');

const mockGetSchema = mocked(getSchema);
const mockValidate = jest.fn();

describe('Config: Validation - Validate', () => {
  beforeEach(() => {
    mockValidate.mockReturnValue({
      error: null,
    } as unknown as ValidationResult);

    mockGetSchema.mockReturnValue(({
      validate: mockValidate
    } as unknown as Joi.ObjectSchema));
  });

  it('does not throw for a valid config', () => {
    const config = { port: 1234 } as unknown as MicroproxyConfig;

    expect(() => validate(config)).not.toThrow();
  });

  it('throws for an invalid config', () => {
    const config = { port: 1234 } as unknown as MicroproxyConfig;

    mockValidate.mockReturnValue({
      error: {
        details: [
          {
            message: 'Bad thing',
          },
        ],
      },
    });

    expect(() => validate(config)).toThrow(/Microproxy Config Error: Bad thing/);
  });
});
