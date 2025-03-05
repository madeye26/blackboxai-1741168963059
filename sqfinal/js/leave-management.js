// Leave Management System

// Global state for leave management
if (!appState.leaveRequests) {
    appState.leaveRequests = [];
}

// Global state for absences
if (!appState.absenceRecords) {
    appState.absenceRecords = [];
}

// Leave types
const leaveTypes = [
    { id: 'annual', name: 'إجازة سنوية', color: 'primary', icon: 'umbrella-beach' },
    { id: 'sick', name: 'إجازة مرضية', color: 'danger', icon: 'hospital' },
    { id: 'emergency', name: 'إجازة طارئة', color: 'warning', icon: 'exclamation-circle' },
    { id: 'unpaid', name: 'إجازة بدون راتب', color: 'secondary', icon: 'money-bill-slash' },
    { id: 'absence', name: 'غياب', color: 'danger', icon: 'user-slash' },
    { id: 'other', name: 'إجازة أخرى', color: 'info', icon: 'calendar-day' }
];

// Leave status
const leaveStatus = {
    pending: { name: 'قيد الانتظار', color: 'warning' },
    approved: { name: 'تمت الموافقة', color: 'success' },
    rejected: { name: 'مرفوضة', color: 'danger' },
    cancelled: { name: 'ملغية', color: 'secondary' }
};

// Load Leave Management View
function loadLeaveManagementView() {
    const mainContent = document.getElementById('main-content');
    
    mainContent.innerHTML = `
        <div class="form-container">
            <h3 class="mb-4">إدارة الإجازات</h3>
            
            <ul class="nav nav-tabs mb-4" id="leaveManagementTabs" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="leave-requests-tab" data-bs-toggle="tab" data-bs-target="#leave-requests" type="button" role="tab" aria-controls="leave-requests" aria-selected="true">
                        <i class="fas fa-clipboard-list me-2"></i>طلبات الإجازات
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="new-leave-tab" data-bs-toggle="tab" data-bs-target="#new-leave" type="button" role="tab" aria-controls="new-leave" aria-selected="false">
                        <i class="fas fa-plus-circle me-2"></i>طلب إجازة جديدة
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="absence-tab" data-bs-toggle="tab" data-bs-target="#absence" type="button" role="tab" aria-controls="absence" aria-selected="false">
                        <i class="fas fa-user-slash me-2"></i>تسجيل الغياب
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="leave-balance-tab" data-bs-toggle="tab" data-bs-target="#leave-balance" type="button" role="tab" aria-controls="leave-balance" aria-selected="false">
                        <i class="fas fa-calculator me-2"></i>رصيد الإجازات
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="leave-calendar-tab" data-bs-toggle="tab" data-bs-target="#leave-calendar" type="button" role="tab" aria-controls="leave-calendar" aria-selected="false">
                        <i class="fas fa-calendar-alt me-2"></i>تقويم الإجازات
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="absence-report-tab" data-bs-toggle="tab" data-bs-target="#absence-report" type="button" role="tab" aria-controls="absence-report" aria-selected="false">
                        <i class="fas fa-file-alt me-2"></i>تقرير الغياب
                    </button>
                </li>
            </ul>
            
            <div class="tab-content" id="leaveManagementTabContent">
                <!-- Leave Requests Tab -->
                <div class="tab-pane fade show active" id="leave-requests" role="tabpanel" aria-labelledby="leave-requests-tab">
                    <div class="card">
                        <div class="card-body">
                            <div class="row mb-3">
                                <div class="col-md-4">
                                    <label class="form-label">تصفية حسب الموظف</label>
                                    <select class="form-select" id="filter-leave-employee" onchange="filterLeaveRequests()">
                                        <option value="">جميع الموظفين</option>
                                        ${generateEmployeeOptions()}
                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">تصفية حسب النوع</label>
                                    <select class="form-select" id="filter-leave-type" onchange="filterLeaveRequests()">
                                        <option value="">جميع أنواع الإجازات</option>
                                        ${leaveTypes.map(type => `<option value="${type.id}">${type.name}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">تصفية حسب الحالة</label>
                                    <select class="form-select" id="filter-leave-status" onchange="filterLeaveRequests()">
                                        <option value="">جميع الحالات</option>
                                        ${Object.entries(leaveStatus).map(([key, value]) => `<option value="${key}">${value.name}</option>`).join('')}
                                    </select>
                                </div>
                            </div>
                            <div class="table-responsive">
                                <table class="table table-striped table-hover">
                                    <thead>
                                        <tr>
                                            <th>الموظف</th>
                                            <th>نوع الإجازة</th>
                                            <th>من تاريخ</th>
                                            <th>إلى تاريخ</th>
                                            <th>عدد الأيام</th>
                                            <th>الحالة</th>
                                            <th>ملاحظات</th>
                                            <th>الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody id="leave-requests-table-body">
                                        <!-- Leave requests will be loaded here -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- New Leave Request Tab -->
                <div class="tab-pane fade" id="new-leave" role="tabpanel" aria-labelledby="new-leave-tab">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">طلب إجازة جديدة</h5>
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label class="form-label">اختر الموظف</label>
                                    <select class="form-select" id="leave-employee-select">
                                        <option value="">-- اختر الموظف --</option>
                                        ${generateEmployeeOptions()}
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">نوع الإجازة</label>
                                    <select class="form-select" id="leave-type-select">
                                        <option value="">-- اختر نوع الإجازة --</option>
                                        ${leaveTypes.filter(type => type.id !== 'absence').map(type => `<option value="${type.id}">${type.name}</option>`).join('')}
                                    </select>
                                </div>
                            </div>
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label class="form-label">تاريخ البداية</label>
                                    <input type="date" class="form-control" id="leave-start-date" onchange="calculateLeaveDays()">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">تاريخ النهاية</label>
                                    <input type="date" class="form-control" id="leave-end-date" onchange="calculateLeaveDays()">
                                </div>
                            </div>
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label class="form-label">عدد أيام الإجازة</label>
                                    <input type="number" class="form-control" id="leave-days" readonly>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">حالة الطلب</label>
                                    <select class="form-select" id="leave-status-select">
                                        <option value="pending">قيد الانتظار</option>
                                        <option value="approved">تمت الموافقة</option>
                                        <option value="rejected">مرفوضة</option>
                                    </select>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">سبب الإجازة / ملاحظات</label>
                                <textarea class="form-control" id="leave-reason" rows="3"></textarea>
                            </div>
                            <button class="btn btn-primary" onclick="saveLeaveRequest()">حفظ طلب الإجازة</button>
                        </div>
                    </div>
                </div>
                
                <!-- Absence Tab -->
                <div class="tab-pane fade" id="absence" role="tabpanel" aria-labelledby="absence-tab">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">تسجيل الغياب</h5>
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle me-2"></i>
                                استخدم هذا النموذج لتسجيل غياب الموظفين بسرعة
                            </div>
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label class="form-label">اختر الموظف</label>
                                    <select class="form-select" id="absence-employee-select">
                                        <option value="">-- اختر الموظف --</option>
                                        ${generateEmployeeOptions()}
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">تاريخ الغياب</label>
                                    <input type="date" class="form-control" id="absence-date" value="${new Date().toISOString().split('T')[0]}">
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">سبب الغياب</label>
                                <textarea class="form-control" id="absence-reason" rows="2" placeholder="اختياري"></textarea>
                            </div>
                            <button class="btn btn-danger" onclick="saveAbsenceRecord()">تسجيل الغياب</button>
                        </div>
                    </div>
                </div>
                
                <!-- Leave Balance Tab -->
                <div class="tab-pane fade" id="leave-balance" role="tabpanel" aria-labelledby="leave-balance-tab">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">رصيد الإجازات</h5>
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label class="form-label">اختر الموظف</label>
                                    <select class="form-select" id="balance-employee-select" onchange="showLeaveBalance()">
                                        <option value="">-- اختر الموظف --</option>
                                        ${generateEmployeeOptions()}
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">السنة</label>
                                    <select class="form-select" id="balance-year-select" onchange="showLeaveBalance()">
                                        <option value="${new Date().getFullYear()}">${new Date().getFullYear()}</option>
                                        <option value="${new Date().getFullYear() - 1}">${new Date().getFullYear() - 1}</option>
                                        <option value="${new Date().getFullYear() + 1}">${new Date().getFullYear() + 1}</option>
                                    </select>
                                </div>
                            </div>
                            <div id="leave-balance-container">
                                <!-- Leave balance will be shown here -->
                                <div class="alert alert-info">الرجاء اختيار موظف لعرض رصيد الإجازات</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Leave Calendar Tab -->
                <div class="tab-pane fade" id="leave-calendar" role="tabpanel" aria-labelledby="leave-calendar-tab">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">تقويم الإجازات</h5>
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle me-2"></i>
                                يعرض هذا التقويم جميع الإجازات المعتمدة للموظفين
                            </div>
                            <div id="leave-calendar-container" class="mt-3">
                                <!-- Calendar will be shown here -->
                                <div class="calendar-placeholder">
                                    <div class="calendar-header d-flex justify-content-between align-items-center mb-3">
                                        <button class="btn btn-sm btn-outline-primary"><i class="fas fa-chevron-right"></i></button>
                                        <h5 class="mb-0">أغسطس 2023</h5>
                                        <button class="btn btn-sm btn-outline-primary"><i class="fas fa-chevron-left"></i></button>
                                    </div>
                                    <div class="calendar-grid">
                                        <!-- Calendar content will be generated here -->
                                        <div class="text-center p-5">
                                            <i class="fas fa-calendar-alt fa-3x text-muted mb-3"></i>
                                            <p>سيتم عرض تقويم الإجازات هنا</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Absence Report Tab -->
                <div class="tab-pane fade" id="absence-report" role="tabpanel" aria-labelledby="absence-report-tab">
                    <div class="card mb-4">
                        <div class="card-body">
                            <h5 class="card-title">تقرير الغياب</h5>
                            <div class="row mb-3">
                                <div class="col-md-4">
                                    <label class="form-label">تصفية حسب الموظف</label>
                                    <select class="form-select" id="filter-absence-employee" onchange="filterAbsenceRecords()">
                                        <option value="">جميع الموظفين</option>
                                        ${generateEmployeeOptions()}
                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">من تاريخ</label>
                                    <input type="date" class="form-control" id="filter-absence-date-from" onchange="filterAbsenceRecords()">
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">إلى تاريخ</label>
                                    <input type="date" class="form-control" id="filter-absence-date-to" onchange="filterAbsenceRecords()">
                                </div>
                            </div>
                            <div class="table-responsive">
                                <table class="table table-striped table-hover">
                                    <thead>
                                        <tr>
                                            <th>الموظف</th>
                                            <th>تاريخ الغياب</th>
                                            <th>سبب الغياب</th>
                                            <th>الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody id="absence-records-table-body">
                                        <!-- Absence records will be loaded here -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">ملخص الغياب حسب الموظف</h5>
                            <div class="row" id="absence-summary-container">
                                <!-- Absence summary will be loaded here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Initialize the leave requests table
    loadLeaveRequestsTable();
    
    // Set default date for new leave request
    const today = new Date();
    document.getElementById('leave-start-date').valueAsDate = today;
    
    // Set default end date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('leave-end-date').valueAsDate = tomorrow;
    
    // Calculate initial leave days
    calculateLeaveDays();
}

// Save leave request
function saveLeaveRequest() {
    const employeeSelect = document.getElementById('leave-employee-select');
    const leaveTypeSelect = document.getElementById('leave-type-select');
    const startDateInput = document.getElementById('leave-start-date');
    const endDateInput = document.getElementById('leave-end-date');
    const leaveDaysInput = document.getElementById('leave-days');
    const leaveStatusSelect = document.getElementById('leave-status-select');
    const leaveReasonInput = document.getElementById('leave-reason');
    
    // Validate inputs
    if (!employeeSelect.value) {
        showAlert('الرجاء اختيار الموظف', 'warning');
        return;
    }
    
    if (!leaveTypeSelect.value) {
        showAlert('الرجاء اختيار نوع الإجازة', 'warning');
        return;
    }
    
    if (!startDateInput.value || !endDateInput.value) {
        showAlert('الرجاء تحديد تاريخ البداية والنهاية', 'warning');
        return;
    }
    
    // Get employee details
    const employee = appState.employees.find(emp => emp.code === employeeSelect.value);
    
    // Get leave type details
    const leaveType = leaveTypes.find(type => type.id === leaveTypeSelect.value);
    
    // Create leave request object
    const leaveRequest = {
        id: Date.now().toString(),
        employeeCode: employeeSelect.value,
        employeeName: employee ? employee.name : '',
        leaveType: leaveTypeSelect.value,
        leaveTypeName: leaveType ? leaveType.name : '',
        startDate: startDateInput.value,
        endDate: endDateInput.value,
        days: parseInt(leaveDaysInput.value),
        status: leaveStatusSelect.value,
        reason: leaveReasonInput.value,
        createdAt: new Date().toISOString()
    };
    
    // Add to leave requests array
    appState.leaveRequests.push(leaveRequest);
    
    // Save to localStorage
    saveToLocalStorage('leaveRequests', appState.leaveRequests);
    
    // Show success message
    showAlert('تم حفظ طلب الإجازة بنجاح', 'success');
    
    // Refresh the table
    loadLeaveRequestsTable();
    
    // Clear form
    employeeSelect.value = '';
    leaveTypeSelect.value = '';
    leaveReasonInput.value = '';
    
    // Reset dates to default
    const today = new Date();
    startDateInput.valueAsDate = today;
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    endDateInput.valueAsDate = tomorrow;
    
    // Recalculate days
    calculateLeaveDays();
}

// Calculate leave days
function calculateLeaveDays() {
    const startDateInput = document.getElementById('leave-start-date');
    const endDateInput = document.getElementById('leave-end-date');
    const leaveDaysInput = document.getElementById('leave-days');
    
    if (startDateInput.value && endDateInput.value) {
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);
        
        // Calculate difference in days
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include both start and end days
        
        leaveDaysInput.value = diffDays;
    } else {
        leaveDaysInput.value = 0;
    }
}

// Load leave requests table
function loadLeaveRequestsTable() {
    const tableBody = document.getElementById('leave-requests-table-body');
    if (!tableBody) return;
    
    // Get filter values
    const filterEmployee = document.getElementById('filter-leave-employee')?.value || '';
    const filterType = document.getElementById('filter-leave-type')?.value || '';
    const filterStatus = document.getElementById('filter-leave-status')?.value || '';
    
    // Filter requests
    let filteredRequests = [...appState.leaveRequests];
    
    if (filterEmployee) {
        filteredRequests = filteredRequests.filter(request => request.employeeCode === filterEmployee);
    }
    
    if (filterType) {
        filteredRequests = filteredRequests.filter(request => request.leaveType === filterType);
    }
    
    if (filterStatus) {
        filteredRequests = filteredRequests.filter(request => request.status === filterStatus);
    }
    
    // Sort by date (newest first)
    filteredRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Generate table rows
    tableBody.innerHTML = filteredRequests.length > 0 ? 
        filteredRequests.map(request => {
            const leaveType = leaveTypes.find(type => type.id === request.leaveType);
            const status = leaveStatus[request.status];
            
            return `
                <tr>
                    <td>${request.employeeName}</td>
                    <td>
                        <span class="badge bg-${leaveType?.color || 'secondary'}">
                            <i class="fas fa-${leaveType?.icon || 'calendar'} me-1"></i>
                            ${request.leaveTypeName}
                        </span>
                    </td>
                    <td>${formatDate(request.startDate)}</td>
                    <td>${formatDate(request.endDate)}</td>
                    <td>${request.days}</td>
                    <td><span class="badge bg-${status?.color || 'secondary'}">${status?.name || request.status}</span></td>
                    <td>${request.reason || '-'}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="editLeaveRequest('${request.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="deleteLeaveRequest('${request.id}')"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
        }).join('') : 
        '<tr><td colspan="8" class="text-center">لا توجد طلبات إجازة</td></tr>';
}

// Filter leave requests
function filterLeaveRequests() {
    loadLeaveRequestsTable();
}

// Edit leave request
function editLeaveRequest(requestId) {
    const request = appState.leaveRequests.find(r => r.id === requestId);
    if (!request) return;
    
    // Switch to new leave tab
    document.getElementById('new-leave-tab').click();
    
    // Populate form
    document.getElementById('leave-employee-select').value = request.employeeCode;
    document.getElementById('leave-type-select').value = request.leaveType;
    document.getElementById('leave-start-date').value = request.startDate;
    document.getElementById('leave-end-date').value = request.endDate;
    document.getElementById('leave-days').value = request.days;
    document.getElementById('leave-status-select').value = request.status;
    document.getElementById('leave-reason').value = request.reason;
    
    // Remove the old request
    appState.leaveRequests = appState.leaveRequests.filter(r => r.id !== requestId);
    saveToLocalStorage('leaveRequests', appState.leaveRequests);
    
    // Show notification
    showAlert('تم تحميل بيانات الإجازة للتعديل', 'info');
}

// Delete leave request
function deleteLeaveRequest(requestId) {
    if (confirm('هل أنت متأكد من حذف طلب الإجازة هذا؟')) {
        appState.leaveRequests = appState.leaveRequests.filter(r => r.id !== requestId);
        saveToLocalStorage('leaveRequests', appState.leaveRequests);
        loadLeaveRequestsTable();
        showAlert('تم حذف طلب الإجازة بنجاح', 'success');
    }
}

// Save absence record
function saveAbsenceRecord() {
    const employeeSelect = document.getElementById('absence-employee-select');
    const dateInput = document.getElementById('absence-date');
    const reasonInput = document.getElementById('absence-reason');
    
    // Validate inputs
    if (!employeeSelect.value) {
        showAlert('الرجاء اختيار الموظف', 'warning');
        return;
    }
    
    if (!dateInput.value) {
        showAlert('الرجاء تحديد تاريخ الغياب', 'warning');
        return;
    }
    
    // Get employee details
    const employee = appState.employees.find(emp => emp.code === employeeSelect.value);
    
    // Create absence record object
    const absenceRecord = {
        id: Date.now().toString(),
        employeeCode: employeeSelect.value,
        employeeName: employee ? employee.name : '',
        date: dateInput.value,
        reason: reasonInput.value,
        createdAt: new Date().toISOString()
    };
    
    // Add to absence records array
    if (!appState.absenceRecords) {
        appState.absenceRecords = [];
    }
    appState.absenceRecords.push(absenceRecord);
    
    // Save to localStorage
    saveToLocalStorage('absenceRecords', appState.absenceRecords);
    
    // Show success message
    showAlert('تم تسجيل الغياب بنجاح', 'success');
    
    // Clear form
    employeeSelect.value = '';
    reasonInput.value = '';
    
    // Reset date to today
    dateInput.value = new Date().toISOString().split('T')[0];
    
    // Load absence report if tab is active
    if (document.getElementById('absence-report').classList.contains('active')) {
        loadAbsenceReport();
    }
}

// Load absence report
function loadAbsenceReport() {
    const reportContainer = document.getElementById('absence-report');
    if (!reportContainer) return;
    
    // Get filter values
    const filterEmployee = document.getElementById('filter-absence-employee')?.value || '';
    const filterDateFrom = document.getElementById('filter-absence-date-from')?.value || '';
    const filterDateTo = document.getElementById('filter-absence-date-to')?.value || '';
    
    // Filter absence records
    let filteredRecords = appState.absenceRecords || [];
    
    if (filterEmployee) {
        filteredRecords = filteredRecords.filter(record => record.employeeCode === filterEmployee);
    }
    
    if (filterDateFrom) {
        filteredRecords = filteredRecords.filter(record => record.date >= filterDateFrom);
    }
    
    if (filterDateTo) {
        filteredRecords = filteredRecords.filter(record => record.date <= filterDateTo);
    }
    
    // Sort by date (newest first)
    filteredRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Generate table rows
    const tableBody = document.getElementById('absence-records-table-body');
    if (tableBody) {
        tableBody.innerHTML = filteredRecords.length > 0 ? 
            filteredRecords.map(record => {
                return `
                    <tr>
                        <td>${record.employeeName}</td>
                        <td>${formatDate(record.date)}</td>
                        <td>${record.reason || '-'}</td>
                        <td>
                            <button class="btn btn-sm btn-danger" onclick="deleteAbsenceRecord('${record.id}')"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `;
            }).join('') : 
            '<tr><td colspan="4" class="text-center">لا توجد سجلات غياب</td></tr>';
    }
    
    // Generate employee absence summary
    const summaryContainer = document.getElementById('absence-summary-container');
    if (summaryContainer) {
        // Group by employee
        const employeeAbsences = {};
        filteredRecords.forEach(record => {
            if (!employeeAbsences[record.employeeCode]) {
                employeeAbsences[record.employeeCode] = {
                    name: record.employeeName,
                    count: 0,
                    dates: []
                };
            }
            employeeAbsences[record.employeeCode].count++;
            employeeAbsences[record.employeeCode].dates.push(record.date);
        });
        
        // Generate summary HTML
        summaryContainer.innerHTML = Object.keys(employeeAbsences).length > 0 ?
            Object.values(employeeAbsences).map(emp => {
                return `
                    <div class="col-md-6 mb-3">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">${emp.name}</h5>
                                <p class="card-text">عدد مرات الغياب: <span class="badge bg-danger">${emp.count}</span></p>
                                <p class="card-text">آخر تاريخ غياب: ${formatDate(emp.dates.sort().pop())}</p>
                            </div>
                        </div>
                    </div>
                `;
            }).join('') :
            '<div class="col-12"><div class="alert alert-info">لا توجد سجلات غياب</div></div>';
    }
}

// Delete absence record
function deleteAbsenceRecord(recordId) {
    if (confirm('هل أنت متأكد من حذف سجل الغياب هذا؟')) {
        appState.absenceRecords = appState.absenceRecords.filter(r => r.id !== recordId);
        saveToLocalStorage('absenceRecords', appState.absenceRecords);
        loadAbsenceReport();
        showAlert('تم حذف سجل الغياب بنجاح', 'success');
    }
}

// Filter absence records
function filterAbsenceRecords() {
    loadAbsenceReport();
}

// Show leave balance
function showLeaveBalance() {
    const employeeSelect = document.getElementById('balance-employee-select');
    const yearSelect = document.getElementById('balance-year-select');
    const balanceContainer = document.getElementById('leave-balance-container');
    
    if (!employeeSelect.value) {
        balanceContainer.innerHTML = '<div class="alert alert-info">الرجاء اختيار موظف لعرض رصيد الإجازات</div>';
        return;
    }
    
    // Get employee details
    const employee = appState.employees.find(emp => emp.code === employeeSelect.value);
    if (!employee) {
        balanceContainer.innerHTML = '<div class="alert alert-warning">لم يتم العثور على بيانات الموظف</div>';
        return;
    }
    
    // Get selected year
    const selectedYear = parseInt(yearSelect.value);
    
    // Filter leave requests for this employee and year
    const employeeLeaves = appState.leaveRequests.filter(request => 
        request.employeeCode === employeeSelect.value && 
        request.status === 'approved' &&
        new Date(request.startDate).getFullYear() === selectedYear
    );
    
    // Calculate leave days by type
    const leaveDaysByType = {};
    leaveTypes.forEach(type => {
        leaveDaysByType[type.id] = {
            ...type,
            days: 0
        };
    });
    
    employeeLeaves.forEach(leave => {
        if (leaveDaysByType[leave.leaveType]) {
            leaveDaysByType[leave.leaveType].days += leave.days;
        }
    });
    
    // Default annual leave balance (21 days per year)
    const annualLeaveBalance = 21;
    const usedAnnualLeave = leaveDaysByType['annual'].days;
    const remainingAnnualLeave = annualLeaveBalance - usedAnnualLeave;
    
    // Generate balance HTML
    balanceContainer.innerHTML = `
        <div class="card mt-3">
            <div class="card-header bg-primary text-white">
                <h5 class="mb-0">رصيد الإجازات - ${employee.name}</h5>
                <div class="small">السنة: ${selectedYear}</div>
            </div>
            <div class="card-body">
                <div class="row mb-4">
                    <div class="col-md-4">
                        <div class="card bg-light">
                            <div class="card-body text-center">
                                <h6>الرصيد السنوي</h6>
                                <h3>${annualLeaveBalance} يوم</h3>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card bg-light">
                            <div class="card-body text-center">
                                <h6>الإجازات المستخدمة</h6>
                                <h3>${usedAnnualLeave} يوم</h3>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card bg-light">
                            <div class="card-body text-center">
                                <h6>الرصيد المتبقي</h6>
                                <h3 class="${remainingAnnualLeave < 0 ? 'text-danger' : ''}">                                    ${remainingAnnualLeave} يوم
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>
                
                <h5 class="mb-3">تفاصيل الإجازات حسب النوع</h5>
                <div class="table-responsive">
                    <table class="table table-striped table-bordered">
                        <thead>
                            <tr>
                                <th>نوع الإجازة</th>
                                <th>عدد الأيام المستخدمة</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.values(leaveDaysByType).map(type => `
                                <tr>
                                    <td>
                                        <span class="badge bg-${type.color}">
                                            <i class="fas fa-${type.icon} me-1"></i>
                                            ${type.name}
                                        </span>
                                    </td>
                                    <td>${type.days} يوم</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// Helper function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA');
}