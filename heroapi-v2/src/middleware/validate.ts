import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

// ============================================================================
// Request validation via zod. On success, the parsed (and coerced) value
// replaces the raw source so downstream handlers get typed, clean data.
// ============================================================================

type Source = 'body' | 'query' | 'params';

export const validate =
  (schema: AnyZodObject, source: Source = 'body') =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[source]);
      // Reassign parsed values (coercions applied). req.query is a getter in
      // some Express versions, so guard the assignment.
      try {
        (req as unknown as Record<string, unknown>)[source] = parsed;
      } catch {
        Object.assign(req[source] as object, parsed);
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(422).json({ message: 'Validation failed', details: err.flatten() });
        return;
      }
      next(err);
    }
  };
