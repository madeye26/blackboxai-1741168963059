const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const employeesRouter = require('./routes/employees');
const timeEntriesRouter = require('./routes/timeEntries');
const advancesRouter = require('./routes/advances');
const salaryReportsRouter = require('./routes/salaryReports');

const app = express();
const port = process.env.PORT || 5002;

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
});

// Security middleware
app.use(helmet());
app.use(limiter);

// CORS configuration
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 600 // 10 minutes
};
app.use(cors(corsOptions));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('.'));

// Request logging middleware
app.use((req, res, next) => {
    logger.info('Incoming request:', {
        method: req.method,
        path: req.path,
        query: req.query,
        ip: req.ip
    });
    next();
});

// Routes
app.use('/api/employees', employeesRouter);
app.use('/api/time-entries', timeEntriesRouter);
app.use('/api/advances', advancesRouter);
app.use('/api/salary-reports', salaryReportsRouter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Handle 404
app.use((req, res) => {
    logger.warn('Route not found:', {
        method: req.method,
        path: req.path
    });
    res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(port, '0.0.0.0', () => {
    logger.info(`Server is running on http://0.0.0.0:${port}`);
    logger.info('Access the application from other devices using your computer\'s IP address');
});

// Handle uncaught exceptions and rejections
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
