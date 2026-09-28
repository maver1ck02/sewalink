import { body } from 'express-validator';

export const bookingCreateRules = [
  body('providerId').notEmpty().withMessage('Provider is required'),
  body('scheduledAt').isISO8601().withMessage('Valid date is required'),
  body('address').trim().isLength({ min: 4 }).withMessage('Address is required'),
  body('description').optional().isString(),
];

export const quotationRules = [
  body('estimatedPrice').isFloat({ min: 1 }).withMessage('Estimated price is required'),
  body('description').optional().isString(),
];

export const reviewRules = [
  body('bookingId').notEmpty(),
  body('overallRating').isInt({ min: 1, max: 5 }),
  body('serviceQuality').isInt({ min: 1, max: 5 }),
  body('communication').isInt({ min: 1, max: 5 }),
  body('professionalism').isInt({ min: 1, max: 5 }),
];
