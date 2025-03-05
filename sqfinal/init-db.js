const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

try {
    // Initialize the database
    const db = new Database(path.join(__dirname, 'database/payroll.db'), { verbose: console.log });
    
    // Read and execute the schema
    const schema = fs.readFileSync(path.join(__dirname, 'database/schema.sql'), 'utf8');
    db.exec(schema);
    
    console.log('Database schema initialized successfully!');
    db.close();
} catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
}