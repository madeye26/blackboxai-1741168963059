/**
 * Database Configuration and Utility Functions
 */

const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root', // Change this to your MySQL username
    password: '', // Change this to your MySQL password
    database: 'payroll_system',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Database utility functions
const db = {
    /**
     * Execute a query with parameters
     * @param {string} sql - SQL query
     * @param {Array} params - Query parameters
     * @returns {Promise} Query result
     */
    query: async (sql, params) => {
        try {
            const [results] = await pool.execute(sql, params);
            return results;
        } catch (error) {
            console.error('Database error:', error);
            throw error;
        }
    },

    /**
     * Get employee by code
     * @param {string} code - Employee code
     * @returns {Promise} Employee data
     */
    getEmployeeByCode: async (code) => {
        const sql = 'SELECT * FROM employees WHERE code = ?';
        const results = await db.query(sql, [code]);
        return results[0];
    },

    /**
     * Get all employees
     * @returns {Promise} Array of employees
     */
    getAllEmployees: async () => {
        const sql = 'SELECT * FROM employees ORDER BY name';
        return await db.query(sql);
    },

    /**
     * Create new employee
     * @param {Object} employee - Employee data
     * @returns {Promise} Created employee
     */
    createEmployee: async (employee) => {
        const sql = 'INSERT INTO employees (code, name, job_title, basic_salary) VALUES (?, ?, ?, ?)';
        const result = await db.query(sql, [
            employee.code,
            employee.name,
            employee.jobTitle,
            employee.basicSalary
        ]);
        return { id: result.insertId, ...employee };
    },

    /**
     * Get advances by employee ID
     * @param {number} employeeId - Employee ID
     * @returns {Promise} Array of advances
     */
    getAdvancesByEmployee: async (employeeId) => {
        const sql = 'SELECT * FROM advances WHERE employee_id = ? ORDER BY date DESC';
        return await db.query(sql, [employeeId]);
    },

    /**
     * Create new advance
     * @param {Object} advance - Advance data
     * @returns {Promise} Created advance
     */
    createAdvance: async (advance) => {
        const sql = 'INSERT INTO advances (employee_id, amount, date) VALUES (?, ?, ?)';
        const result = await db.query(sql, [
            advance.employeeId,
            advance.amount,
            advance.date
        ]);
        return { id: result.insertId, ...advance };
    },

    /**
     * Get salary reports by employee ID
     * @param {number} employeeId - Employee ID
     * @returns {Promise} Array of salary reports
     */
    getSalaryReports: async (employeeId) => {
        const sql = 'SELECT * FROM salary_reports WHERE employee_id = ? ORDER BY month DESC';
        return await db.query(sql, [employeeId]);
    },

    /**
     * Create salary report
     * @param {Object} report - Salary report data
     * @returns {Promise} Created salary report
     */
    createSalaryReport: async (report) => {
        const sql = `
            INSERT INTO salary_reports 
            (employee_id, employee_code, employee_name, month, date_generated, work_days, 
            daily_work_hours, basic_salary, daily_rate, daily_rate_with_incentives, 
            overtime_unit_value, overtime_hours, overtime_amount, monthly_incentives, 
            bonus, total_salary_with_incentives, gross_salary, deductions_purchases, 
            deductions_advances, absence_days, deductions_absence, deductions_hourly, 
            penalty_days, deductions_penalties, total_deductions, net_salary) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // Calculate salary components
        const dailyRate = report.basicSalary / 30; // Assuming 30 days per month
        const dailyRateWithIncentives = (report.basicSalary + (report.monthlyIncentives || 0)) / 30;
        const overtimeUnitValue = dailyRate / 8; // Hourly rate
        const overtimeAmount = (report.overtimeHours || 0) * overtimeUnitValue;
        const totalSalaryWithIncentives = report.basicSalary + (report.monthlyIncentives || 0);
        const grossSalary = totalSalaryWithIncentives + (report.bonuses || 0);
        const deductionsAbsence = (report.absenceDays || 0) * dailyRate;
        const deductionsPenalties = (report.penaltyDays || 0) * dailyRate;
        const totalDeductions = (report.deductionsAdvances || 0) + 
                              (report.deductionsPurchases || 0) + 
                              deductionsAbsence + 
                              deductionsPenalties;
        const netSalary = grossSalary - totalDeductions;

        const result = await db.query(sql, [
            report.employeeId,
            report.employeeCode,
            report.employeeName,
            report.month,
            new Date(),
            report.workDays || 30,
            report.dailyWorkHours || 8,
            report.basicSalary,
            dailyRate,
            dailyRateWithIncentives,
            overtimeUnitValue,
            report.overtimeHours || 0,
            overtimeAmount,
            report.monthlyIncentives || 0,
            report.bonuses || 0,
            totalSalaryWithIncentives,
            grossSalary,
            report.deductionsPurchases || 0,
            report.deductionsAdvances || 0,
            report.absenceDays || 0.00,
            deductionsAbsence,
            report.deductionsHourly || 0,
            report.penaltyDays || 0,
            deductionsPenalties,
            totalDeductions,
            netSalary
        ]);
        return { id: result.insertId, ...report }
    },

    /**
     * Get time entries by employee ID
     * @param {number} employeeId - Employee ID
     * @returns {Promise} Array of time entries
     */
    getTimeEntries: async (employeeId) => {
        const sql = 'SELECT * FROM time_entries WHERE employee_id = ? ORDER BY date DESC';
        return await db.query(sql, [employeeId]);
    },

    /**
     * Create time entry
     * @param {Object} entry - Time entry data
     * @returns {Promise} Created time entry
     */
    createTimeEntry: async (entry) => {
        const sql = 'INSERT INTO time_entries (employee_id, date, hours_worked, overtime_hours, status) VALUES (?, ?, ?, ?, ?)';
        const result = await db.query(sql, [
            entry.employeeId,
            entry.date,
            entry.hoursWorked,
            entry.overtimeHours,
            entry.status
        ]);
        return { id: result.insertId, ...entry };
    },

    /**
     * Record backup in history
     * @param {Object} backup - Backup data
     * @returns {Promise} Created backup record
     */
    recordBackup: async (backup) => {
        const sql = 'INSERT INTO backup_history (backup_date, backup_type, status, notes) VALUES (?, ?, ?, ?)';
        const result = await db.query(sql, [
            backup.date,
            backup.type,
            backup.status,
            backup.notes
        ]);
        return { id: result.insertId, ...backup };
    }
};

module.exports = db;