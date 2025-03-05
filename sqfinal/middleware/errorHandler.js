const logger = require('../utils/logger');

// Central error handling middleware
const errorHandler = (err, req, res, next) => {
    // Log the error
    logger.error('Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        body: req.body,
        params: req.params,
        query: req.query
    });

    // Don't leak error details in production
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Handle specific error types
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation Error',
            details: isProduction ? 'Invalid input data' : err.message
        });
    }

    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid or missing authentication'
        });
    }

    if (err.code === 'SQLITE_CONSTRAINT') {
        return res.status(409).json({
            error: 'Database Constraint Error',
            message: isProduction ? 'Data conflict error' : err.message
        });
    }

    // Default error
    res.status(err.status || 500).json({
        error: 'Internal Server Error',
        message: isProduction ? 'An unexpected error occurred' : err.message
    });
};

// Catch unhandled rejections and exceptions
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    // Give the server time to finish ongoing requests before exiting
    setTimeout(() => {
        process.exit(1);
    }, 1000);
});

module.exports = errorHandler;
