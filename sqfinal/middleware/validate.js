const Joi = require('joi');
const logger = require('../utils/logger');

// Validation schemas
const schemas = {
    employee: {
        create: Joi.object({
            code: Joi.string().required(),
            name: Joi.string().required(),
            jobTitle: Joi.string().required(),
            basicSalary: Joi.number().positive().required(),
            monthlyIncentives: Joi.number().min(0).default(0)
        }),
        update: Joi.object({
            code: Joi.string(),
            name: Joi.string(),
            jobTitle: Joi.string(),
            basicSalary: Joi.number().positive(),
            monthlyIncentives: Joi.number().min(0)
        })
    },
    timeEntry: {
        create: Joi.object({
            employeeId: Joi.number().required(),
            date: Joi.date().iso().required(),
            hoursWorked: Joi.number().min(0).max(24).default(8),
            overtimeHours: Joi.number().min(0).max(24).default(0),
            status: Joi.string().valid('in-progress', 'completed').required()
        }),
        update: Joi.object({
            hoursWorked: Joi.number().min(0).max(24),
            overtimeHours: Joi.number().min(0).max(24),
            status: Joi.string().valid('in-progress', 'completed')
        })
    },
    advance: {
        create: Joi.object({
            employeeId: Joi.number().required(),
            amount: Joi.number().positive().required(),
            date: Joi.date().iso().required(),
            isPaid: Joi.boolean().default(false),
            paidDate: Joi.date().iso().allow(null)
        }),
        update: Joi.object({
            isPaid: Joi.boolean().required(),
            paidDate: Joi.date().iso().allow(null)
        })
    },
    salaryReport: {
        create: Joi.object({
            employeeCode: Joi.string().required(),
            month: Joi.string().required(),
            workDays: Joi.number().integer().min(0).max(31).default(30),
            dailyWorkHours: Joi.number().min(0).max(24).default(8),
            overtimeHours: Joi.number().min(0).default(0),
            bonuses: Joi.number().min(0).default(0),
            deductionsPurchases: Joi.number().min(0).default(0),
            advancesDeduction: Joi.number().min(0).default(0),
            absenceDays: Joi.number().min(0).default(0),
            penaltyDays: Joi.number().min(0).default(0)
        })
    }
};

// Validation middleware factory
const validate = (schemaName, property = 'body') => {
    return (req, res, next) => {
        const schema = schemas[schemaName];
        if (!schema) {
            logger.error(`Validation schema '${schemaName}' not found`);
            return next(new Error('Internal server error'));
        }

        // Determine which schema to use based on the HTTP method
        let validationSchema;
        switch (req.method) {
            case 'POST':
                validationSchema = schema.create;
                break;
            case 'PUT':
                validationSchema = schema.update;
                break;
            default:
                validationSchema = schema.create;
        }

        const { error, value } = validationSchema.validate(req[property], {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            logger.warn('Validation error:', {
                path: req.path,
                errors: error.details.map(detail => detail.message)
            });
            
            return res.status(400).json({
                error: 'Validation Error',
                details: error.details.map(detail => detail.message)
            });
        }

        // Replace request data with validated data
        req[property] = value;
        next();
    };
};

module.exports = {
    validate,
    schemas
};
