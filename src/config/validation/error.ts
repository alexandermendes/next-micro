import Joi from 'joi';

export class MicroproxyConfigError extends Error {
  constructor(
    message: string,
    details: Joi.ValidationErrorItem | undefined = undefined,
  ) {
    let finalMessage = `Microproxy Config Error: ${message}`;

    // Specify the field within an array that failed uniqueness validation.
    if (details?.type === 'array.unique' && !!details.context?.path) {
      finalMessage += ` for "${details.context.path}"`;
    }

    super(finalMessage);
  }
}
