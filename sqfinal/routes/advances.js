const express = require('express');
const router = express.Router();
const db = require('../js/database-sqlite');
const { validate } = require('../middleware/validate');
const logger = require('../utils/logger');

// Get advances for an employee
router.get('/:employeeId', async (req, res, next) => {
    try {
        logger.info(`Fetching advances for employee ID: ${req.params.employeeId}`);
        const advances = await db.getAdvancesByEmployee(req.params.employeeId);
        res.json(advances);
    } catch (err) {
        next(err);
    }
});

// Create new advance
router.post('/', validate('advance'), async (req, res, next) => {
    try {
        logger.info('Creating new advance:', { advanceData: req.body });

        // Check if employee exists
        const employee = await db.getEmployeeByCode(req.body.employeeId);
        if (!employee) {
            logger.warn(`Employee not found with ID: ${req.body.employeeId}`);
            return res.status(404).json({ error: 'Employee not found' });
        }

        // Check if advance amount exceeds monthly salary limit
        const totalAdvances = await db.getTotalAdvancesForMonth(req.body.employeeId, new Date(req.body.date));
        const maxAdvanceAmount = employee.basic_salary * 0.5; // 50% of basic salary
        if ((totalAdvances + req.body.amount) > maxAdvanceAmount) {
            logger.warn('Advance amount exceeds monthly limit', {
                employeeId: req.body.employeeId,
                requestedAmount: req.body.amount,
                totalAdvances,
                maxAllowed: maxAdvanceAmount
            });
            return res.status(400).json({
                error: 'Advance limit exceeded',
                message: 'Total advances cannot exceed 50% of monthly basic salary'
            });
        }

        const advance = await db.createAdvance(req.body);
        res.status(201).json(advance);
    } catch (err) {
        next(err);
    }
});

// Update advance (mark as paid)
router.put('/:id', validate('advance'), async (req, res, next) => {
    try {
        logger.info(`Updating advance with ID: ${req.params.id}`, { updateData: req.body });
        
        // Check if advance exists
        const existingAdvance = await db.getAdvance(req.params.id);
        if (!existingAdvance) {
            logger.warn(`Advance not found with ID: ${req.params.id}`);
            return res.status(404).json({ error: 'Advance not found' });
        }

        // If already paid, prevent update
        if (existingAdvance.is_paid) {
            logger.warn(`Attempt to update already paid advance: ${req.params.id}`);
            return res.status(400).json({ error: 'Advance is already marked as paid' });
        }

        const advance = await db.updateAdvance(req.params.id, {
            isPaid: req.body.isPaid,
            paidDate: req.body.isPaid ? new Date().toISOString() : null
        });

        res.json(advance);
    } catch (err) {
        next(err);
    }
});

// Get advance summary for an employee
router.get('/:employeeId/summary', async (req, res, next) => {
    try {
        const { month, year } = req.query;
        logger.info('Fetching advance summary:', {
            employeeId: req.params.employeeId,
            month,
            year
        });

        const summary = await db.getAdvanceSummary(req.params.employeeId, month, year);
        res.json(summary);
    } catch (err) {
        next(err);
    }
});

// Get pending advances
router.get('/pending', async (req, res, next) => {
    try {
        logger.info('Fetching pending advances');
        const pendingAdvances = await db.getPendingAdvances();
        res.json(pendingAdvances);
    } catch (err) {
        next(err);
    }
});

// Bulk update advances (mark multiple as paid)
router.put('/bulk/paid', async (req, res, next) => {
    try {
        logger.info('Bulk updating advances as paid:', { advanceIds: req.body.advanceIds });
        
        if (!Array.isArray(req.body.advanceIds)) {
            return res.status(400).json({ error: 'advanceIds must be an array' });
        }

        const results = [];
        const errors = [];

        for (const advanceId of req.body.advanceIds) {
            try {
                const advance = await db.updateAdvance(advanceId, {
                    isPaid: true,
                    paidDate: new Date().toISOString()
                });
                results.push(advance);
            } catch (err) {
                errors.push({
                    advanceId,
                    error: err.message
                });
            }
        }

        res.status(207).json({
            success: results,
            errors: errors
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
