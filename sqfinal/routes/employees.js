const express = require('express');
const router = express.Router();
const db = require('../js/database-sqlite');
const { validate } = require('../middleware/validate');
const logger = require('../utils/logger');

// Get all employees
router.get('/', async (req, res, next) => {
    try {
        logger.info('Fetching all employees');
        const employees = await db.getAllEmployees();
        res.json(employees);
    } catch (err) {
        next(err);
    }
});

// Get employee by code
router.get('/:code', async (req, res, next) => {
    try {
        logger.info(`Fetching employee with code: ${req.params.code}`);
        const employee = await db.getEmployeeByCode(req.params.code);
        if (!employee) {
            logger.warn(`Employee not found with code: ${req.params.code}`);
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.json(employee);
    } catch (err) {
        next(err);
    }
});

// Create new employee
router.post('/', validate('employee'), async (req, res, next) => {
    try {
        logger.info('Creating new employee:', { employeeData: req.body });
        const employee = await db.createEmployee(req.body);
        res.status(201).json(employee);
    } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
            logger.warn('Employee code already exists:', { code: req.body.code });
            return res.status(409).json({ error: 'Employee code already exists' });
        }
        next(err);
    }
});

// Update employee
router.put('/:id', validate('employee'), async (req, res, next) => {
    try {
        logger.info(`Updating employee with ID: ${req.params.id}`, { updateData: req.body });
        const employee = await db.updateEmployee(req.params.id, req.body);
        if (!employee) {
            logger.warn(`Employee not found with ID: ${req.params.id}`);
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.json(employee);
    } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
            logger.warn('Employee code already exists:', { code: req.body.code });
            return res.status(409).json({ error: 'Employee code already exists' });
        }
        next(err);
    }
});

// Get employee time entries
router.get('/:id/time-entries', async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        logger.info(`Fetching time entries for employee ID: ${req.params.id}`, { startDate, endDate });
        const entries = await db.getTimeEntries(req.params.id, startDate, endDate);
        res.json(entries);
    } catch (err) {
        next(err);
    }
});

// Get employee advances
router.get('/:id/advances', async (req, res, next) => {
    try {
        logger.info(`Fetching advances for employee ID: ${req.params.id}`);
        const advances = await db.getAdvancesByEmployee(req.params.id);
        res.json(advances);
    } catch (err) {
        next(err);
    }
});

// Get employee salary reports
router.get('/:id/salary-reports', async (req, res, next) => {
    try {
        logger.info(`Fetching salary reports for employee ID: ${req.params.id}`);
        const reports = await db.getSalaryReports(req.params.id);
        res.json(reports);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
