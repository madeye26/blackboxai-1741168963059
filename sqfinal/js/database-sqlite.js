const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure database directory exists
const dbDir = path.join(__dirname, '../database');
if (!fs.existsSync(dbDir)) {
    try {
        fs.mkdirSync(dbDir, { recursive: true });
        console.log('Created database directory:', dbDir);
    } catch (err) {
        console.error('Error creating database directory:', err);
        process.exit(1);
    }
}

// Initialize SQLite database
const db = new sqlite3.Database(path.join(dbDir, 'payroll.db'), (err) => {
    if (err) {
        console.error('Error opening database:', err);
        process.exit(1);
    }
    console.log('Successfully connected to database');
    
    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');
});

// Create tables if they don't exist
function initializeTables() {
    const tables = [
        `CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            job_title TEXT,
            basic_salary REAL NOT NULL,
            monthly_incentives REAL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS advances (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER NOT NULL,
            amount REAL NOT NULL,
            date DATE NOT NULL,
            is_paid BOOLEAN DEFAULT FALSE,
            paid_date DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (employee_id) REFERENCES employees(id)
        )`,
        `CREATE TABLE IF NOT EXISTS time_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER NOT NULL,
            date DATE NOT NULL,
            hours_worked REAL DEFAULT 8,
            overtime_hours REAL DEFAULT 0,
            status TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (employee_id) REFERENCES employees(id)
        )`,
        `CREATE TABLE IF NOT EXISTS salary_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER NOT NULL,
            employee_code TEXT NOT NULL,
            employee_name TEXT NOT NULL,
            month TEXT NOT NULL,
            date_generated DATETIME NOT NULL,
            work_days INTEGER DEFAULT 30,
            daily_work_hours INTEGER DEFAULT 8,
            basic_salary REAL NOT NULL,
            daily_rate REAL NOT NULL,
            daily_rate_with_incentives REAL NOT NULL,
            overtime_unit_value REAL NOT NULL,
            overtime_hours REAL DEFAULT 0,
            overtime_amount REAL DEFAULT 0,
            monthly_incentives REAL DEFAULT 0,
            bonus REAL DEFAULT 0,
            total_salary_with_incentives REAL NOT NULL,
            gross_salary REAL NOT NULL,
            deductions_purchases REAL DEFAULT 0,
            deductions_advances REAL DEFAULT 0,
            absence_days INTEGER DEFAULT 0,
            deductions_absence REAL DEFAULT 0,
            deductions_hourly REAL DEFAULT 0,
            penalty_days INTEGER DEFAULT 0,
            deductions_penalties REAL DEFAULT 0,
            total_deductions REAL DEFAULT 0,
            net_salary REAL NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (employee_id) REFERENCES employees(id)
        )`
    ];

    db.serialize(() => {
        tables.forEach(table => {
            db.run(table, (err) => {
                if (err) {
                    console.error('Error creating table:', err);
                }
            });
        });
        console.log('Database tables initialized successfully');
    });
}

// Initialize tables
initializeTables();

// Database utility functions
const dbUtils = {
    getEmployeeByCode: (code) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM employees WHERE code = ?', [code], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    getAllEmployees: () => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM employees ORDER BY name', [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    createEmployee: (employee) => {
        return new Promise((resolve, reject) => {
            const stmt = db.prepare(`
                INSERT INTO employees (code, name, job_title, basic_salary, monthly_incentives)
                VALUES (?, ?, ?, ?, ?)
            `);
            
            stmt.run(
                employee.code,
                employee.name,
                employee.jobTitle,
                employee.basicSalary,
                employee.monthlyIncentives || 0,
                function(err) {
                    if (err) reject(err);
                    else {
                        dbUtils.getEmployeeByCode(employee.code)
                            .then(resolve)
                            .catch(reject);
                    }
                }
            );
        });
    },

    updateEmployee: (employeeId, employee) => {
        return new Promise((resolve, reject) => {
            const stmt = db.prepare(`
                UPDATE employees
                SET code = ?, name = ?, job_title = ?, basic_salary = ?, monthly_incentives = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `);

            stmt.run(
                employee.code,
                employee.name,
                employee.jobTitle,
                employee.basicSalary,
                employee.monthlyIncentives,
                employeeId,
                function(err) {
                    if (err) reject(err);
                    else {
                        db.get('SELECT * FROM employees WHERE id = ?', [employeeId], (err, row) => {
                            if (err) reject(err);
                            else resolve(row);
                        });
                    }
                }
            );
        });
    },

    getAdvancesByEmployee: (employeeId) => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM advances WHERE employee_id = ? ORDER BY date DESC', [employeeId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    getSalaryReports: (employeeId) => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM salary_reports WHERE employee_id = ? ORDER BY month DESC', [employeeId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    createAdvance: (advance) => {
        return new Promise((resolve, reject) => {
            const stmt = db.prepare(`
                INSERT INTO advances (employee_id, amount, date, is_paid, paid_date)
                VALUES (?, ?, ?, ?, ?)
            `);

            stmt.run(
                advance.employeeId,
                advance.amount,
                advance.date,
                advance.isPaid || false,
                advance.paidDate || null,
                function(err) {
                    if (err) reject(err);
                    else {
                        db.get('SELECT * FROM advances WHERE id = ?', [this.lastID], (err, row) => {
                            if (err) reject(err);
                            else resolve(row);
                        });
                    }
                }
            );
        });
    },

    updateAdvance: (advanceId, advance) => {
        return new Promise((resolve, reject) => {
            const stmt = db.prepare(`
                UPDATE advances
                SET is_paid = ?, paid_date = ?
                WHERE id = ?
            `);

            stmt.run(
                advance.isPaid,
                advance.isPaid ? new Date().toISOString() : null,
                advanceId,
                function(err) {
                    if (err) reject(err);
                    else {
                        db.get('SELECT * FROM advances WHERE id = ?', [advanceId], (err, row) => {
                            if (err) reject(err);
                            else resolve(row);
                        });
                    }
                }
            );
        });
    },

    createTimeEntry: (timeEntry) => {
        return new Promise((resolve, reject) => {
            const stmt = db.prepare(`
                INSERT INTO time_entries (employee_id, date, hours_worked, overtime_hours, status)
                VALUES (?, ?, ?, ?, ?)
            `);

            stmt.run(
                timeEntry.employeeId,
                timeEntry.date,
                timeEntry.hoursWorked,
                timeEntry.overtimeHours || 0,
                timeEntry.status,
                function(err) {
                    if (err) reject(err);
                    else {
                        db.get('SELECT * FROM time_entries WHERE id = ?', [this.lastID], (err, row) => {
                            if (err) reject(err);
                            else resolve(row);
                        });
                    }
                }
            );
        });
    },

    getTimeEntries: (employeeId, startDate, endDate) => {
        return new Promise((resolve, reject) => {
            let query = 'SELECT * FROM time_entries WHERE employee_id = ?';
            const params = [employeeId];
            
            if (startDate) {
                query += ' AND date >= ?';
                params.push(startDate);
            }
            if (endDate) {
                query += ' AND date <= ?';
                params.push(endDate);
            }
            
            query += ' ORDER BY date DESC';
            
            db.all(query, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    updateTimeEntry: (entryId, timeEntry) => {
        return new Promise((resolve, reject) => {
            const stmt = db.prepare(`
                UPDATE time_entries
                SET hours_worked = ?, overtime_hours = ?, status = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `);

            stmt.run(
                timeEntry.hoursWorked,
                timeEntry.overtimeHours,
                timeEntry.status,
                entryId,
                function(err) {
                    if (err) reject(err);
                    else {
                        db.get('SELECT * FROM time_entries WHERE id = ?', [entryId], (err, row) => {
                            if (err) reject(err);
                            else resolve(row);
                        });
                    }
                }
            );
        });
    },

    createSalaryReport: async (salaryData) => {
        try {
            const employee = await dbUtils.getEmployeeByCode(salaryData.employeeCode);
            if (!employee) throw new Error('Employee not found');

            const dailyRate = employee.basic_salary / 30;
            const dailyRateWithIncentives = (employee.basic_salary + (employee.monthly_incentives || 0)) / 30;
            const overtimeAmount = (salaryData.overtimeHours || 0) * (dailyRate / 8);
            const totalDeductions = (
                (salaryData.advancesDeduction || 0) +
                (salaryData.deductionsPurchases || 0) +
                ((salaryData.absenceDays || 0) * dailyRate) +
                ((salaryData.penaltyDays || 0) * dailyRate)
            );
            const grossSalary = (
                employee.basic_salary +
                (employee.monthly_incentives || 0) +
                (salaryData.bonuses || 0)
            );
            const netSalary = grossSalary - totalDeductions;

            return new Promise((resolve, reject) => {
                const stmt = db.prepare(`
                    INSERT INTO salary_reports (
                        employee_id, employee_code, employee_name, month, date_generated,
                        work_days, daily_work_hours, basic_salary, daily_rate,
                        daily_rate_with_incentives, overtime_unit_value, overtime_hours,
                        overtime_amount, monthly_incentives, bonus, total_salary_with_incentives,
                        gross_salary, deductions_purchases, deductions_advances, absence_days,
                        deductions_absence, deductions_hourly, penalty_days, deductions_penalties,
                        total_deductions, net_salary
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `);

                stmt.run(
                    employee.id,
                    employee.code,
                    employee.name,
                    salaryData.month,
                    new Date().toISOString(),
                    salaryData.workDays || 30,
                    salaryData.dailyWorkHours || 8,
                    employee.basic_salary,
                    dailyRate,
                    dailyRateWithIncentives,
                    dailyRate / 8,
                    salaryData.overtimeHours || 0,
                    overtimeAmount,
                    employee.monthly_incentives || 0,
                    salaryData.bonuses || 0,
                    employee.basic_salary + (employee.monthly_incentives || 0),
                    grossSalary,
                    salaryData.deductionsPurchases || 0,
                    salaryData.advancesDeduction || 0,
                    salaryData.absenceDays || 0,
                    (salaryData.absenceDays || 0) * dailyRate,
                    0,
                    salaryData.penaltyDays || 0,
                    (salaryData.penaltyDays || 0) * dailyRate,
                    totalDeductions,
                    netSalary,
                    function(err) {
                        if (err) reject(err);
                        else {
                            db.get('SELECT * FROM salary_reports WHERE id = ?', [this.lastID], (err, row) => {
                                if (err) reject(err);
                                else resolve(row);
                            });
                        }
                    }
                );
            });
        } catch (err) {
            throw err;
        }
    }
};

module.exports = dbUtils;
