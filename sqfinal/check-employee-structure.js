const db = require('./js/supabase');

async function checkEmployeeStructure() {
    try {
        console.log('Checking employee table structure...\n');
        
        // Get an existing employee to see the actual structure
        const employee = await db.getEmployeeByCode('EMP003');
        console.log('Employee record structure:');
        console.log(JSON.stringify(employee, null, 2));
        
        // Get the raw table structure from Supabase
        const { data: tableInfo, error } = await db.supabase
            .from('employees')
            .select('*')
            .limit(1);
            
        if (error) {
            console.error('Error getting table info:', error);
            return;
        }
        
        console.log('\nAvailable columns:');
        if (tableInfo && tableInfo[0]) {
            console.log(Object.keys(tableInfo[0]));
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkEmployeeStructure();
