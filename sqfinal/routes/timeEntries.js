const express = require('express');
const router = express.Router();
const db = require('../js/database-sqlite');
const { validate } = require('../middleware/validate');
const logger = require('../utils/logger');

// Get time entries for an employee with optional date range
router.get('/:employeeId', async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        logger.info('Fetching time entries:', {
            employeeId: req.params.employeeId,
            startDate,
            endDate
        });

        const entries = await db.getTimeEntries(req.params.employeeId, startDate, endDate);
        res.json(entries);
    } catch (err) {
        next(err);
    }
});

// Create new time entry
router.post('/', validate('timeEntry'), async (req, res, next) => {
    try {
        logger.info('Creating new time entry:', { entryData: req.body });
        
        // Check if employee exists
        const employee = await db.getEmployeeByCode(req.body.employeeId);
        if (!employee) {
            logger.warn(`Employee not found with ID: ${req.body.employeeId}`);
            return res.status(404).json({ error: 'Employee not found' });
        }

        const timeEntry = {
            employeeId: req.body.employeeId,
            date: req.body.date || new Date().toISOString(),
            hoursWorked: req.body.hoursWorked || 8,
            overtimeHours: req.body.overtimeHours || 0,
            status: req.body.status || 'in-progress'
        };

        const entry = await db.createTimeEntry(timeEntry);
        res.status(201).json(entry);
    } catch (err) {
        next(err);
    }
});

// Update time entry
router.put('/:id', validate('timeEntry'), async (req, res, next) => {
    try {
        logger.info(`Updating time entry with ID: ${req.params.id}`, { updateData: req.body });

        const timeEntry = {
            hoursWorked: req.body.hoursWorked,
            overtimeHours: req.body.overtimeHours || 0,
            status: req.body.status
        };

        const entry = await db.updateTimeEntry(req.params.id, timeEntry);
        if (!entry) {
            logger.warn(`Time entry not found with ID: ${req.params.id}`);
            return res.status(404).json({ error: 'Time entry not found' });
        }

        res.json(entry);
    } catch (err) {
        next(err);
    }
});

// Delete time entry
router.delete('/:id', async (req, res, next) => {
    try {
        logger.info(`Deleting time entry with ID: ${req.params.id}`);
        
        // First check if the entry exists
        const entry = await db.getTimeEntry(req.params.id);
        if (!entry) {
            logger.warn(`Time entry not found with ID: ${req.params.id}`);
            return res.status(404).json({ error: 'Time entry not found' });
        }

        await db.deleteTimeEntry(req.params.id);
        res.status(200).json({ message: 'Time entry deleted successfully' });
    } catch (err) {
        next(err);
    }
});

// Bulk create time entries
router.post('/bulk', async (req, res, next) => {
    try {
        logger.info('Creating bulk time entries:', { count: req.body.entries.length });
        
        if (!Array.isArray(req.body.entries)) {
            return res.status(400).json({ error: 'Entries must be an array' });
        }

        const results = [];
        const errors = [];

        for (const entry of req.body.entries) {
            try {
                const timeEntry = {
                    employeeId: entry.employeeId,
                    date: entry.date || new Date().toISOString(),
                    hoursWorked: entry.hoursWorked || 8,
                    overtimeHours: entry.overtimeHours || 0,
                    status: entry.status || 'in-progress'
                };

                const result = await db.createTimeEntry(timeEntry);
                results.push(result);
            } catch (err) {
                errors.push({
                    entry,
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
