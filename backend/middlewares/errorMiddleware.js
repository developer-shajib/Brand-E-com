/**
 * @DESC Handle 404 Not Found
 * @ROUTE Any non-existent route
 * @method ANY
 * @access public
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * @DESC Error Handler
 * @ROUTE Any route that throws an error
 * @method ANY
 * @access public
 */
export const errorHandler = (err, req, res, next) => {
  // Sometimes the status code might still be 200 even though there's an error
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Set the status code
  res.status(statusCode);

  // Return a consistent error response format
  return res.json({
    success: false,
    errorMessage: err.message,
    // Only show stack trace in development environment
    stack: err.stack,
    // Include the status code in the response for clarity
    statusCode: statusCode
  });
};
