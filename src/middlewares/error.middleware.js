// Global Error Handling Middleware
const errorMiddleware = (err, req, res, next) => {
    console.error(err.stack); // Log the error stack (helpful for debugging)
  
    const statusCode = err.statusCode || 500; // Default to 500 if no custom status
    const message = err.message || 'Something went wrong';
  
    res.status(statusCode).json({
      success: false,
      message,
      // Optionally include stack trace only in development
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  };
  
  export default errorMiddleware;
  