import { ApiError } from "../utils/apiError.js";

/**
 * Zod validation middleware.
 * usage: validate({ body: schema, query: schema, params: schema })
 */
export function validate(schemas) {
  return (req, _res, next) => {
    for (const key of ["params", "query", "body"]) {
      const schema = schemas[key];
      if (!schema) continue;
      const result = schema.safeParse(req[key]);
      if (!result.success) {
        const errors = result.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        }));
        return next(ApiError.badRequest("Validation failed", errors));
      }
      if (key === "query") {
        // Express 5 makes req.query a getter; keep parsed copy separately
        req.validatedQuery = result.data;
      } else {
        req[key] = result.data;
      }
    }
    next();
  };
}
