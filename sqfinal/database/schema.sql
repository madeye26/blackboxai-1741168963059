-- SQLite Database Schema for Payroll System

PRAGMA foreign_keys = ON;

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    job_title TEXT,
    basic_salary REAL NOT NULL,
    monthly_incentives REAL DEFAULT 0,
    work_days INTEGER DEFAULT 30,
    daily_work_hours REAL DEFAULT 8,
    hire_date DATE,
    status TEXT DEFAULT 'active',
    department TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index for employee code
CREATE INDEX idx_employee_code ON employees(code);

-- Advances table
CREATE TABLE IF NOT EXISTS advances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    date DATE NOT NULL,
    remaining_amount REAL,
    installment_amount REAL,
    installment_period INTEGER,
    reason TEXT,
    is_paid BOOLEAN DEFAULT FALSE,
    paid_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Create index for advances by employee
CREATE INDEX idx_advances_employee ON advances(employee_id);

-- Time entries table
CREATE TABLE IF NOT EXISTS time_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    date DATE NOT NULL,
    check_in DATETIME,
    check_out DATETIME,
    hours_worked REAL DEFAULT 8,
    overtime_hours REAL DEFAULT 0,
    late_minutes INTEGER DEFAULT 0,
    early_leave_minutes INTEGER DEFAULT 0,
    status TEXT NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Create index for time entries by employee and date
CREATE INDEX idx_time_entries_employee_date ON time_entries(employee_id, date);

-- Leave requests table
CREATE TABLE IF NOT EXISTS leave_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    leave_type TEXT NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending',
    approved_by INTEGER,
    approved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES employees(id)
);

-- Create index for leave requests by employee
CREATE INDEX idx_leave_requests_employee ON leave_requests(employee_id);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    due_date DATE,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Create index for tasks by employee
CREATE INDEX idx_tasks_employee ON tasks(employee_id);

-- Salary reports table
CREATE TABLE IF NOT EXISTS salary_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    employee_code TEXT NOT NULL,
    employee_name TEXT NOT NULL,
    month TEXT NOT NULL,
    date_generated DATETIME NOT NULL,
    work_days INTEGER DEFAULT 30,
    daily_work_hours REAL DEFAULT 8,
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
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Create indexes for salary reports
CREATE INDEX idx_salary_reports_employee ON salary_reports(employee_id);
CREATE INDEX idx_salary_reports_month ON salary_reports(month);

-- Performance reviews table
CREATE TABLE IF NOT EXISTS performance_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    review_date DATE NOT NULL,
    reviewer_id INTEGER NOT NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comments TEXT,
    goals_achieved TEXT,
    areas_for_improvement TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES employees(id)
);

-- Create index for performance reviews by employee
CREATE INDEX idx_performance_reviews_employee ON performance_reviews(employee_id);

-- Dashboard preferences table
CREATE TABLE IF NOT EXISTS dashboard_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    layout JSON,
    widgets JSON,
    theme TEXT DEFAULT 'light',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id INTEGER NOT NULL,
    old_values JSON,
    new_values JSON,
    performed_by INTEGER NOT NULL,
    performed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (performed_by) REFERENCES employees(id)
);

-- Create index for audit log
CREATE INDEX idx_audit_log_action ON audit_log(action, table_name);

-- System settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default system settings
INSERT OR IGNORE INTO system_settings (setting_key, setting_value, description) VALUES
('default_work_days', '30', 'Default number of work days per month'),
('default_work_hours', '8', 'Default number of work hours per day'),
('overtime_rate', '1.5', 'Default overtime rate multiplier'),
('currency', 'EGP', 'Default currency'),
('company_name', 'شركتنا', 'Company name'),
('backup_frequency', 'daily', 'Database backup frequency');