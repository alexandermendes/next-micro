import Joi from 'joi';
import { getSchema } from '../../../../src/config/validation/schema';

describe('Config: Validation - Schema', () => {
  describe('valid config', () => {
    it('matches the snapshot', () => {
      const schema = getSchema();
      expect(Joi.isSchema(schema)).toBe(true);

      // The JSON parse/stringify removes some of the internal Joi functions
      // that we don't really care about for the sake of this snapshot.
      expect(JSON.parse(JSON.stringify(schema, null, 2))).toMatchSnapshot();
    });
  });
});
