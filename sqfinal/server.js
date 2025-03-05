const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./js/database-sqlite');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5002; // Changed default port to 5002

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

// API Routes

// Employees
app.get('/api/employees', async (req, res) => {
    try {
        const employees = await db.getAllEmployees();
        res.json(employees);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/employees/:code', async (req, res) => {
    try {
        const employee = await db.getEmployeeByCode(req.params.code);
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.json(employee);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/employees', async (req, res) => {
    try {
        const employee = await db.createEmployee(req.body);
        res.status(201).json(employee);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/employees/:id', async (req, res) => {
    try {
        const employee = await db.updateEmployee(req.params.id, req.body);
        res.json(employee);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Advances
app.get('/api/advances/:employeeId', async (req, res) => {
    try {
        const advances = await db.getAdvancesByEmployee(req.params.employeeId);
        res.json(advances);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/advances', async (req, res) => {
    try {
        const advance = await db.createAdvance(req.body);
        res.status(201).json(advance);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/advances/:id', async (req, res) => {
    try {
        const advance = await db.updateAdvance(req.params.id, req.body);
        res.json(advance);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Salary Reports
app.get('/api/salary-reports/:employeeId', async (req, res) => {
    try {
        const reports = await db.getSalaryReports(req.params.employeeId);
        res.json(reports);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/salary-reports', async (req, res) => {
    try {
        const report = await db.createSalaryReport(req.body);
        res.status(201).json(report);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Backup History
app.post('/api/backup-history', async (req, res) => {
    try {
        const backup = await db.recordBackup(req.body);
        res.status(201).json(backup);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Time Entries
app.get('/api/time-entries/:employeeId', async (req, res) => {
    try {
        const startDate = req.query.startDate || null;
        const endDate = req.query.endDate || null;
        const entries = await db.getTimeEntries(req.params.employeeId, startDate, endDate);
        res.json(entries);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/time-entries', async (req, res) => {
    try {
        const timeEntry = {
            employeeId: req.body.employeeId,
            date: req.body.checkIn || new Date().toISOString(),
            hoursWorked: req.body.totalHours || 8,
            overtimeHours: 0,
            status: req.body.checkOut ? 'completed' : 'in-progress'
        };
        
        const entry = await db.createTimeEntry(timeEntry);
        res.status(201).json(entry);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/time-entries/:id', async (req, res) => {
    try {
        const timeEntry = {
            hoursWorked: req.body.totalHours || 8,
            overtimeHours: req.body.overtimeHours || 0,
            status: 'completed'
        };
        
        const entry = await db.updateTimeEntry(req.params.id, timeEntry);
        res.json(entry);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/time-entries/:id', async (req, res) => {
    try {
        const stmt = db.prepare('DELETE FROM time_entries WHERE id = ?');
        stmt.run(req.params.id);
        res.status(200).json({ message: 'Time entry deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Tasks
app.get('/api/tasks/:employeeId', async (req, res) => {
    try {
        const tasks = await db.getTasks(req.params.employeeId);
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/tasks', async (req, res) => {
    try {
        const task = await db.createTask(req.body);
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/tasks/:id', async (req, res) => {
    try {
        const task = await db.updateTaskStatus(req.params.id, req.body.status);
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${port}`);
    console.log('Access the application from other devices using your computer\'s IP address');
});