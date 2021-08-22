import Joi from 'joi';

export class NextMicroConfigError extends Error {
  constructor(
    message: string,
    details: Joi.ValidationErrorItem | undefined = undefined,
  ) {
    let finalMessage = `NextMicro Config Error: ${message}`;

    // Specify the field within an array that failed uniqueness validation.
    if (details?.type === 'array.unique' && !!details.context?.path) {
      finalMessage += ` for "${details.context.path}"`;
    }

    super(finalMessage);
  }
}
