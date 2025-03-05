// Time Tracking System

// Global state for time tracking
if (!appState.timeRecords) {
    appState.timeRecords = [];
}

// Load Time Tracking View
function loadTimeTrackingView() {
    const mainContent = document.getElementById('main-content');
    
    mainContent.innerHTML = `
        <div class="form-container">
            <h3 class="mb-4">تتبع وقت الموظفين</h3>
            
            <div class="row mb-4">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">تسجيل وقت الحضور والانصراف</h5>
                            <div class="mb-3">
                                <label class="form-label">اختر الموظف</label>
                                <select class="form-select" id="time-tracking-employee-select">
                                    <option value="">-- اختر الموظف --</option>
                                    ${generateEmployeeOptions()}
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">التاريخ</label>
                                <input type="date" class="form-control" id="time-tracking-date" value="${new Date().toISOString().split('T')[0]}">
                            </div>
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label class="form-label">وقت الحضور</label>
                                    <input type="time" class="form-control" id="time-in">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">وقت الانصراف</label>
                                    <input type="time" class="form-control" id="time-out">
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">ملاحظات</label>
                                <textarea class="form-control" id="time-tracking-notes" rows="2"></textarea>
                            </div>
                            <button class="btn btn-primary" onclick="saveTimeRecord()">حفظ</button>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">تسجيل الأوفرتايم</h5>
                            <div class="mb-3">
                                <label class="form-label">اختر الموظف</label>
                                <select class="form-select" id="overtime-employee-select">
                                    <option value="">-- اختر الموظف --</option>
                                    ${generateEmployeeOptions()}
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">التاريخ</label>
                                <input type="date" class="form-control" id="overtime-date" value="${new Date().toISOString().split('T')[0]}">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">عدد ساعات الأوفرتايم</label>
                                <input type="number" class="form-control" id="overtime-hours" min="0" step="0.5">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">سبب الأوفرتايم</label>
                                <textarea class="form-control" id="overtime-reason" rows="2"></textarea>
                            </div>
                            <button class="btn btn-primary" onclick="saveOvertimeRecord()">حفظ</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card mb-4">
                <div class="card-body">
                    <h5 class="card-title">سجل الحضور والانصراف</h5>
                    <div class="row mb-3">
                        <div class="col-md-4">
                            <label class="form-label">تصفية حسب الموظف</label>
                            <select class="form-select" id="filter-employee" onchange="filterTimeRecords()">
                                <option value="">جميع الموظفين</option>
                                ${generateEmployeeOptions()}
                            </select>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">من تاريخ</label>
                            <input type="date" class="form-control" id="filter-date-from" onchange="filterTimeRecords()">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">إلى تاريخ</label>
                            <input type="date" class="form-control" id="filter-date-to" onchange="filterTimeRecords()">
                        </div>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>الموظف</th>
                                    <th>التاريخ</th>
                                    <th>وقت الحضور</th>
                                    <th>وقت الانصراف</th>
                                    <th>ساعات العمل</th>
                                    <th>الأوفرتايم</th>
                                    <th>ملاحظات</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody id="time-records-table-body">
                                <!-- Time records will be loaded here -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">تقرير ساعات العمل</h5>
                    <div class="row mb-3">
                        <div class="col-md-4">
                            <label class="form-label">اختر الموظف</label>
                            <select class="form-select" id="report-employee-select" onchange="generateWorkHoursReport()">
                                <option value="">-- اختر الموظف --</option>
                                ${generateEmployeeOptions()}
                            </select>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">الشهر</label>
                            <input type="month" class="form-control" id="report-month" onchange="generateWorkHoursReport()">
                        </div>
                        <div class="col-md-4 d-flex align-items-end">
                            <button class="btn btn-success" onclick="exportWorkHoursReport()">تصدير التقرير</button>
                        </div>
                    </div>
                    <div id="work-hours-report-container">
                        <!-- Report will be generated here -->
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Initialize the time records table
    loadTimeRecordsTable();
    
    // Set default dates for filtering
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    document.getElementById('filter-date-from').valueAsDate = firstDayOfMonth;
    document.getElementById('filter-date-to').valueAsDate = today;
    document.getElementById('report-month').value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
}

// Save time record
function saveTimeRecord() {
    const employeeSelect = document.getElementById('time-tracking-employee-select');
    const dateInput = document.getElementById('time-tracking-date');
    const timeInInput = document.getElementById('time-in');
    const timeOutInput = document.getElementById('time-out');
    const notesInput = document.getElementById('time-tracking-notes');
    
    // Validate inputs
    if (!employeeSelect.value) {
        showAlert('الرجاء اختيار الموظف', 'warning');
        return;
    }
    
    if (!dateInput.value) {
        showAlert('الرجاء تحديد التاريخ', 'warning');
        return;
    }
    
    if (!timeInInput.value && !timeOutInput.value) {
        showAlert('الرجاء تحديد وقت الحضور أو الانصراف على الأقل', 'warning');
        return;
    }
    
    // Calculate work hours if both time in and time out are provided
    let workHours = 0;
    if (timeInInput.value && timeOutInput.value) {
        const timeIn = new Date(`${dateInput.value}T${timeInInput.value}`);
        const timeOut = new Date(`${dateInput.value}T${timeOutInput.value}`);
        
        // Handle case where time out is on the next day
        if (timeOut < timeIn) {
            timeOut.setDate(timeOut.getDate() + 1);
        }
        
        workHours = (timeOut - timeIn) / (1000 * 60 * 60);
    }
    
    // Get employee details
    const employee = appState.employees.find(emp => emp.code === employeeSelect.value);
    
    // Create time record object
    const timeRecord = {
        id: Date.now().toString(),
        employeeCode: employeeSelect.value,
        employeeName: employee ? employee.name : '',
        date: dateInput.value,
        timeIn: timeInInput.value,
        timeOut: timeOutInput.value,
        workHours: workHours,
        overtimeHours: 0,
        notes: notesInput.value
    };
    
    // Check if record for this employee and date already exists
    const existingRecordIndex = appState.timeRecords.findIndex(
        record => record.employeeCode === timeRecord.employeeCode && record.date === timeRecord.date
    );
    
    if (existingRecordIndex !== -1) {
        // Update existing record
        const existingRecord = appState.timeRecords[existingRecordIndex];
        
        // Keep overtime hours from existing record
        timeRecord.overtimeHours = existingRecord.overtimeHours;
        
        appState.timeRecords[existingRecordIndex] = timeRecord;
        showAlert('تم تحديث سجل الحضور والانصراف بنجاح', 'success');
    } else {
        // Add new record
        appState.timeRecords.push(timeRecord);
        showAlert('تم تسجيل الحضور والانصراف بنجاح', 'success');
    }
    
    // Save to Supabase via API
    try {
        // Create a time entry object for the API
        const timeEntryData = {
            employeeId: employee.id, // Use the employee ID from Supabase
            checkIn: timeInInput.value ? new Date(`${dateInput.value}T${timeInInput.value}`).toISOString() : null,
            checkOut: timeOutInput.value ? new Date(`${dateInput.value}T${timeOutInput.value}`).toISOString() : null,
            totalHours: workHours,
            notes: notesInput.value
        };

        // Call the API to save the time entry
        fetch('/api/time-entries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(timeEntryData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('فشل حفظ البيانات في قاعدة البيانات');
            }
            return response.json();
        })
        .then(savedEntry => {
            // Update the local record with the ID from Supabase
            timeRecord.id = savedEntry.id;
            
            // Update local state for immediate UI update
            if (existingRecordIndex !== -1) {
                appState.timeRecords[existingRecordIndex] = timeRecord;
            } else {
                appState.timeRecords.push(timeRecord);
            }
            
            // Save to localStorage as backup
            saveToLocalStorage('timeRecords', appState.timeRecords);
            
            // Refresh the table
            loadTimeRecordsTable();
            
            // Clear form
            employeeSelect.value = '';
            timeInInput.value = '';
            timeOutInput.value = '';
            notesInput.value = '';
        })
        .catch(error => {
            console.error('Error saving to Supabase:', error);
            showAlert('حدث خطأ أثناء الحفظ في قاعدة البيانات، سيتم الحفظ محلياً فقط', 'warning');
            
            // Fallback to localStorage only
            if (existingRecordIndex !== -1) {
                appState.timeRecords[existingRecordIndex] = timeRecord;
            } else {
                appState.timeRecords.push(timeRecord);
            }
            saveToLocalStorage('timeRecords', appState.timeRecords);
            
            // Refresh the table
            loadTimeRecordsTable();
            
            // Clear form
            employeeSelect.value = '';
            timeInInput.value = '';
            timeOutInput.value = '';
            notesInput.value = '';
        });
    } catch (error) {
        console.error('Error preparing time entry data:', error);
        showAlert('حدث خطأ أثناء إعداد بيانات الوقت', 'danger');
    }
}

// Load time records table
function loadTimeRecordsTable() {
    const tableBody = document.getElementById('time-records-table-body');
    if (!tableBody) return;
    
    // Show loading indicator
    tableBody.innerHTML = '<tr><td colspan="8" class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></td></tr>';
    
    // Get filter values
    const filterEmployee = document.getElementById('filter-employee')?.value || '';
    const filterDateFrom = document.getElementById('filter-date-from')?.value || '';
    const filterDateTo = document.getElementById('filter-date-to')?.value || '';
    
    // Get employee ID if filter is set
    let employeeId = null;
    if (filterEmployee) {
        const employee = appState.employees.find(emp => emp.code === filterEmployee);
        if (employee) {
            employeeId = employee.id;
        }
    }
    
    // Fetch time entries from Supabase via API
    let apiUrl = '/api/time-entries/';
    
    if (employeeId) {
        apiUrl += employeeId;
        
        // Add date filters if provided
        const queryParams = [];
        if (filterDateFrom) {
            queryParams.push(`startDate=${filterDateFrom}`);
        }
        if (filterDateTo) {
            queryParams.push(`endDate=${filterDateTo}`);
        }
        
        if (queryParams.length > 0) {
            apiUrl += '?' + queryParams.join('&');
        }
        
        // Fetch from API
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch time entries');
                }
                return response.json();
            })
            .then(timeEntries => {
                // Update local state
                appState.timeRecords = timeEntries.map(entry => ({
                    id: entry.id,
                    employeeCode: filterEmployee,
                    employeeName: appState.employees.find(emp => emp.id === entry.employee_id)?.name || 'Unknown',
                    date: new Date(entry.check_in).toISOString().split('T')[0],
                    timeIn: entry.check_in ? new Date(entry.check_in).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : '',
                    timeOut: entry.check_out ? new Date(entry.check_out).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : '',
                    workHours: entry.total_hours || 0,
                    overtimeHours: 0, // Overtime not tracked in Supabase yet
                    notes: entry.notes || ''
                }));
                
                // Save to localStorage as backup
                saveToLocalStorage('timeRecords', appState.timeRecords);
                
                // Display the records
                displayTimeRecords(appState.timeRecords);
            })
            .catch(error => {
                console.error('Error fetching time entries:', error);
                showAlert('فشل في تحميل بيانات الوقت من قاعدة البيانات، سيتم استخدام البيانات المحلية', 'warning');
                
                // Fallback to localStorage
                displayTimeRecords([...appState.timeRecords]);
            });
    } else {
        // No employee filter, use local data
        let filteredRecords = [...appState.timeRecords];
        
        if (filterDateFrom) {
            filteredRecords = filteredRecords.filter(record => record.date >= filterDateFrom);
        }
        
        if (filterDateTo) {
            filteredRecords = filteredRecords.filter(record => record.date <= filterDateTo);
        }
        
        displayTimeRecords(filteredRecords);
    }
}

// Display time records in the table
function displayTimeRecords(records) {
    const tableBody = document.getElementById('time-records-table-body');
    if (!tableBody) return;
    
    // Sort by date (newest first)
    records.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Generate table rows
    tableBody.innerHTML = records.length > 0 ? 
        records.map(record => `
            <tr>
                <td>${record.employeeName}</td>
                <td>${formatDate(record.date)}</td>
                <td>${record.timeIn || '-'}</td>
                <td>${record.timeOut || '-'}</td>
                <td>${record.workHours > 0 ? record.workHours.toFixed(2) : '-'}</td>
                <td>${record.overtimeHours > 0 ? record.overtimeHours.toFixed(2) : '-'}</td>
                <td>${record.notes || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editTimeRecord('${record.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger" onclick="deleteTimeRecord('${record.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('') : 
        '<tr><td colspan="8" class="text-center">لا توجد سجلات</td></tr>';
}


// Filter time records
function filterTimeRecords() {
    loadTimeRecordsTable();
}

// Edit time record
function editTimeRecord(recordId) {
    const record = appState.timeRecords.find(r => r.id === recordId);
    if (!record) return;
    
    // Populate time tracking form
    document.getElementById('time-tracking-employee-select').value = record.employeeCode;
    document.getElementById('time-tracking-date').value = record.date;
    document.getElementById('time-in').value = record.timeIn;
    document.getElementById('time-out').value = record.timeOut;
    document.getElementById('time-tracking-notes').value = record.notes;
    
    // Scroll to form
    document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
    
    // Show notification
    showAlert('تم تحميل بيانات السجل للتعديل', 'info');
}

// Delete time record
function deleteTimeRecord(recordId) {
    if (confirm('هل أنت متأكد من حذف هذا السجل؟')) {
        // Delete from Supabase via API
        fetch(`/api/time-entries/${recordId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('فشل حذف السجل من قاعدة البيانات');
            }
            // Remove from local state
            appState.timeRecords = appState.timeRecords.filter(r => r.id !== recordId);
            saveToLocalStorage('timeRecords', appState.timeRecords);
            loadTimeRecordsTable();
            showAlert('تم حذف السجل بنجاح', 'success');
        })
        .catch(error => {
            console.error('Error deleting time entry:', error);
            showAlert('حدث خطأ أثناء حذف السجل من قاعدة البيانات', 'danger');
        });
    }
}

// Generate work hours report
function generateWorkHoursReport() {
    const employeeSelect = document.getElementById('report-employee-select');
    const monthInput = document.getElementById('report-month');
    const reportContainer = document.getElementById('work-hours-report-container');
    
    if (!employeeSelect.value || !monthInput.value) {
        reportContainer.innerHTML = '<div class="alert alert-warning">الرجاء اختيار الموظف والشهر</div>';
        return;
    }
    
    // Get selected month details
    const [year, month] = monthInput.value.split('-');
    const startDate = new Date(year, parseInt(month) - 1, 1);
    const endDate = new Date(year, parseInt(month), 0); // Last day of month
    
    // Filter records for selected employee and month
    const employeeRecords = appState.timeRecords.filter(record => 
        record.employeeCode === employeeSelect.value &&
        new Date(record.date) >= startDate &&
        new Date(record.date) <= endDate
    );
    
    // Sort by date
    employeeRecords.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Calculate totals
    const totalWorkHours = employeeRecords.reduce((sum, record) => sum + (record.workHours || 0), 0);
    const totalOvertimeHours = employeeRecords.reduce((sum, record) => sum + (record.overtimeHours || 0), 0);
    
    // Get employee details
    const employee = appState.employees.find(emp => emp.code === employeeSelect.value);
    
    // Generate report HTML
    reportContainer.innerHTML = `
        <div class="card mt-3">
            <div class="card-header bg-primary text-white">
                <h5 class="mb-0">تقرير ساعات العمل - ${employee ? employee.name : ''}</h5>
                <div class="small">${startDate.toLocaleDateString('ar-SA')} إلى ${endDate.toLocaleDateString('ar-SA')}</div>
            </div>
            <div class="card-body">
                <div class="row mb-3">
                    <div class="col-md-4">
                        <div class="card bg-light">
                            <div class="card-body text-center">
                                <h6>إجمالي ساعات العمل</h6>
                                <h3>${totalWorkHours.toFixed(2)}</h3>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card bg-light">
                            <div class="card-body text-center">
                                <h6>إجمالي ساعات الأوفرتايم</h6>
                                <h3>${totalOvertimeHours.toFixed(2)}</h3>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card bg-light">
                            <div class="card-body text-center">
                                <h6>عدد أيام العمل</h6>
                                <h3>${employeeRecords.length}</h3>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="table-responsive">
                    <table class="table table-striped table-bordered">
                        <thead>
                            <tr>
                                <th>التاريخ</th>
                                <th>وقت الحضور</th>
                                <th>وقت الانصراف</th>
                                <th>ساعات العمل</th>
                                <th>الأوفرتايم</th>
                                <th>ملاحظات</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${employeeRecords.length > 0 ? 
                                employeeRecords.map(record => `
                                    <tr>
                                        <td>${formatDate(record.date)}</td>
                                        <td>${record.timeIn || '-'}</td>
                                        <td>${record.timeOut || '-'}</td>
                                        <td>${record.workHours > 0 ? record.workHours.toFixed(2) : '-'}</td>
                                        <td>${record.overtimeHours > 0 ? record.overtimeHours.toFixed(2) : '-'}</td>
                                        <td>${record.notes || '-'}</td>
                                    </tr>
                                `).join('') : 
                                '<tr><td colspan="6" class="text-center">لا توجد سجلات</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// Export work hours report
function exportWorkHoursReport() {
    const reportContainer = document.getElementById('work-hours-report-container');
    if (!reportContainer.innerHTML.trim()) {
        showAlert('الرجاء إنشاء التقرير أولاً', 'warning');
        return;
    }
    
    const employeeSelect = document.getElementById('report-employee-select');
    const monthInput = document.getElementById('report-month');
    
    // Get employee name
    const employee = appState.employees.find(emp => emp.code === employeeSelect.value);
    const employeeName = employee ? employee.name : 'موظف';
    
    // Format month name
    const [year, month] = monthInput.value.split('-');
    const monthDate = new Date(year, parseInt(month) - 1, 1);
    const monthName = monthDate.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' });
    
    // Create a clone of the report for printing
    const reportClone = reportContainer.cloneNode(true);
    
    // Add print header
    const printHeader = document.createElement('div');
    printHeader.className = 'print-header text-center mb-4';
    printHeader.innerHTML = `
        <h2>تقرير ساعات العمل</h2>
        <h4>${employeeName} - ${monthName}</h4>
    `;
    
    // Create print container
    const printContainer = document.createElement('div');
    printContainer.className = 'print-container';
    printContainer.appendChild(printHeader);
    printContainer.appendChild(reportClone);
    
    // Generate PDF
    html2pdf()
        .from(printContainer)
        .set({
            margin: 10,
            filename: `تقرير_ساعات_العمل_${employeeName}_${monthInput.value}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .save()
        .then(() => {
            showAlert('تم تصدير التقرير بنجاح', 'success');
        })
        .catch(err => {
            console.error('Error exporting report:', err);
            showAlert('حدث خطأ أثناء تصدير التقرير', 'danger');
        });
}

// Helper function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA');
}

// Save time record
function saveTimeRecord() {
    const employeeSelect = document.getElementById('time-tracking-employee-select');
    const dateInput = document.getElementById('time-tracking-date');
    const timeInInput = document.getElementById('time-in');
    const timeOutInput = document.getElementById('time-out');
    const notesInput = document.getElementById('time-tracking-notes');
    
    // Validate inputs
    if (!employeeSelect.value) {
        showAlert('الرجاء اختيار الموظف', 'warning');
        return;
    }
    
    if (!dateInput.value) {
        showAlert('الرجاء تحديد التاريخ', 'warning');
        return;
    }
    
    if (!timeInInput.value && !timeOutInput.value) {
        showAlert('الرجاء تحديد وقت الحضور أو الانصراف على الأقل', 'warning');
        return;
    }
    
    // Calculate work hours if both time in and time out are provided
    let workHours = 0;
    if (timeInInput.value && timeOutInput.value) {
        const timeIn = new Date(`${dateInput.value}T${timeInInput.value}`);
        const timeOut = new Date(`${dateInput.value}T${timeOutInput.value}`);
        
        // Handle case where time out is on the next day
        if (timeOut < timeIn) {
            timeOut.setDate(timeOut.getDate() + 1);
        }
        
        workHours = (timeOut - timeIn) / (1000 * 60 * 60);
    }
    
    // Get employee details
    const employee = appState.employees.find(emp => emp.code === employeeSelect.value);
    
    // Create time record object
    const timeRecord = {
        id: Date.now().toString(),
        employeeCode: employeeSelect.value,
        employeeName: employee ? employee.name : '',
        date: dateInput.value,
        timeIn: timeInInput.value,
        timeOut: timeOutInput.value,
        workHours: workHours,
        overtimeHours: 0,
        notes: notesInput.value
    };
    
    // Check if record for this employee and date already exists
    const existingRecordIndex = appState.timeRecords.findIndex(
        record => record.employeeCode === timeRecord.employeeCode && record.date === timeRecord.date
    );
    
    if (existingRecordIndex !== -1) {
        // Update existing record
        const existingRecord = appState.timeRecords[existingRecordIndex];
        
        // Keep overtime hours from existing record
        timeRecord.overtimeHours = existingRecord.overtimeHours;
        
        appState.timeRecords[existingRecordIndex] = timeRecord;
        showAlert('تم تحديث سجل الحضور والانصراف بنجاح', 'success');
    } else {
        // Add new record
        appState.timeRecords.push(timeRecord);
        showAlert('تم تسجيل الحضور والانصراف بنجاح', 'success');
    }
    
    // Save to Supabase via API
    try {
        // Create a time entry object for the API
        const timeEntryData = {
            employeeId: employee.id, // Use the employee ID from Supabase
            checkIn: timeInInput.value ? new Date(`${dateInput.value}T${timeInInput.value}`).toISOString() : null,
            checkOut: timeOutInput.value ? new Date(`${dateInput.value}T${timeOutInput.value}`).toISOString() : null,
            totalHours: workHours,
            notes: notesInput.value
        };

        // Call the API to save the time entry
        fetch('/api/time-entries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(timeEntryData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('فشل حفظ البيانات في قاعدة البيانات');
            }
            return response.json();
        })
        .then(savedEntry => {
            // Update the local record with the ID from Supabase
            timeRecord.id = savedEntry.id;
            
            // Update local state for immediate UI update
            if (existingRecordIndex !== -1) {
                appState.timeRecords[existingRecordIndex] = timeRecord;
            } else {
                appState.timeRecords.push(timeRecord);
            }
            
            // Save to localStorage as backup
            saveToLocalStorage('timeRecords', appState.timeRecords);
            
            // Refresh the table
            loadTimeRecordsTable();
            
            // Clear form
            employeeSelect.value = '';
            timeInInput.value = '';
            timeOutInput.value = '';
            notesInput.value = '';
        })
        .catch(error => {
            console.error('Error saving to Supabase:', error);
            showAlert('حدث خطأ أثناء الحفظ في قاعدة البيانات، سيتم الحفظ محلياً فقط', 'warning');
            
            // Fallback to localStorage only
            if (existingRecordIndex !== -1) {
                appState.timeRecords[existingRecordIndex] = timeRecord;
            } else {
                appState.timeRecords.push(timeRecord);
            }
            saveToLocalStorage('timeRecords', appState.timeRecords);
            
            // Refresh the table
            loadTimeRecordsTable();
            
            // Clear form
            employeeSelect.value = '';
            timeInInput.value = '';
            timeOutInput.value = '';
            notesInput.value = '';
        });
    } catch (error) {
        console.error('Error preparing time entry data:', error);
        showAlert('حدث خطأ أثناء إعداد بيانات الوقت', 'danger');
    }
}

// Save overtime record
function saveOvertimeRecord() {
    const employeeSelect = document.getElementById('overtime-employee-select');
    const dateInput = document.getElementById('overtime-date');
    const overtimeHoursInput = document.getElementById('overtime-hours');
    const overtimeReasonInput = document.getElementById('overtime-reason');
    
    // Validate inputs
    if (!employeeSelect.value) {
        showAlert('الرجاء اختيار الموظف', 'warning');
        return;
    }
    
    if (!dateInput.value) {
        showAlert('الرجاء تحديد التاريخ', 'warning');
        return;
    }
    
    if (!overtimeHoursInput.value || parseFloat(overtimeHoursInput.value) <= 0) {
        showAlert('الرجاء تحديد عدد ساعات الأوفرتايم', 'warning');
        return;
    }
    
    // Get employee details
    const employee = appState.employees.find(emp => emp.code === employeeSelect.value);
    
    // Check if time record for this employee and date already exists
    const existingRecordIndex = appState.timeRecords.findIndex(
        record => record.employeeCode === employeeSelect.value && record.date === dateInput.value
    );
    
    if (existingRecordIndex !== -1) {
        // Update existing record with overtime information
        appState.timeRecords[existingRecordIndex].overtimeHours = parseFloat(overtimeHoursInput.value);
        
        // Append overtime reason to notes if provided
        if (overtimeReasonInput.value) {
            const currentNotes = appState.timeRecords[existingRecordIndex].notes;
            appState.timeRecords[existingRecordIndex].notes = currentNotes ? 
                `${currentNotes} | أوفرتايم: ${overtimeReasonInput.value}` : 
                `أوفرتايم: ${overtimeReasonInput.value}`;
        }
        
        showAlert('تم تحديث سجل الأوفرتايم بنجاح', 'success');
    } else {
        // Create new time record with only overtime information
        const timeRecord = {
            id: Date.now().toString(),
            employeeCode: employeeSelect.value,
            employeeName: employee ? employee.name : '',
            date: dateInput.value,
            timeIn: '',
            timeOut: '',
            workHours: 0,
            overtimeHours: parseFloat(overtimeHoursInput.value),
            notes: overtimeReasonInput.value ? `أوفرتايم: ${overtimeReasonInput.value}` : ''
        };
        
        appState.timeRecords.push(timeRecord);
        showAlert('تم تسجيل الأوفرتايم بنجاح', 'success');
    }
    
    // Save to localStorage
    saveToLocalStorage('timeRecords', appState.timeRecords);
    
    // Refresh the table
    loadTimeRecordsTable();
    
    // Clear form
    overtimeHoursInput.value = '';
    overtimeReasonInput.value = '';
}

// Load time records table
function loadTimeRecordsTable() {
    const tableBody = document.getElementById('time-records-table-body');
    if (!tableBody) return;
    
    // Show loading indicator
    tableBody.innerHTML = '<tr><td colspan="8" class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></td></tr>';
    
    // Get filter values
    const filterEmployee = document.getElementById('filter-employee')?.value || '';
    const filterDateFrom = document.getElementById('filter-date-from')?.value || '';
    const filterDateTo = document.getElementById('filter-date-to')?.value || '';
    
    // Get employee ID if filter is set
    let employeeId = null;
    if (filterEmployee) {
        const employee = appState.employees.find(emp => emp.code === filterEmployee);
        if (employee) {
            employeeId = employee.id;
        }
    }
    
    // Fetch time entries from Supabase via API
    let apiUrl = '/api/time-entries/';
    
    if (employeeId) {
        apiUrl += employeeId;
        
        // Add date filters if provided
        const queryParams = [];
        if (filterDateFrom) {
            queryParams.push(`startDate=${filterDateFrom}`);
        }
        if (filterDateTo) {
            queryParams.push(`endDate=${filterDateTo}`);
        }
        
        if (queryParams.length > 0) {
            apiUrl += '?' + queryParams.join('&');
        }
        
        // Fetch from API
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch time entries');
                }
                return response.json();
            })
            .then(timeEntries => {
                // Update local state
                appState.timeRecords = timeEntries.map(entry => ({
                    id: entry.id,
                    employeeCode: filterEmployee,
                    employeeName: appState.employees.find(emp => emp.id === entry.employee_id)?.name || 'Unknown',
                    date: new Date(entry.check_in).toISOString().split('T')[0],
                    timeIn: entry.check_in ? new Date(entry.check_in).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : '',
                    timeOut: entry.check_out ? new Date(entry.check_out).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : '',
                    workHours: entry.total_hours || 0,
                    overtimeHours: 0, // Overtime not tracked in Supabase yet
                    notes: entry.notes || ''
                }));
                
                // Save to localStorage as backup
                saveToLocalStorage('timeRecords', appState.timeRecords);
                
                // Display the records
                displayTimeRecords(appState.timeRecords);
            })
            .catch(error => {
                console.error('Error fetching time entries:', error);
                showAlert('فشل في تحميل بيانات الوقت من قاعدة البيانات، سيتم استخدام البيانات المحلية', 'warning');
                
                // Fallback to localStorage
                displayTimeRecords([...appState.timeRecords]);
            });
    } else {
        // No employee filter, use local data
        let filteredRecords = [...appState.timeRecords];
        
        if (filterDateFrom) {
            filteredRecords = filteredRecords.filter(record => record.date >= filterDateFrom);
        }
        
        if (filterDateTo) {
            filteredRecords = filteredRecords.filter(record => record.date <= filterDateTo);
        }
        
        displayTimeRecords(filteredRecords);
    }
}

// Display time records in the table
function displayTimeRecords(records) {
    const tableBody = document.getElementById('time-records-table-body');
    if (!tableBody) return;
    
    // Sort by date (newest first)
    records.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Generate table rows
    tableBody.innerHTML = records.length > 0 ? 
        records.map(record => `
            <tr>
                <td>${record.employeeName}</td>
                <td>${formatDate(record.date)}</td>
                <td>${record.timeIn || '-'}</td>
                <td>${record.timeOut || '-'}</td>
                <td>${record.workHours > 0 ? record.workHours.toFixed(2) : '-'}</td>
                <td>${record.overtimeHours > 0 ? record.overtimeHours.toFixed(2) : '-'}</td>
                <td>${record.notes || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editTimeRecord('${record.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger" onclick="deleteTimeRecord('${record.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('') : 
        '<tr><td colspan="8" class="text-center">لا توجد سجلات</td></tr>';
}


// Filter time records
function filterTimeRecords() {
    loadTimeRecordsTable();
}

// Edit time record
function editTimeRecord(recordId) {
    const record = appState.timeRecords.find(r => r.id === recordId);
    if (!record) return;
    
    // Populate time tracking form
    document.getElementById('time-tracking-employee-select').value = record.employeeCode;
    document.getElementById('time-tracking-date').value = record.date;
    document.getElementById('time-in').value = record.timeIn;
    document.getElementById('time-out').value = record.timeOut;
    document.getElementById('time-tracking-notes').value = record.notes;
    
    // Scroll to form
    document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
    
    // Show notification
    showAlert('تم تحميل بيانات السجل للتعديل', 'info');
}

// Delete time record
function deleteTimeRecord(recordId) {
    if (confirm('هل أنت متأكد من حذف هذا السجل؟')) {
        // Delete from Supabase via API
        fetch(`/api/time-entries/${recordId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('فشل حذف السجل من قاعدة البيانات');
            }
            // Remove from local state
            appState.timeRecords = appState.timeRecords.filter(r => r.id !== recordId);
            saveToLocalStorage('timeRecords', appState.timeRecords);
            loadTimeRecordsTable();
            showAlert('تم حذف السجل بنجاح', 'success');
        })
        .catch(error => {
            console.error('Error deleting time entry:', error);
            showAlert('حدث خطأ أثناء حذف السجل من قاعدة البيانات', 'danger');
        });
    }
}

// Generate work hours report
function generateWorkHoursReport() {
    const employeeSelect = document.getElementById('report-employee-select');
    const monthInput = document.getElementById('report-month');
    const reportContainer = document.getElementById('work-hours-report-container');
    
    if (!employeeSelect.value || !monthInput.value) {
        reportContainer.innerHTML = '<div class="alert alert-warning">الرجاء اختيار الموظف والشهر</div>';
        return;
    }
    
    // Get selected month details
    const [year, month] = monthInput.value.split('-');
    const startDate = new Date(year, parseInt(month) - 1, 1);
    const endDate = new Date(year, parseInt(month), 0); // Last day of month
    
    // Filter records for selected employee and month
    const employeeRecords = appState.timeRecords.filter(record => 
        record.employeeCode === employeeSelect.value &&
        new Date(record.date) >= startDate &&
        new Date(record.date) <= endDate
    );
    
    // Sort by date
    employeeRecords.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Calculate totals
    const totalWorkHours = employeeRecords.reduce((sum, record) => sum + (record.workHours || 0), 0);
    const totalOvertimeHours = employeeRecords.reduce((sum, record) => sum + (record.overtimeHours || 0), 0);
    
    // Get employee details
    const employee = appState.employees.find(emp => emp.code === employeeSelect.value);
    
    // Generate report HTML
    reportContainer.innerHTML = `
        <div class="card mt-3">
            <div class="card-header bg-primary text-white">
                <h5 class="mb-0">تقرير ساعات العمل - ${employee ? employee.name : ''}</h5>
                <div class="small">${startDate.toLocaleDateString('ar-SA')} إلى ${endDate.toLocaleDateString('ar-SA')}</div>
            </div>
            <div class="card-body">
                <div class="row mb-3">
                    <div class="col-md-4">
                        <div class="card bg-light">
                            <div class="card-body text-center">
                                <h6>إجمالي ساعات العمل</h6>
                                <h3>${totalWorkHours.toFixed(2)}</h3>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card bg-light">
                            <div class="card-body text-center">
                                <h6>إجمالي ساعات الأوفرتايم</h6>
                                <h3>${totalOvertimeHours.toFixed(2)}</h3>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card bg-light">
                            <div class="card-body text-center">
                                <h6>عدد أيام العمل</h6>
                                <h3>${employeeRecords.length}</h3>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="table-responsive">
                    <table class="table table-striped table-bordered">
                        <thead>
                            <tr>
                                <th>التاريخ</th>
                                <th>وقت الحضور</th>
                                <th>وقت الانصراف</th>
                                <th>ساعات العمل</th>
                                <th>الأوفرتايم</th>
                                <th>ملاحظات</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${employeeRecords.length > 0 ? 
                                employeeRecords.map(record => `
                                    <tr>
                                        <td>${formatDate(record.date)}</td>
                                        <td>${record.timeIn || '-'}</td>
                                        <td>${record.timeOut || '-'}</td>
                                        <td>${record.workHours > 0 ? record.workHours.toFixed(2) : '-'}</td>
                                        <td>${record.overtimeHours > 0 ? record.overtimeHours.toFixed(2) : '-'}</td>
                                        <td>${record.notes || '-'}</td>
                                    </tr>
                                `).join('') : 
                                '<tr><td colspan="6" class="text-center">لا توجد سجلات</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// Export work hours report
function exportWorkHoursReport() {
    const reportContainer = document.getElementById('work-hours-report-container');
    if (!reportContainer.innerHTML.trim()) {
        showAlert('الرجاء إنشاء التقرير أولاً', 'warning');
        return;
    }
    
    const employeeSelect = document.getElementById('report-employee-select');
    const monthInput = document.getElementById('report-month');
    
    // Get employee name
    const employee = appState.employees.find(emp => emp.code === employeeSelect.value);
    const employeeName = employee ? employee.name : 'موظف';
    
    // Format month name
    const [year, month] = monthInput.value.split('-');
    const monthDate = new Date(year, parseInt(month) - 1, 1);
    const monthName = monthDate.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' });
    
    // Create a clone of the report for printing
    const reportClone = reportContainer.cloneNode(true);
    
    // Add print header
    const printHeader = document.createElement('div');
    printHeader.className = 'print-header text-center mb-4';
    printHeader.innerHTML = `
        <h2>تقرير ساعات العمل</h2>
        <h4>${employeeName} - ${monthName}</h4>
    `;
    
    // Create print container
    const printContainer = document.createElement('div');
    printContainer.className = 'print-container';
    printContainer.appendChild(printHeader);
    printContainer.appendChild(reportClone);
    
    // Generate PDF
    html2pdf()
        .from(printContainer)
        .set({
            margin: 10,
            filename: `تقرير_ساعات_العمل_${employeeName}_${monthInput.value}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .save()
        .then(() => {
            showAlert('تم تصدير التقرير بنجاح', 'success');
        })
        .catch(err => {
            console.error('Error exporting report:', err);
            showAlert('حدث خطأ أثناء تصدير التقرير', 'danger');
        });
}

// Helper function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA');
}