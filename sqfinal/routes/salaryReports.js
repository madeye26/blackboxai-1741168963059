const express = require('express');
const router = express.Router();
const db = require('../js/database-sqlite');
const { validate } = require('../middleware/validate');
const logger = require('../utils/logger');

// Get salary reports for an employee
router.get('/:employeeId', async (req, res, next) => {
    try {
        logger.info(`Fetching salary reports for employee ID: ${req.params.employeeId}`);
        const reports = await db.getSalaryReports(req.params.employeeId);
        res.json(reports);
    } catch (err) {
        next(err);
    }
});

// Generate new salary report
router.post('/', validate('salaryReport'), async (req, res, next) => {
    try {
        logger.info('Generating new salary report:', { reportData: req.body });

        // Check if employee exists
        const employee = await db.getEmployeeByCode(req.body.employeeCode);
        if (!employee) {
            logger.warn(`Employee not found with code: ${req.body.employeeCode}`);
            return res.status(404).json({ error: 'Employee not found' });
        }

        // Check if report for this month already exists
        const existingReport = await db.getSalaryReportByMonth(employee.id, req.body.month);
        if (existingReport) {
            logger.warn('Salary report already exists:', {
                employeeId: employee.id,
                month: req.body.month
            });
            return res.status(409).json({
                error: 'Report already exists',
                message: 'A salary report for this month already exists'
            });
        }

        // Calculate time entries for the month
        const timeEntries = await db.getTimeEntriesByMonth(employee.id, req.body.month);
        const totalOvertimeHours = timeEntries.reduce((sum, entry) => sum + (entry.overtime_hours || 0), 0);
        req.body.overtimeHours = totalOvertimeHours;

        // Calculate advances for the month
        const advances = await db.getAdvancesByMonth(employee.id, req.body.month);
        const totalAdvances = advances.reduce((sum, advance) => sum + advance.amount, 0);
        req.body.advancesDeduction = totalAdvances;

        const report = await db.createSalaryReport(req.body);
        res.status(201).json(report);
    } catch (err) {
        next(err);
    }
});

// Get salary report by ID
router.get('/report/:id', async (req, res, next) => {
    try {
        logger.info(`Fetching salary report with ID: ${req.params.id}`);
        const report = await db.getSalaryReportById(req.params.id);
        
        if (!report) {
            logger.warn(`Salary report not found with ID: ${req.params.id}`);
            return res.status(404).json({ error: 'Salary report not found' });
        }

        res.json(report);
    } catch (err) {
        next(err);
    }
});

// Generate bulk salary reports
router.post('/bulk', async (req, res, next) => {
    try {
        logger.info('Generating bulk salary reports:', {
            month: req.body.month,
            employeeCodes: req.body.employeeCodes
        });

        if (!Array.isArray(req.body.employeeCodes)) {
            return res.status(400).json({ error: 'employeeCodes must be an array' });
        }

        const results = [];
        const errors = [];

        for (const employeeCode of req.body.employeeCodes) {
            try {
                // Check if employee exists
                const employee = await db.getEmployeeByCode(employeeCode);
                if (!employee) {
                    throw new Error(`Employee not found with code: ${employeeCode}`);
                }

                // Check if report already exists
                const existingReport = await db.getSalaryReportByMonth(employee.id, req.body.month);
                if (existingReport) {
                    throw new Error(`Report already exists for employee: ${employeeCode}`);
                }

                // Calculate time entries and advances
                const timeEntries = await db.getTimeEntriesByMonth(employee.id, req.body.month);
                const totalOvertimeHours = timeEntries.reduce((sum, entry) => sum + (entry.overtime_hours || 0), 0);

                const advances = await db.getAdvancesByMonth(employee.id, req.body.month);
                const totalAdvances = advances.reduce((sum, advance) => sum + advance.amount, 0);

                const reportData = {
                    employeeCode,
                    month: req.body.month,
                    overtimeHours: totalOvertimeHours,
                    advancesDeduction: totalAdvances,
                    workDays: 30, // Default values
                    dailyWorkHours: 8,
                    bonuses: 0,
                    deductionsPurchases: 0,
                    absenceDays: 0,
                    penaltyDays: 0
                };

                const report = await db.createSalaryReport(reportData);
                results.push(report);
            } catch (err) {
                errors.push({
                    employeeCode,
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

// Get monthly summary
router.get('/summary/:month', async (req, res, next) => {
    try {
        logger.info(`Fetching salary summary for month: ${req.params.month}`);
        const summary = await db.getMonthlySalarySummary(req.params.month);
        res.json(summary);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
