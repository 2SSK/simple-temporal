export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      query: req.query,
      body: req.body,
      params: req.params,
    });
    next();
  } catch (err) {
    next(err);
  }
};
