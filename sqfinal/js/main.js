// Global state management
const appState = {
    employees: [],
    currentEmployee: null,
    advances: [],
    salaryReports: [],
    lastBackup: null
};

// Data validation schemas
const validationSchemas = {
    employee: {
        code: (value) => value && value.trim().length > 0 ? null : 'كود الموظف مطلوب',
        name: (value) => value && value.trim().length > 0 ? null : 'اسم الموظف مطلوب',
        basicSalary: (value) => value && value > 0 ? null : 'الراتب الأساسي يجب أن يكون أكبر من صفر',
        jobTitle: (value) => value && value.trim().length > 0 ? null : 'المسمى الوظيفي مطلوب'
    }
};

// Data backup and restore functions
function backupData() {
    try {
        const backup = {
            employees: appState.employees,
            advances: appState.advances,
            salaryReports: appState.salaryReports,
            timestamp: new Date().toISOString()
        };
        
        const backupStr = JSON.stringify(backup);
        const blob = new Blob([backupStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `payroll_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        appState.lastBackup = backup.timestamp;
        saveToLocalStorage('lastBackup', backup.timestamp);
        
        showAlert('تم حفظ نسخة احتياطية بنجاح', 'success');
    } catch (error) {
        console.error('Backup error:', error);
        showAlert('حدث خطأ أثناء حفظ النسخة الاحتياطية', 'danger');
    }
}

function restoreData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backup = JSON.parse(e.target.result);
            
            // Validate backup data structure
            if (!backup.employees || !backup.advances || !backup.salaryReports) {
                throw new Error('Invalid backup file structure');
            }
            
            // Restore data
            appState.employees = backup.employees;
            appState.advances = backup.advances;
            appState.salaryReports = backup.salaryReports;
            
            // Save to localStorage
            saveToLocalStorage('employees', backup.employees);
            saveToLocalStorage('advances', backup.advances);
            saveToLocalStorage('salaryReports', backup.salaryReports);
            
            showAlert('تم استعادة البيانات بنجاح', 'success');
            
            // Refresh current view
            handleNavigation(document.querySelector('.list-group-item.active').id);
        } catch (error) {
            console.error('Restore error:', error);
            showAlert('حدث خطأ أثناء استعادة البيانات', 'danger');
        }
    };
    reader.readAsText(file);
}

// Update connection status indicator
function updateConnectionStatus(isConnected) {
    const statusElement = document.querySelector('.connection-status');
    const statusText = document.getElementById('connection-status-text');
    
    if (isConnected) {
        statusElement.classList.add('connected');
        statusElement.classList.remove('disconnected');
        statusText.textContent = 'متصل بقاعدة البيانات';
    } else {
        statusElement.classList.add('disconnected');
        statusElement.classList.remove('connected');
        statusText.textContent = 'غير متصل - وضع غير متصل';
    }
}

// Check connection status periodically
function checkConnectionStatus() {
    const isOfflineMode = sessionStorage.getItem('offlineMode') === 'true';
    if (!isOfflineMode) {
        // Try to make a simple query to check connection
        fetch('/api/health-check')
            .then(response => {
                if (response.ok) {
                    updateConnectionStatus(true);
                } else {
                    throw new Error('Health check failed');
                }
            })
            .catch(() => {
                updateConnectionStatus(false);
                console.error('Database connection failed');
            });
    } else {
        updateConnectionStatus(false);
    }
}

// DOM Content Loaded Event Handler
document.addEventListener('DOMContentLoaded', function() {
    // Initialize sidebar toggle
    initializeSidebar();
    
    // Initialize navigation
    initializeNavigation();
    
    // Load initial view - Dashboard
    loadDashboard();
    
    // Load saved data from Supabase (with localStorage fallback)
    loadSavedData();
    
    // Add event listener for page visibility changes to refresh data when tab becomes visible again
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
            // Check if we need to force reload data (e.g., after adding a new employee)
            if (sessionStorage.getItem('forceReload') === 'true') {
                console.log('Force reloading data from Supabase');
                sessionStorage.removeItem('forceReload'); // Clear the flag
                loadSavedData(); // Reload data from Supabase
            }
        }
    });
    
    // Initialize performance optimizations
    if (window.performanceUtils && window.performanceUtils.initPerformanceOptimizations) {
        window.performanceUtils.initPerformanceOptimizations();
    }
    
    // Check connection status initially and every 30 seconds
    checkConnectionStatus();
    setInterval(checkConnectionStatus, 30000);
});

// Initialize Sidebar
function initializeSidebar() {
    const menuToggle = document.getElementById('menu-toggle');
    const wrapper = document.getElementById('wrapper');

    menuToggle?.addEventListener('click', function(e) {
        e.preventDefault();
        wrapper.classList.toggle('toggled');
    });
}

// Initialize Navigation
function initializeNavigation() {
    const tabs = document.querySelectorAll('.list-group-item');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active state
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Update page title
            document.querySelector('h2.fs-2').textContent = this.textContent.trim();
            
            // Load appropriate content
            handleNavigation(this.id);
        });
    });
}

// Load Dashboard
function loadDashboard() {
    const mainContent = document.getElementById('main-content');
    
    // Calculate dashboard statistics
    const totalEmployees = appState.employees.length;
    const totalSalaries = appState.employees.reduce((sum, emp) => sum + emp.basicSalary, 0);
    const totalAdvances = appState.advances ? appState.advances.reduce((sum, adv) => sum + adv.amount, 0) : 0;
    const pendingAdvances = appState.advances ? appState.advances.filter(adv => !adv.isPaid).length : 0;

    mainContent.innerHTML = `
        <div class="dashboard-container">
            <!-- Search Bar -->
            <div class="dashboard-search mb-4">
                <input type="text" class="form-control" id="dashboard-search-input" placeholder="البحث عن موظف أو تقرير...">
                <i class="fas fa-search"></i>
            </div>
            
            <!-- Stats Cards -->
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="stats-card bg-primary text-white">
                        <div class="stats-icon">
                            <i class="fas fa-users fa-2x"></i>
                        </div>
                        <div class="stats-info">
                            <h5>إجمالي الموظفين</h5>
                            <h3>${totalEmployees}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stats-card bg-success text-white">
                        <div class="stats-icon">
                            <i class="fas fa-money-bill-wave fa-2x"></i>
                        </div>
                        <div class="stats-info">
                            <h5>إجمالي الرواتب</h5>
                            <h3>${totalSalaries.toLocaleString()} ج.م</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stats-card bg-warning text-dark">
                        <div class="stats-icon">
                            <i class="fas fa-hand-holding-usd fa-2x"></i>
                        </div>
                        <div class="stats-info">
                            <h5>إجمالي السلف</h5>
                            <h3>${totalAdvances.toLocaleString()} ج.م</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stats-card bg-info text-white">
                        <div class="stats-icon">
                            <i class="fas fa-clock fa-2x"></i>
                        </div>
                        <div class="stats-info">
                            <h5>السلف المعلقة</h5>
                            <h3>${pendingAdvances}</h3>
                            <div class="notification-badge">
                                <span class="badge bg-danger">${pendingAdvances > 0 ? pendingAdvances : ''}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row mb-4">
                <div class="col-md-6">
                    <div class="quick-actions-card">
                        <h4 class="mb-3">إجراءات سريعة</h4>
                        <div class="d-grid gap-2">
                            <button class="btn btn-lg btn-outline-primary" onclick="loadEmployeeForm()">
                                <i class="fas fa-user-plus me-2"></i>إضافة موظف جديد
                            </button>
                            <button class="btn btn-lg btn-outline-success" onclick="loadPayrollView()">
                                <i class="fas fa-calculator me-2"></i>حساب راتب
                            </button>
                            <button class="btn btn-lg btn-outline-warning" onclick="loadAdvancesManagement()">
                                <i class="fas fa-hand-holding-usd me-2"></i>إضافة سلفة
                            </button>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="recent-activities-card">
                        <h4 class="mb-3">آخر النشاطات</h4>
                        <div class="list-group">
                            ${generateRecentActivities()}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Dashboard Charts -->
            <div class="dashboard-charts">
                <div class="row">
                    <div class="col-md-8">
                        <div class="dashboard-chart-card">
                            <h5 class="dashboard-chart-title">توزيع الرواتب الشهرية</h5>
                            <canvas id="salary-distribution-chart"></canvas>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="dashboard-chart-card">
                            <h5 class="dashboard-chart-title">حالة السلف</h5>
                            <canvas id="advances-status-chart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Initialize search functionality
    initDashboardSearch();
    
    // Initialize charts
    initializeChartLocale();
    createDashboardCharts();
}

// Create dashboard charts
function createDashboardCharts() {
    // Create salary distribution chart
    createSalaryDistributionDashboardChart();
    
    // Create advances status chart
    createAdvancesStatusChart();
}

// Create salary distribution chart for dashboard
function createSalaryDistributionDashboardChart() {
    const ctx = document.getElementById('salary-distribution-chart');
    if (!ctx) return;
    
    // Get employee data
    const employees = appState.employees || [];
    if (employees.length === 0) {
        ctx.parentNode.innerHTML = '<div class="text-center text-muted">لا توجد بيانات متاحة</div>';
        return;
    }
    
    // Group employees by salary ranges
    const salaryRanges = {
        'أقل من 3000': 0,
        '3000 - 5000': 0,
        '5000 - 8000': 0,
        '8000 - 12000': 0,
        'أكثر من 12000': 0
    };
    
    employees.forEach(employee => {
        const salary = employee.basicSalary;
        if (salary < 3000) {
            salaryRanges['أقل من 3000']++;
        } else if (salary < 5000) {
            salaryRanges['3000 - 5000']++;
        } else if (salary < 8000) {
            salaryRanges['5000 - 8000']++;
        } else if (salary < 12000) {
            salaryRanges['8000 - 12000']++;
        } else {
            salaryRanges['أكثر من 12000']++;
        }
    });
    
    const labels = Object.keys(salaryRanges);
    const data = Object.values(salaryRanges);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'عدد الموظفين',
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'توزيع الرواتب الشهرية',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${context.label}: ${value} موظف (${percentage}%)`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

// Create advances status chart
function createAdvancesStatusChart() {
    const ctx = document.getElementById('advances-status-chart');
    if (!ctx) return;
    
    // Get advances data
    const advances = appState.advances || [];
    if (advances.length === 0) {
        ctx.parentNode.innerHTML = '<div class="text-center text-muted">لا توجد بيانات متاحة</div>';
        return;
    }
    
    // Count paid and unpaid advances
    const paidAdvances = advances.filter(adv => adv.isPaid).length;
    const unpaidAdvances = advances.filter(adv => !adv.isPaid).length;
    
    // Calculate total amounts
    const paidAmount = advances.filter(adv => adv.isPaid)
        .reduce((sum, adv) => sum + adv.amount, 0);
    const unpaidAmount = advances.filter(adv => !adv.isPaid)
        .reduce((sum, adv) => sum + adv.amount, 0);
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['السلف المدفوعة', 'السلف المعلقة'],
            datasets: [{
                data: [paidAdvances, unpaidAdvances],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(255, 99, 132, 0.7)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'حالة السلف',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    position: 'bottom',
                    align: 'start',
                    rtl: true,
                    labels: {
                        boxWidth: 15,
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            const amount = context.dataIndex === 0 ? paidAmount : unpaidAmount;
                            return `${label}: ${value} (${percentage}%) - ${amount.toLocaleString('ar-EG')} ج.م`;
                        }
                    }
                }
            }
        }
    });
}


// Initialize dashboard search functionality
function initDashboardSearch() {
    const searchInput = document.getElementById('dashboard-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            
            // Search in employees
            const employeeResults = appState.employees.filter(emp => 
                emp.name.toLowerCase().includes(searchTerm) || 
                emp.code.toLowerCase().includes(searchTerm) ||
                emp.jobTitle.toLowerCase().includes(searchTerm)
            );
            
            // Search in recent activities
            const activityItems = document.querySelectorAll('.list-group-item');
            activityItems.forEach(item => {
                const text = item.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    item.style.backgroundColor = 'rgba(13, 110, 253, 0.1)';
                } else {
                    item.style.backgroundColor = '';
                }
            });
            
            // Display search results if any
            displaySearchResults(employeeResults, searchTerm);
        });
    }
}

// Display search results
function displaySearchResults(results, searchTerm) {
    const resultsContainer = document.getElementById('search-results');
    
    // Create results container if it doesn't exist
    if (!resultsContainer && searchTerm.length > 0) {
        const container = document.createElement('div');
        container.id = 'search-results';
        container.className = 'search-results-container';
        
        const searchInput = document.getElementById('dashboard-search-input');
        searchInput.parentNode.appendChild(container);
        
        // Update reference
        resultsContainer = container;
    }
    
    // Clear or hide results
    if (!searchTerm || searchTerm.length === 0) {
        if (resultsContainer) {
            resultsContainer.style.display = 'none';
        }
        return;
    }
    
    if (resultsContainer) {
        resultsContainer.style.display = 'block';
        
        // Generate results HTML
        if (results.length === 0) {
            resultsContainer.innerHTML = '<div class="no-results">لا توجد نتائج</div>';
        } else {
            let html = '<ul class="search-results-list">';
            
            results.forEach(emp => {
                html += `
                    <li class="search-result-item" onclick="showEmployeeDetails('${emp.code}')">
                        <div class="result-icon"><i class="fas fa-user"></i></div>
                        <div class="result-info">
                            <div class="result-name">${emp.name}</div>
                            <div class="result-details">${emp.jobTitle} - ${emp.code}</div>
                        </div>
                    </li>
                `;
            });
            
            html += '</ul>';
            resultsContainer.innerHTML = html;
        }
    }
}

// Show employee details when clicked from search
function showEmployeeDetails(employeeCode) {
    const employee = appState.employees.find(emp => emp.code === employeeCode);
    if (employee) {
        // Show a modal with employee details
        showEmployeeModal(employee);
    }
}

// Display employee details in a modal
function showEmployeeModal(employee) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('employee-details-modal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'employee-details-modal';
        modal.className = 'modal fade';
        modal.setAttribute('tabindex', '-1');
        modal.setAttribute('aria-hidden', 'true');
        
        document.body.appendChild(modal);
    }
    
    // Generate modal content
    modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">بيانات الموظف</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="employee-details">
                        <div class="row mb-3">
                            <div class="col-md-3">
                                <label class="fw-bold">الكود:</label>
                                <div>${employee.code}</div>
                            </div>
                            <div class="col-md-3">
                                <label class="fw-bold">الاسم:</label>
                                <div>${employee.name}</div>
                            </div>
                            <div class="col-md-3">
                                <label class="fw-bold">الوظيفة:</label>
                                <div>${employee.jobTitle}</div>
                            </div>
                            <div class="col-md-3">
                                <label class="fw-bold">الراتب الأساسي:</label>
                                <div>${employee.basicSalary.toLocaleString()} ج.م</div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-3">
                                <label class="fw-bold">الحوافز الشهرية:</label>
                                <div>${(employee.monthlyIncentives || 0).toLocaleString()} ج.م</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" onclick="loadEmployeeEditForm('${employee.code}')">تعديل البيانات</button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                </div>
            </div>
        </div>
    `;
    
    // Initialize and show the modal
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
}

// Generate recent activities list
function generateRecentActivities() {
    const recentSalaryReports = appState.salaryReports ? 
        appState.salaryReports.slice(-5).reverse() : [];
    
    if (recentSalaryReports.length === 0) {
        return '<div class="text-muted">لا توجد نشاطات حديثة</div>';
    }

    return recentSalaryReports.map(report => {
        // Add null checking for calculations and netSalary
        const netSalary = report.calculations && report.calculations.netSalary ? 
            report.calculations.netSalary.toLocaleString() : '0';
            
        return `
        <div class="list-group-item activity-item">
            <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1"><i class="fas fa-file-invoice-dollar activity-icon"></i>تم احتساب راتب ${report.employeeName}</h6>
                <small class="activity-time">${new Date(report.dateGenerated).toLocaleDateString('ar-EG')}</small>
            </div>
            <p class="mb-1">صافي الراتب: ${netSalary} ج.م</p>
        </div>
        `;
    }).join('');
}

// Navigation Handler
function handleNavigation(tabId) {
    switch(tabId) {
        case 'dashboard-tab':
            loadDashboard();
            break;
        case 'employees-tab':
            loadEmployeeForm();
            break;
        case 'hr-tab':
            loadHRManagement();
            break;
        case 'payroll-tab':
            loadPayrollView();
            break;
        case 'advances-tab':
            loadAdvancesManagement();
            break;
        case 'time-tracking-tab':
            if (typeof loadTimeTrackingView === 'function') {
                loadTimeTrackingView();
                // Update page title
                document.querySelector('#page-content-wrapper h2').textContent = 'تتبع وقت الموظفين';
            } else {
                showAlert('عذراً، هذه الميزة غير متوفرة حالياً', 'warning');
            }
            break;
        case 'leave-management-tab':
            loadLeaveManagementView();
            break;
        case 'reports-tab':
            loadReportsSystem();
            break;
        case 'task-management-tab':
            if (typeof loadTaskManagementSystem === 'function') {
                loadTaskManagementSystem();
                // Update page title
                document.querySelector('#page-content-wrapper h2').textContent = 'نظام المهام والتذكيرات';
            } else {
                showAlert('عذراً، هذه الميزة غير متوفرة حالياً', 'warning');
            }
            break;
        case 'advanced-analytics-tab':
            if (typeof loadAdvancedAnalytics === 'function') {
                loadAdvancedAnalytics();
                // Update page title
                document.querySelector('#page-content-wrapper h2').textContent = 'التحليلات المتقدمة';
            } else {
                showAlert('عذراً، هذه الميزة غير متوفرة حالياً', 'warning');
            }
            break;
        case 'print-tab':
            loadPayrollPrint();
            break;
    }
}

// Load Payroll View
function loadPayrollView() {
    const mainContent = document.getElementById('main-content');
    
    mainContent.innerHTML = `
        <div class="form-container">
            <h3 class="mb-4">عرض كشف الرواتب</h3>
            <div class="row mb-4">
                <div class="col-md-6">
                    <label class="form-label">اختر الموظف</label>
                    <select class="form-select" id="employee-select" onchange="updateEmployeeInfo()">
                        <option value="">-- اختر الموظف --</option>
                        ${generateEmployeeOptions()}
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label">الشهر</label>
                    <input type="month" class="form-control" id="salary-month">
                </div>
            </div>

            <div class="section-card mb-4">
                <h5 class="section-title">بيانات الموظف</h5>
                <div class="row mb-3">
                    <div class="col-md-4">
                        <label class="form-label">كود الموظف</label>
                        <input type="text" class="form-control" id="employee-code" readonly>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">اسم الموظف</label>
                        <input type="text" class="form-control" id="employee-name" readonly>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">الوظيفة</label>
                        <input type="text" class="form-control" id="job-title" readonly>
                    </div>
                </div>
                <div class="row mb-3">
                    <div class="col-md-4">
                        <label class="form-label">عدد أيام العمل</label>
                        <input type="number" class="form-control" id="work-days" onchange="updateCalculations()">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">قيمة الوحدة اليومية</label>
                        <input type="text" class="form-control" id="daily-rate" readonly>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">قيمة اليوم بالحوافز</label>
                        <input type="text" class="form-control" id="daily-rate-with-incentives" readonly>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-4">
                        <label class="form-label">عدد ساعات العمل</label>
                        <input type="number" class="form-control" id="daily-work-hours" onchange="updateCalculations()">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">قيمة وحدة الأوفرتايم</label>
                        <input type="text" class="form-control" id="overtime-unit-value" readonly>
                    </div>
                </div>
            </div>
            
            <div class="section-card mb-4">
                <h5 class="section-title">المستحقات</h5>
                <div class="row mb-3">
                    <div class="col-md-3">
                        <label class="form-label">الراتب الأساسي</label>
                        <input type="number" class="form-control" id="basic-salary-display" onchange="updateCalculations()">
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">الحوافز الشهرية</label>
                        <input type="number" class="form-control" id="monthly-incentives-display" value="0" onchange="updateCalculations()">
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">المكافأة</label>
                        <input type="number" class="form-control" id="bonus-amount" value="0" onchange="updateCalculations()">
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">عدد ساعات الأوفرتايم</label>
                        <input type="number" class="form-control" id="overtime-hours" value="0" onchange="updateCalculations()">
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-3">
                        <label class="form-label">قيمة الأوفرتايم</label>
                        <input type="text" class="form-control" id="overtime-amount-display" readonly>
                    </div>
                </div>
            </div>
            
            <div class="section-card mb-4">
                <h5 class="section-title">الخصومات</h5>
                <div class="row mb-3">
                    <div class="col-md-4">
                        <label class="form-label">المشتريات</label>
                        <input type="number" class="form-control" id="purchases-amount" value="0" onchange="updateCalculations()">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">السلف المستحقة</label>
                        <input type="number" class="form-control" id="advances-amount-display" value="0" onchange="updateCalculations()">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">أيام الغياب</label>
                        <input type="number" class="form-control" id="absence-days" value="0" onchange="updateCalculations()"
                    </div>
                </div>
                <div class="row mb-3">
                    <div class="col-md-4">
                        <label class="form-label">قيمة الغيابات</label>
                        <input type="text" class="form-control" id="absence-deductions-display" readonly>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">الخصومات/الساعات</label>
                        <input type="number" class="form-control" id="hourly-deduction" value="0" onchange="updateCalculations()">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">أيام الجزاءات</label>
                        <input type="number" class="form-control" id="penalty-days" value="0" onchange="updateCalculations()">
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-4">
                        <label class="form-label">قيمة الجزاءات</label>
                        <input type="number" class="form-control" id="penalties-amount" value="0" onchange="updateCalculations()">
                    </div>
                </div>
            </div>
            
            <div class="section-card mb-4">
                <h5 class="section-title">الإجماليات</h5>
                <div class="row">
                    <div class="col-md-4">
                        <label class="form-label">إجمالي المرتب بالحافز</label>
                        <input type="text" class="form-control" id="total-salary-with-incentives-display" readonly>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">إجمالي الراتب</label>
                        <input type="text" class="form-control" id="gross-salary-display" readonly>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">صافي الراتب</label>
                        <input type="text" class="form-control" id="net-salary-display" readonly>
                    </div>
                </div>
            </div>
            
            <div class="row mb-4">
                <div class="col-md-12 d-flex justify-content-end">
                    <button class="btn btn-primary" id="calculate-salary-btn" onclick="calculateSalary()">
                        <i class="fas fa-calculator me-2"></i>حساب الراتب
                    </button>
                </div>
            </div>
            
            <div id="salary-result"></div>
        </div>
    `;
    
    // Initialize date picker with current month
    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    document.getElementById('salary-month').value = currentMonth;
}

// Generate employee options for select dropdown
function generateEmployeeOptions() {
    return appState.employees.map(emp => 
        `<option value="${emp.code}">${emp.name} (${emp.code})</option>`
    ).join('');
}

// Load employee-specific data from Supabase or localStorage
async function loadEmployeeData(employeeCode) {
    try {
        // Find employee in local state
        const employee = appState.employees.find(emp => emp.code === employeeCode);
        if (!employee) {
            console.error('Employee not found:', employeeCode);
            return;
        }
        
        // Set current employee
        appState.currentEmployee = employee;
        
        // Check if we're in offline mode
        const isOfflineMode = sessionStorage.getItem('offlineMode') === 'true';
        
        if (!isOfflineMode && employee.id) {
            // Online mode: Try to fetch from Supabase
            try {
                console.log('Fetching employee data from Supabase...');
                
                // Fetch advances
                const advancesResponse = await fetch(`/api/advances/${employee.id}`);
                if (advancesResponse.ok) {
                    const advancesData = await advancesResponse.json();
                    appState.advances = advancesData.map(adv => ({
                        id: adv.id,
                        employeeCode: employeeCode,
                        amount: adv.amount,
                        date: adv.date,
                        remainingAmount: adv.remaining_amount,
                        notes: adv.notes,
                        isPaid: adv.is_paid,
                        createdAt: adv.created_at
                    }));
                    console.log('Advances loaded from Supabase:', appState.advances.length);
                    
                    // Save to localStorage as backup
                    localStorage.setItem('advances', JSON.stringify(appState.advances));
                }
                
                // Fetch salary reports
                const reportsResponse = await fetch(`/api/salary-reports/${employee.id}`);
                if (reportsResponse.ok) {
                    const reportsData = await reportsResponse.json();
                    appState.salaryReports = reportsData.map(report => ({
                        id: report.id,
                        employeeCode: employeeCode,
                        month: report.month,
                        basicSalary: report.basic_salary,
                        advancesDeduction: report.advances_deduction,
                        otherDeductions: report.other_deductions,
                        bonuses: report.bonuses,
                        netSalary: report.net_salary
                    }));
                    console.log('Salary reports loaded from Supabase:', appState.salaryReports.length);
                    
                    // Save to localStorage as backup
                    localStorage.setItem('salaryReports', JSON.stringify(appState.salaryReports));
                }
                
                return; // Exit function after successful fetch
            } catch (error) {
                console.error('Error fetching employee data from Supabase:', error);
                showAlert('فشل تحميل بيانات الموظف من قاعدة البيانات، سيتم استخدام البيانات المحلية', 'warning');
                // Fall back to localStorage
            }
        }
        
        // Offline mode or fallback: Filter local data
        appState.advances = appState.advances.filter(adv => adv.employeeCode === employeeCode);
        appState.salaryReports = appState.salaryReports.filter(report => report.employeeCode === employeeCode);
    } catch (e) {
        console.error('Error loading employee data:', e);
    }
}

// Update employee information when selected
async function updateEmployeeInfo() {
    const employeeCode = document.getElementById('employee-select').value;
    
    if (!employeeCode) {
        // Clear all fields
        document.getElementById('employee-code').value = '';
        document.getElementById('employee-name').value = '';
        document.getElementById('job-title').value = '';
        document.getElementById('work-days').value = '';
        document.getElementById('daily-work-hours').value = '';
        document.getElementById('basic-salary-display').value = '';
        document.getElementById('monthly-incentives-display').value = '';
        document.getElementById('advances-amount-display').value = '0';
        return;
    }
    
    const employee = appState.employees.find(emp => emp.code === employeeCode);
    if (!employee) {
        showAlert('لم يتم العثور على الموظف', 'danger');
        return;
    }
    
    // Load employee-specific data from Supabase or localStorage
    await loadEmployeeData(employeeCode);
    
    // Fill employee information
    document.getElementById('employee-code').value = employee.code;
    document.getElementById('employee-name').value = employee.name;
    document.getElementById('job-title').value = employee.jobTitle;
    document.getElementById('work-days').value = employee.workDays || 22;
    document.getElementById('daily-work-hours').value = employee.dailyWorkHours || 8;
    document.getElementById('basic-salary-display').value = employee.basicSalary;
    document.getElementById('monthly-incentives-display').value = employee.monthlyIncentives || 0;
    
    // Calculate advances for this employee and set as initial value (but user can change it)
    const employeeAdvances = appState.advances ? 
        appState.advances.filter(adv => adv.employeeCode === employeeCode && !adv.isPaid) : [];
    const advancesAmount = employeeAdvances.reduce((sum, adv) => sum + adv.amount, 0);
    document.getElementById('advances-amount-display').value = advancesAmount.toFixed(2);
    
    // Update all calculations
    updateCalculations();
}

// Update calculations when any input changes
function updateCalculations() {
    const employeeCode = document.getElementById('employee-select').value;
    if (!employeeCode) return;
    
    const employee = appState.employees.find(emp => emp.code === employeeCode);
    if (!employee) return;
    
    // Get form values
    const workDays = parseInt(document.getElementById('work-days').value) || 22;
    const dailyWorkHours = parseInt(document.getElementById('daily-work-hours').value) || 8;
    const basicSalary = parseFloat(document.getElementById('basic-salary-display').value) || employee.basicSalary;
    const monthlyIncentives = parseFloat(document.getElementById('monthly-incentives-display').value) || 0;
    const bonusAmount = parseFloat(document.getElementById('bonus-amount').value) || 0;
    const overtimeHours = parseFloat(document.getElementById('overtime-hours').value) || 0;
    const absenceDays = parseFloat(document.getElementById('absence-days').value) || 0;
    const hourlyDeduction = parseFloat(document.getElementById('hourly-deduction').value) || 0;
    const purchasesAmount = parseFloat(document.getElementById('purchases-amount').value) || 0;
    const penaltyDays = parseFloat(document.getElementById('penalty-days').value) || 0;
    const penaltiesAmount = parseFloat(document.getElementById('penalties-amount').value) || 0;
    
    // Calculate daily rates
    const dailyRate = basicSalary / workDays;
    const dailyRateWithIncentives = (basicSalary + monthlyIncentives) / workDays;
    
    // Calculate overtime unit value
    const overtimeUnitValue = dailyRate / dailyWorkHours;
    
    // Calculate overtime amount
    const overtimeAmount = overtimeHours * overtimeUnitValue * 1.5; // 1.5x for overtime
    
    // Calculate absence deductions based on whether employee has incentives
    let absenceDeductions = 0;
    if (monthlyIncentives > 0) {
        // If employee has incentives, deduct based on daily rate with incentives
        absenceDeductions = absenceDays * dailyRateWithIncentives;
    } else {
        // If employee has no incentives, deduct based on regular daily rate
        absenceDeductions = absenceDays * dailyRate;
    }
    
    // Calculate penalty amount
    const penaltyAmount = penaltyDays * dailyRate + penaltiesAmount;
    
    // Get advances amount from the input field (now editable)
    const advancesAmount = parseFloat(document.getElementById('advances-amount-display').value) || 0;
    
    // Update calculated fields
    document.getElementById('daily-rate').value = dailyRate.toFixed(2) + ' ج.م';
    document.getElementById('daily-rate-with-incentives').value = dailyRateWithIncentives.toFixed(2) + ' ج.م';
    document.getElementById('overtime-unit-value').value = overtimeUnitValue.toFixed(2) + ' ج.م';
    document.getElementById('overtime-amount-display').value = overtimeAmount.toFixed(2) + ' ج.م';
    document.getElementById('absence-deductions-display').value = absenceDeductions.toFixed(2) + ' ج.م';
    
    // Calculate totals
    const totalSalaryWithIncentives = basicSalary + monthlyIncentives;
    const grossSalary = basicSalary + monthlyIncentives + bonusAmount + overtimeAmount;
    const totalDeductions = purchasesAmount + advancesAmount + absenceDeductions + hourlyDeduction + penaltyAmount;
    // Exclude monthly incentives from net salary calculation
    const netSalary = (basicSalary + bonusAmount + overtimeAmount) - totalDeductions;
    
    // Update total fields
    document.getElementById('total-salary-with-incentives-display').value = totalSalaryWithIncentives.toFixed(2) + ' ج.م';
    document.getElementById('gross-salary-display').value = grossSalary.toFixed(2) + ' ج.م';
    document.getElementById('net-salary-display').value = netSalary.toFixed(2) + ' ج.م';
}

// Calculate salary based on form inputs
function calculateSalary() {
    const employeeCode = document.getElementById('employee-select').value;
    const month = document.getElementById('salary-month').value;
    
    if (!employeeCode || !month) {
        showAlert('يرجى اختيار الموظف والشهر', 'warning');
        return;
    }
    
    const employee = appState.employees.find(emp => emp.code === employeeCode);
    if (!employee) {
        showAlert('لم يتم العثور على الموظف', 'danger');
        return;
    }
    
    // Get form values
    const workDays = parseInt(document.getElementById('work-days').value) || 22;
    const dailyWorkHours = parseInt(document.getElementById('daily-work-hours').value) || 8;
    const bonusAmount = parseFloat(document.getElementById('bonus-amount').value) || 0;
    const overtimeHours = parseFloat(document.getElementById('overtime-hours').value) || 0;
    const absenceDays = parseFloat(document.getElementById('absence-days').value) || 0;
    const hourlyDeduction = parseFloat(document.getElementById('hourly-deduction').value) || 0;
    const purchasesAmount = parseFloat(document.getElementById('purchases-amount').value) || 0;
    const penaltyDays = parseFloat(document.getElementById('penalty-days').value) || 0;
    const penaltiesAmount = parseFloat(document.getElementById('penalties-amount').value) || 0;
    
    // Get the manually entered advances amount
    const advancesAmount = parseFloat(document.getElementById('advances-amount-display').value) || 0;
    
    // Get the system advances for this employee (for marking as paid later)
    const employeeAdvances = appState.advances ? 
        appState.advances.filter(adv => adv.employeeCode === employeeCode && !adv.isPaid) : [];
    const systemAdvancesAmount = employeeAdvances.reduce((sum, adv) => sum + adv.amount, 0);
    
    // Get the basic salary and monthly incentives from the form inputs
    const basicSalary = parseFloat(document.getElementById('basic-salary-display').value) || employee.basicSalary;
    const monthlyIncentives = parseFloat(document.getElementById('monthly-incentives-display').value) || 0;
    
    // Calculate daily rates
    const dailyRate = basicSalary / workDays;
    const dailyRateWithIncentives = (basicSalary + monthlyIncentives) / workDays;
    
    // Calculate overtime unit value and amount
    const overtimeUnitValue = dailyRate / dailyWorkHours;
    const overtimeAmount = overtimeHours * overtimeUnitValue * 1.5; // 1.5x for overtime
    
    // Calculate absence deductions based on whether employee has incentives
    let absenceDeductions = 0;
    if (monthlyIncentives > 0) {
        // If employee has incentives, deduct based on daily rate with incentives
        absenceDeductions = absenceDays * dailyRateWithIncentives;
    } else {
        // If employee has no incentives, deduct based on regular daily rate
        absenceDeductions = absenceDays * dailyRate;
    }
    
    // Calculate penalty amount
    const penaltyAmount = penaltyDays * dailyRate + penaltiesAmount;
    
    // Calculate total deductions
    const totalDeductions = purchasesAmount + advancesAmount + absenceDeductions + hourlyDeduction + penaltyAmount;
    
    // Calculate total salary
    const calculations = {
        basicSalary: basicSalary,
        monthlyIncentives: monthlyIncentives,
        bonus: bonusAmount,
        overtimeAmount: overtimeAmount,
        dailyRate: dailyRate,
        dailyRateWithIncentives: dailyRateWithIncentives,
        overtimeUnitValue: overtimeUnitValue,
        workDays: workDays,
        dailyWorkHours: dailyWorkHours,
        absenceDays: absenceDays,
        penaltyDays: penaltyDays,
        totalSalaryWithIncentives: basicSalary + monthlyIncentives,
        deductions: {
            purchases: purchasesAmount,
            advances: advancesAmount,
            absenceDeductions: absenceDeductions,
            hourlyDeductions: hourlyDeduction,
            penalties: penaltyAmount
        },
        totalDeductions: totalDeductions,
        grossSalary: 0,
        netSalary: 0
    };
    
    // Calculate gross and net salary
    // Gross salary includes all components
    calculations.grossSalary = calculations.basicSalary + 
                              calculations.monthlyIncentives + 
                              calculations.bonus + 
                              calculations.overtimeAmount;
    
    // Net salary excludes monthly incentives as per requirements
    calculations.netSalary = (calculations.basicSalary + 
                             calculations.bonus + 
                             calculations.overtimeAmount) - 
                             calculations.totalDeductions;
    
    // Display result
    displaySalaryResult(employee, calculations, month);
    
    // Save report to appState
    const report = {
        employeeCode: employee.code,
        employeeName: employee.name,
        month: month,
        dateGenerated: new Date().toISOString(),
        calculations: calculations
    };
    
    // Check if report already exists and update it, or add new one
    const existingReportIndex = appState.salaryReports.findIndex(
        r => r.employeeCode === employee.code && r.month === month
    );
    
    if (existingReportIndex >= 0) {
        appState.salaryReports[existingReportIndex] = report;
    } else {
        appState.salaryReports.push(report);
    }
    
    // Save to localStorage
    saveToLocalStorage('salaryReports', appState.salaryReports);
    
    // Process advances deduction and update remaining amounts
    if (employeeAdvances.length > 0 && advancesAmount > 0) {
        let remainingAdvanceToDeduct = advancesAmount;
        
        // Process each advance in order (oldest first)
        for (const advance of employeeAdvances) {
            const advanceIndex = appState.advances.findIndex(adv => adv.id === advance.id);
            if (advanceIndex >= 0) {
                // Ensure remainingAmount exists (for backward compatibility)
                if (appState.advances[advanceIndex].remainingAmount === undefined) {
                    appState.advances[advanceIndex].remainingAmount = appState.advances[advanceIndex].amount;
                }
                
                // Calculate how much to deduct from this advance
                const currentRemaining = appState.advances[advanceIndex].remainingAmount;
                const amountToDeduct = Math.min(currentRemaining, remainingAdvanceToDeduct);
                
                // Update the remaining amount
                appState.advances[advanceIndex].remainingAmount = currentRemaining - amountToDeduct;
                remainingAdvanceToDeduct -= amountToDeduct;
                
                // Mark as paid if fully paid
                if (appState.advances[advanceIndex].remainingAmount <= 0) {
                    appState.advances[advanceIndex].isPaid = true;
                    appState.advances[advanceIndex].remainingAmount = 0; // Ensure it's not negative
                }
                
                // If we've deducted all that was requested, stop processing
                if (remainingAdvanceToDeduct <= 0) break;
            }
        }
        
        // Save updated advances to localStorage
        saveToLocalStorage('advances', appState.advances);
        
        // Show appropriate notification
        if (advancesAmount >= systemAdvancesAmount) {
            showAlert('تم تحديث حالة السلف المستحقة إلى مدفوعة', 'success');
        } else {
            showAlert('تم احتساب جزء من السلف المستحقة في الراتب', 'info');
        }
    }
}

// Load Advances Management
function loadAdvancesManagement() {
    const mainContent = document.getElementById('main-content');
    
    mainContent.innerHTML = `
        <div class="form-container">
            <h3 class="mb-4">إدارة السلف</h3>
            
            <ul class="nav nav-tabs" id="advancesTabs" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="new-advance-tab" data-bs-toggle="tab" 
                            data-bs-target="#new-advance" type="button" role="tab">
                        سلفة جديدة
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="manage-advances-tab" data-bs-toggle="tab" 
                            data-bs-target="#manage-advances" type="button" role="tab">
                        إدارة السلف الحالية
                    </button>
                </li>
            </ul>
            
            <div class="tab-content mt-3" id="advancesTabContent">
                <div class="tab-pane fade show active" id="new-advance" role="tabpanel">
                    <form id="advance-form">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label class="form-label">اختر الموظف</label>
                                <select class="form-select" id="advance-employee-select" required>
                                    <option value="">-- اختر الموظف --</option>
                                    ${generateEmployeeOptions()}
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">تاريخ السلفة</label>
                                <input type="date" class="form-control" id="advance-date" required>
                            </div>
                        </div>
                        
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label class="form-label">قيمة السلفة</label>
                                <div class="currency-input">
                                    <input type="number" class="form-control" id="advance-amount" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">ملاحظات</label>
                                <input type="text" class="form-control" id="advance-notes">
                            </div>
                        </div>
                        
                        <div class="text-start mt-3">
                            <button type="submit" class="btn btn-primary">تسجيل السلفة</button>
                        </div>
                    </form>
                </div>
                
                <div class="tab-pane fade" id="manage-advances" role="tabpanel">
                    <div class="table-responsive">
                        <table class="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>الموظف</th>
                                    <th>التاريخ</th>
                                    <th>القيمة</th>
                                    <th>المتبقى من السلفة</th>
                                    <th>الحالة</th>
                                    <th>ملاحظات</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody id="advances-table-body">
                                ${generateAdvancesTableRows()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Set default date to today
    document.getElementById('advance-date').valueAsDate = new Date();
    
    // Add form submit handler
    const form = document.getElementById('advance-form');
    form.addEventListener('submit', handleAdvanceFormSubmit);
}

// Generate advances table rows
function generateAdvancesTableRows() {
    if (!appState.advances || appState.advances.length === 0) {
        return '<tr><td colspan="7" class="text-center">لا توجد سلف مسجلة</td></tr>';
    }
    
    return appState.advances.map(advance => {
        const employee = appState.employees.find(emp => emp.code === advance.employeeCode);
        const employeeName = employee ? employee.name : 'غير معروف';
        
        // Ensure remainingAmount exists (for backward compatibility)
        const remainingAmount = advance.remainingAmount !== undefined ? advance.remainingAmount : advance.amount;
        
        return `
            <tr>
                <td>${employeeName}</td>
                <td>${new Date(advance.date).toLocaleDateString('ar-SA')}</td>
                <td>${advance.amount.toLocaleString()} ج.م</td>
                <td>${remainingAmount.toLocaleString()} ج.م</td>
                <td>
                    <span class="badge ${advance.isPaid ? 'bg-success' : 'bg-warning'}">
                        ${advance.isPaid ? 'تم السداد' : 'معلق'}
                    </span>
                </td>
                <td>${advance.notes || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-${advance.isPaid ? 'secondary' : 'success'}" 
                            onclick="toggleAdvanceStatus('${advance.id}')">
                        ${advance.isPaid ? 'تم السداد' : 'تحديد كمسدد'}
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteAdvance('${advance.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Handle advance form submit
async function handleAdvanceFormSubmit(e) {
    e.preventDefault();
    
    const employeeCode = document.getElementById('advance-employee-select').value;
    const date = document.getElementById('advance-date').value;
    const amount = parseFloat(document.getElementById('advance-amount').value);
    const notes = document.getElementById('advance-notes').value;
    
    if (!employeeCode || !date || !amount || amount <= 0) {
        showAlert('يرجى ملء جميع الحقول المطلوبة بشكل صحيح', 'warning');
        return;
    }
    
    // Find employee
    const employee = appState.employees.find(emp => emp.code === employeeCode);
    if (!employee) {
        showAlert('الموظف غير موجود', 'danger');
        return;
    }
    
    // Create new advance
    const advance = {
        employeeId: employee.id, // Use the employee's ID from Supabase
        employeeCode: employeeCode, // Keep the code for reference
        date: date,
        amount: amount,
        remainingAmount: amount, // Track remaining amount
        notes: notes,
        isPaid: false,
        createdAt: new Date().toISOString()
    };
    
    // Add to state
    if (!appState.advances) {
        appState.advances = [];
    }
    
    // Show loading indicator
    showAlert('جاري حفظ بيانات السلفة...', 'info');
    
    try {
        // Save to Supabase via API
        const response = await fetch('/api/advances', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(advance)
        });
        
        if (!response.ok) {
            throw new Error('فشل حفظ السلفة في قاعدة البيانات');
        }
        
        // Get the saved advance with ID from the response
        const savedAdvance = await response.json();
        
        // Add to advances array
        appState.advances.push(savedAdvance);
        
        // Save to localStorage as backup
        saveToLocalStorage('advances', appState.advances);
        
        // Show success message
        showAlert('تم تسجيل السلفة بنجاح في قاعدة البيانات', 'success');
    } catch (apiError) {
        console.error('Error saving advance to API:', apiError);
        showAlert('حدث خطأ أثناء حفظ السلفة في قاعدة البيانات، سيتم الحفظ محلياً فقط', 'warning');
        
        // Fallback to localStorage only
        // Add a temporary ID for local storage
        advance.id = generateUniqueId();
        appState.advances.push(advance);
        saveToLocalStorage('advances', appState.advances);
    }
    
    // Reset form
    document.getElementById('advance-form').reset();
    document.getElementById('advance-date').valueAsDate = new Date();
    
    // Refresh advances table if visible
    const manageTab = document.getElementById('manage-advances');
    if (manageTab && manageTab.classList.contains('active')) {
        document.getElementById('advances-table-body').innerHTML = generateAdvancesTableRows();
    }
}

// Toggle advance payment status
async function toggleAdvanceStatus(advanceId) {
    const advanceIndex = appState.advances.findIndex(adv => adv.id === advanceId);
    if (advanceIndex >= 0) {
        // Toggle paid status
        const newPaidStatus = !appState.advances[advanceIndex].isPaid;
        
        // Calculate new remaining amount
        let newRemainingAmount = 0;
        if (!newPaidStatus) {
            // If marking as unpaid, restore the original amount
            newRemainingAmount = appState.advances[advanceIndex].amount;
        }
        
        try {
            // Check if we're in offline mode
            const isOfflineMode = sessionStorage.getItem('offlineMode') === 'true';
            
            if (!isOfflineMode && appState.advances[advanceIndex].id) {
                // Update via API
                const response = await fetch(`/api/advances/${advanceId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        employeeId: appState.advances[advanceIndex].employeeId,
                        amount: appState.advances[advanceIndex].amount,
                        date: appState.advances[advanceIndex].date,
                        remainingAmount: newRemainingAmount,
                        notes: appState.advances[advanceIndex].notes,
                        isPaid: newPaidStatus,
                        createdAt: appState.advances[advanceIndex].createdAt
                    })
                });
                
                if (!response.ok) {
                    throw new Error('فشل تحديث حالة السلفة في قاعدة البيانات');
                }
                
                // Get updated advance
                const updatedAdvance = await response.json();
                
                // Update local state
                appState.advances[advanceIndex].isPaid = updatedAdvance.is_paid;
                appState.advances[advanceIndex].remainingAmount = updatedAdvance.remaining_amount;
                
                showAlert('تم تحديث حالة السلفة في قاعدة البيانات', 'success');
            } else {
                // Offline mode - update local state only
                appState.advances[advanceIndex].isPaid = newPaidStatus;
                appState.advances[advanceIndex].remainingAmount = newRemainingAmount;
                
                // Save to localStorage
                saveToLocalStorage('advances', appState.advances);
                
                showAlert('تم تحديث حالة السلفة (وضع غير متصل)', 'success');
            }
            
            // Refresh table
            document.getElementById('advances-table-body').innerHTML = generateAdvancesTableRows();
        } catch (error) {
            console.error('Error updating advance status:', error);
            showAlert('حدث خطأ أثناء تحديث حالة السلفة', 'danger');
            
            // Fallback to local update
            appState.advances[advanceIndex].isPaid = newPaidStatus;
            appState.advances[advanceIndex].remainingAmount = newRemainingAmount;
            saveToLocalStorage('advances', appState.advances);
            
            // Refresh table
            document.getElementById('advances-table-body').innerHTML = generateAdvancesTableRows();
        }
    }
}

// Delete advance
function deleteAdvance(advanceId) {
    if (confirm('هل أنت متأكد من حذف هذه السلفة؟')) {
        appState.advances = appState.advances.filter(adv => adv.id !== advanceId);
        saveToLocalStorage('advances', appState.advances);
        
        // Refresh table
        document.getElementById('advances-table-body').innerHTML = generateAdvancesTableRows();
        showAlert('تم حذف السلفة بنجاح', 'success');
    }
}

// Generate unique ID
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Load Payroll Print
function loadPayrollPrint() {
    const mainContent = document.getElementById('main-content');
    
    mainContent.innerHTML = `
        <div class="form-container">
            <h3 class="mb-4">طباعة كشوف الرواتب</h3>
            
            <div class="row mb-4">
                <div class="col-md-6">
                    <label class="form-label">اختر الشهر</label>
                    <input type="month" class="form-control" id="print-month">
                </div>
                <div class="col-md-6 d-flex align-items-end">
                    <button class="btn btn-primary" onclick="loadPayrollReports()">
                        <i class="fas fa-search me-2"></i>عرض التقارير
                    </button>
                </div>
            </div>
            
            <div id="payroll-reports-container">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    اختر الشهر لعرض كشوف الرواتب المتاحة للطباعة
                </div>
            </div>
        </div>
    `;
    
    // Set default month to current month
    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    document.getElementById('print-month').value = currentMonth;
}

// Load payroll reports for selected month
function loadPayrollReports() {
    const month = document.getElementById('print-month').value;
    if (!month) {
        showAlert('يرجى اختيار الشهر', 'warning');
        return;
    }
    
    // Filter reports for selected month
    const reports = appState.salaryReports.filter(report => report.month === month);
    
    const container = document.getElementById('payroll-reports-container');
    
    if (reports.length === 0) {
        container.innerHTML = `
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle me-2"></i>
                لا توجد تقارير رواتب لهذا الشهر
            </div>
        `;
        return;
    }
    
    // Group reports by department if available, otherwise show all
    container.innerHTML = `
        <div class="card mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="m-0">كشوف رواتب شهر ${formatMonth(month)}</h5>
                <button class="btn btn-sm btn-primary" onclick="printAllPayrolls('${month}')">
                    <i class="fas fa-print me-2"></i>طباعة الكل
                </button>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>كود الموظف</th>
                                <th>اسم الموظف</th>
                                <th>الراتب الأساسي</th>
                                <th>إجمالي المستحقات</th>
                                <th>إجمالي الخصومات</th>
                                <th>صافي الراتب</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${generatePayrollReportRows(reports)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// Generate payroll report table rows
function generatePayrollReportRows(reports) {
    return reports.map(report => `
        <tr>
            <td>${report.employeeCode}</td>
            <td>${report.employeeName}</td>
            <td>${report.calculations.basicSalary.toLocaleString()} ج.م</td>
            <td>${report.calculations.grossSalary.toLocaleString()} ج.م</td>
            <td>${report.calculations.totalDeductions.toLocaleString()} ج.م</td>
            <td>${report.calculations.netSalary.toLocaleString()} ج.م</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="printSalarySlip('${report.employeeCode}', '${report.month}')">
                    <i class="fas fa-print"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Print all payrolls for a month
function printAllPayrolls(month) {
    const reports = appState.salaryReports.filter(report => report.month === month);
    if (reports.length === 0) return;
    
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>كشوف رواتب - ${formatMonth(month)}</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.rtl.min.css">
            <link rel="stylesheet" href="styles/main.css">
            <style>
                @media print {
                    .page-break { page-break-after: always; }
                    body { padding: 20px; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="text-center mb-4">
                    <h2>كشوف رواتب شهر ${formatMonth(month)}</h2>
                </div>
    `);
    
    reports.forEach((report, index) => {
        printWindow.document.write(`
            <div class="salary-slip mb-4 ${index < reports.length - 1 ? 'page-break' : ''}">
                <div class="print-header mb-3">
                    <h3>كشف راتب</h3>
                    <p>الموظف: ${report.employeeName}</p>
                    <p>كود الموظف: ${report.employeeCode}</p>
                    <p>الشهر: ${formatMonth(report.month)}</p>
                </div>
                
                <div class="row">
                    <div class="col-md-12">
                        <div class="section-card mb-3">
                            <h5 class="section-title">المستحقات</h5>
                            <div class="row">
                                <div class="col-md-3">
                                    <div class="salary-component">
                                        <div class="title">الراتب الأساسي</div>
                                        <div class="value">${report.calculations.basicSalary.toFixed(2)} ج.م</div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="salary-component">
                                        <div class="title">الحوافز الشهرية</div>
                                        <div class="value">${report.calculations.monthlyIncentives.toFixed(2)} ج.م</div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="salary-component">
                                        <div class="title">المكافأة</div>
                                        <div class="value">${report.calculations.bonus.toFixed(2)} ج.م</div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="salary-component">
                                        <div class="title">قيمة الأوفرتايم</div>
                                        <div class="value">${report.calculations.overtimeAmount.toFixed(2)} ج.م</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-12">
                        <div class="section-card mb-3">
                            <h5 class="section-title">الخصومات</h5>
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="salary-component">
                                        <div class="title">المشتريات</div>
                                        <div class="value text-danger">${report.calculations.deductions.purchases.toFixed(2)} ج.م</div>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="salary-component">
                                        <div class="title">السلف المستحقة</div>
                                        <div class="value text-danger">${report.calculations.deductions.advances.toFixed(2)} ج.م</div>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="salary-component">
                                        <div class="title">إجمالي الخصومات</div>
                                        <div class="value text-danger">${report.calculations.totalDeductions.toFixed(2)} ج.م</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-12">
                        <div class="section-card">
                            <h5 class="section-title">الإجماليات</h5>
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="salary-component">
                                        <div class="title">إجمالي المرتب بالحافز</div>
                                        <div class="value">${report.calculations.totalSalaryWithIncentives.toFixed(2)} ج.م</div>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="salary-component">
                                        <div class="title">إجمالي الراتب</div>
                                        <div class="value">${report.calculations.grossSalary.toFixed(2)} ج.م</div>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="salary-component highlight">
                                        <div class="title">صافي الراتب</div>
                                        <div class="value text-success">${report.calculations.netSalary.toFixed(2)} ج.م</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `);
    });
    
    printWindow.document.write(`
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
        printWindow.print();
    }, 500);
}

// Format month for display
function formatMonth(monthStr) {
    if (!monthStr) return '';
    
    const [year, month] = monthStr.split('-');
    const date = new Date(year, parseInt(month) - 1);
    
    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' });
}

// Save data to localStorage
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

// Load saved data from Supabase via API with localStorage fallback
async function loadSavedData() {
    try {
        // Always clear localStorage first to ensure we don't use stale data
        clearAllLocalStorage();
        
        // Show loading indicator
        showAlert('جاري تحميل البيانات من قاعدة البيانات...', 'info');
        
        try {
            // Load employees from SQLite
            const employeesResponse = await fetch('/api/employees');
            if (employeesResponse.ok) {
                // Set online mode flag
                sessionStorage.setItem('offlineMode', 'false');
                console.log('Application is in online mode - using SQLite data');
                
                appState.employees = await employeesResponse.json();
                console.log('Loaded employees from SQLite:', appState.employees);
                
                // Load advances if we have employees
                if (appState.employees.length > 0) {
                    // Load advances for all employees
                    const advancesPromises = appState.employees.map(async (employee) => {
                        const advancesResponse = await fetch(`/api/advances/${employee.id}`);
                        if (advancesResponse.ok) {
                            return await advancesResponse.json();
                        }
                        return [];
                    });
                    
                    // Combine all advances
                    const allAdvances = await Promise.all(advancesPromises);
                    appState.advances = allAdvances.flat();
                    console.log('Loaded advances from SQLite:', appState.advances);
                    
                    // Load salary reports for all employees
                    const reportsPromises = appState.employees.map(async (employee) => {
                        const reportsResponse = await fetch(`/api/salary-reports/${employee.id}`);
                        if (reportsResponse.ok) {
                            return await reportsResponse.json();
                        }
                        return [];
                    });
                    
                    // Combine all reports
                    const allReports = await Promise.all(reportsPromises);
                    appState.salaryReports = allReports.flat();
                    console.log('Loaded salary reports from SQLite:', appState.salaryReports);
                }
                
                showAlert('تم تحميل البيانات بنجاح من قاعدة البيانات', 'success');
                return; // Exit function successfully
            } else {
                throw new Error('Failed to fetch employees from SQLite');
            }
        } catch (sqliteError) {
            console.error('Error loading from SQLite:', sqliteError);
            throw sqliteError; // Re-throw to trigger localStorage fallback
        }
    } catch (error) {
        console.error('Falling back to localStorage:', error);
        showAlert('جاري تحميل البيانات من التخزين المحلي...', 'warning');
        
        // Set offline mode flag
        sessionStorage.setItem('offlineMode', 'true');
        console.log('Application is in offline mode - using localStorage data');
        
        // Fallback to localStorage
        try {
            // Load from localStorage
            const employees = JSON.parse(localStorage.getItem('employees')) || [];
            const advances = JSON.parse(localStorage.getItem('advances')) || [];
            const salaryReports = JSON.parse(localStorage.getItem('salaryReports')) || [];
            
            appState.employees = employees;
            appState.advances = advances;
            appState.salaryReports = salaryReports;
            
            showAlert('تم تحميل البيانات من التخزين المحلي', 'info');
        } catch (localStorageError) {
            console.error('Error loading from localStorage:', localStorageError);
            showAlert('فشل تحميل البيانات من التخزين المحلي', 'danger');
        }
    }
}

// Helper function to clear all localStorage items related to application data
function clearAllLocalStorage() {
    // Clear all data-related localStorage items
    localStorage.removeItem('employees');
    localStorage.removeItem('advances');
    localStorage.removeItem('salaryReports');
    localStorage.removeItem('timeRecords');
    localStorage.removeItem('tasks');
    localStorage.removeItem('reminders');
    localStorage.removeItem('events');
    localStorage.removeItem('lastTaskId');
}

// Show alert message
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Find alert container or create one
    let alertContainer = document.getElementById('alert-container');
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'alert-container';
        alertContainer.className = 'alert-container';
        document.body.appendChild(alertContainer);
    }
    
    alertContainer.appendChild(alertDiv);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 300);
    }, 5000);
}

// Load Employee Form
function loadEmployeeForm() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="form-container">
            <h3 class="mb-4">إدخال بيانات الموظف</h3>
            <form id="employee-form">
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label">كود الموظف</label>
                        <input type="text" class="form-control" id="employee-code" required>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label">اسم الموظف</label>
                        <input type="text" class="form-control" id="employee-name" required>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label">الوظيفة</label>
                        <input type="text" class="form-control" id="job-title" required>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label">عدد أيام العمل</label>
                        <input type="number" class="form-control" id="work-days" value="22" required>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label">الراتب الأساسي</label>
                        <input type="number" class="form-control" id="basic-salary" required>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label">الحوافز الشهرية</label>
                        <input type="number" class="form-control" id="monthly-incentives" value="0">
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label">عدد ساعات العمل اليومية</label>
                        <input type="number" class="form-control" id="daily-work-hours" value="8" required>
                    </div>
                </div>
                <div class="text-start mt-3">
                    <button type="submit" class="btn btn-primary">حفظ البيانات</button>
                </div>
            </form>
        </div>
    `;

    // Add form submit handler
    const form = document.getElementById('employee-form');
    form.addEventListener('submit', handleEmployeeFormSubmit);
}

// Handle employee form submission
async function handleEmployeeFormSubmit(e) {
    e.preventDefault();
    
    try {
        const formData = {
            code: document.getElementById('employee-code').value,
            name: document.getElementById('employee-name').value,
            jobTitle: document.getElementById('job-title').value,
            workDays: parseInt(document.getElementById('work-days').value) || 22,
            dailyWorkHours: parseInt(document.getElementById('daily-work-hours').value) || 8,
            basicSalary: parseFloat(document.getElementById('basic-salary').value),
            monthlyIncentives: parseFloat(document.getElementById('monthly-incentives').value) || 0
        };

        // Validate all fields
        const errors = [];
        for (const [field, validator] of Object.entries(validationSchemas.employee)) {
            const error = validator(formData[field]);
            if (error) {
                errors.push(error);
            }
        }

        if (errors.length > 0) {
            throw new Error(errors.join('\n'));
        }

        // Check for duplicate employee code
        if (appState.employees.some(emp => emp.code === formData.code)) {
            throw new Error('كود الموظف موجود مسبقاً');
        }

        // Show loading indicator
        showAlert('جاري حفظ بيانات الموظف...', 'info');
        
        try {
            // Save to Supabase
            const { data: savedEmployee, error } = await window.supabaseClient
                .from('employees')
                .insert([
                    {
                        code: formData.code,
                        name: formData.name,
                        job_title: formData.jobTitle,
                        work_days: formData.workDays,
                        daily_work_hours: formData.dailyWorkHours,
                        basic_salary: formData.basicSalary,
                        monthly_incentives: formData.monthlyIncentives
                    }
                ])
                .select()
                .single();
            
            if (error) throw error;
            
            // Add to employees array
            appState.employees.push({
                id: savedEmployee.id,
                code: savedEmployee.code,
                name: savedEmployee.name,
                jobTitle: savedEmployee.job_title,
                workDays: savedEmployee.work_days,
                dailyWorkHours: savedEmployee.daily_work_hours,
                basicSalary: savedEmployee.basic_salary,
                monthlyIncentives: savedEmployee.monthly_incentives
            });
            
            // In online mode, we don't need to save to localStorage
            // The saveToLocalStorage function will handle this based on the offlineMode flag
            saveToLocalStorage('employees', appState.employees);
            
            // Force reload data from server on next page load to ensure all clients have latest data
            sessionStorage.setItem('forceReload', 'true');
            
            // Show success message
            showAlert('تم حفظ بيانات الموظف بنجاح في قاعدة البيانات', 'success');
        } catch (apiError) {
            console.error('Error saving to Supabase:', apiError);
            showAlert('حدث خطأ أثناء الحفظ في قاعدة البيانات، سيتم الحفظ محلياً فقط', 'warning');
            
            // Fallback to localStorage only
            appState.employees.push(formData);
            saveToLocalStorage('employees', appState.employees);
        }
        
        // Reset form
        e.target.reset();
        
        // Refresh employee list if visible
        if (document.querySelector('.table-container')) {
            loadHRManagement();
        }
    } catch (error) {
        console.error('Form submission error:', error);
        showAlert(error.message, 'danger');
    }
}

// Load HR Management
function loadHRManagement() {
    const mainContent = document.getElementById('main-content');
    
    const employeesList = appState.employees.map(emp => `
        <tr>
            <td>${emp.code}</td>
            <td>${emp.name}</td>
            <td>${emp.jobTitle}</td>
            <td>${emp.basicSalary.toLocaleString()} ج.م</td>
            <td>${(emp.monthlyIncentives || 0).toLocaleString()} ج.م</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editEmployee('${emp.code}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteEmployee('${emp.code}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

    mainContent.innerHTML = `
        <div class="table-container">
            <h3 class="mb-4">الموظفين</h3>
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>كود الموظف</th>
                        <th>الاسم</th>
                        <th>الوظيفة</th>
                        <th>الراتب الأساسي</th>
                        <th>الحوافز الشهرية</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    ${employeesList}
                </tbody>
            </table>
        </div>
    `;
}

// Edit employee function
function editEmployee(employeeCode) {
    const employee = appState.employees.find(emp => emp.code === employeeCode);
    if (!employee) {
        showAlert('لم يتم العثور على الموظف', 'danger');
        return;
    }

    // Load the employee form
    loadEmployeeForm();

    // Populate form with employee data
    document.getElementById('employee-code').value = employee.code;
    document.getElementById('employee-code').readOnly = true; // Prevent code modification
    document.getElementById('employee-name').value = employee.name;
    document.getElementById('job-title').value = employee.jobTitle;
    document.getElementById('work-days').value = employee.workDays || 22;
    document.getElementById('daily-work-hours').value = employee.dailyWorkHours || 8;
    document.getElementById('basic-salary').value = employee.basicSalary;
    document.getElementById('monthly-incentives').value = employee.monthlyIncentives || 0;

    // Modify form submission handler for update
    const form = document.getElementById('employee-form');
    form.removeEventListener('submit', handleEmployeeFormSubmit);
    form.addEventListener('submit', (e) => handleEmployeeUpdate(e, employee));
}

async function handleEmployeeUpdate(e, existingEmployee) {
    e.preventDefault();
    
    try {
        const formData = {
            code: document.getElementById('employee-code').value,
            name: document.getElementById('employee-name').value,
            jobTitle: document.getElementById('job-title').value,
            workDays: parseInt(document.getElementById('work-days').value) || 22,
            dailyWorkHours: parseInt(document.getElementById('daily-work-hours').value) || 8,
            basicSalary: parseFloat(document.getElementById('basic-salary').value),
            monthlyIncentives: parseFloat(document.getElementById('monthly-incentives').value) || 0
        };

        // Validate all fields
        const errors = [];
        for (const [field, validator] of Object.entries(validationSchemas.employee)) {
            const error = validator(formData[field]);
            if (error) {
                errors.push(error);
            }
        }

        if (errors.length > 0) {
            throw new Error(errors.join('\n'));
        }

        // Update employee data
        const employeeIndex = appState.employees.findIndex(emp => emp.code === existingEmployee.code);
        if (employeeIndex === -1) {
            throw new Error('لم يتم العثور على الموظف');
        }

        // Show loading indicator
        showAlert('جاري تحديث بيانات الموظف...', 'info');
        
        try {
            // Check if we're in offline mode
            const isOfflineMode = sessionStorage.getItem('offlineMode') === 'true';
            
            if (!isOfflineMode && existingEmployee.id) {
                // Save to Supabase using the server-side API
                const response = await fetch(`/api/employees/${existingEmployee.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        code: formData.code,
                        name: formData.name,
                        jobTitle: formData.jobTitle,
                        workDays: formData.workDays,
                        dailyWorkHours: formData.dailyWorkHours,
                        basicSalary: formData.basicSalary,
                        monthlyIncentives: formData.monthlyIncentives
                    })
                });
                
                if (!response.ok) {
                    throw new Error('فشل تحديث بيانات الموظف في قاعدة البيانات');
                }
                
                const updatedEmployee = await response.json();
                
                // Update in local state
                appState.employees[employeeIndex] = {
                    id: updatedEmployee.id,
                    code: updatedEmployee.code,
                    name: updatedEmployee.name,
                    jobTitle: updatedEmployee.job_title,
                    workDays: updatedEmployee.work_days,
                    dailyWorkHours: updatedEmployee.daily_work_hours,
                    basicSalary: updatedEmployee.basic_salary,
                    monthlyIncentives: updatedEmployee.monthly_incentives,
                    dateModified: new Date().toISOString()
                };
                
                // Force reload data from server on next page load
                sessionStorage.setItem('forceReload', 'true');
                
                // Show success message
                showAlert('تم تحديث بيانات الموظف بنجاح في قاعدة البيانات', 'success');
            } else {
                // Offline mode or no ID - update local state only
                appState.employees[employeeIndex] = {
                    ...existingEmployee,
                    ...formData,
                    dateModified: new Date().toISOString()
                };
                
                // Save to localStorage
                saveToLocalStorage('employees', appState.employees);
                
                // Show success message
                showAlert('تم تحديث بيانات الموظف بنجاح (وضع غير متصل)', 'success');
            }
        } catch (apiError) {
            console.error('Error updating in Supabase:', apiError);
            showAlert('حدث خطأ أثناء التحديث في قاعدة البيانات، سيتم التحديث محلياً فقط', 'warning');
            
            // Fallback to localStorage only
            appState.employees[employeeIndex] = {
                ...existingEmployee,
                ...formData,
                dateModified: new Date().toISOString()
            };
            saveToLocalStorage('employees', appState.employees);
        }

        // Refresh employee list
        loadHRManagement();

    } catch (error) {
        console.error('Employee update error:', error);
        showAlert(error.message, 'danger');
    }
}

function deleteEmployee(employeeCode) {
    const employee = appState.employees.find(emp => emp.code === employeeCode);
    if (!employee) {
        showAlert('لم يتم العثور على الموظف', 'danger');
        return;
    }

    if (confirm(`هل أنت متأكد من حذف الموظف ${employee.name}؟`)) {
        // Remove employee from array
        appState.employees = appState.employees.filter(emp => emp.code !== employeeCode);

        // Save to localStorage
        saveToLocalStorage('employees', appState.employees);

        // Show success message
        showAlert('تم حذف الموظف بنجاح', 'success');

        // Refresh employee list
        loadHRManagement();
    }
}

// Utility Functions
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    document.querySelector('.container-fluid').prepend(alertDiv);
    
    // Auto dismiss after 3 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

function saveToLocalStorage(key, data) {
    try {
        // Only save to localStorage if we're in offline mode or as a fallback
        // This prevents stale data from being used when Supabase is available
        const isOfflineMode = sessionStorage.getItem('offlineMode') === 'true';
        
        if (isOfflineMode) {
            localStorage.setItem(key, JSON.stringify(data));
            console.log(`Saved ${key} to localStorage (offline mode)`);
        } else {
            // In online mode, we don't want to save to localStorage
            // as we'll always fetch fresh data from Supabase
            console.log(`Skipped saving ${key} to localStorage (online mode)`);
        }
    } catch (e) {
        console.error('Error saving to localStorage:', e);
    }
}

async function loadSavedData() {
    try {
        const isOfflineMode = sessionStorage.getItem('offlineMode') === 'true';
        
        if (!isOfflineMode) {
            // Try to fetch data from Supabase
            try {
                // Fetch employees
                const { data: employeesData, error: employeesError } = await window.supabaseClient
                    .from('employees')
                    .select('*');

                if (employeesError) throw employeesError;

                if (employeesData) {
                    appState.employees = employeesData.map(emp => ({
                        id: emp.id,
                        code: emp.code,
                        name: emp.name,
                        jobTitle: emp.job_title || '',
                        basicSalary: emp.basic_salary || 0,
                        workDays: emp.work_days || 22,
                        dailyWorkHours: emp.daily_work_hours || 8,
                        monthlyIncentives: emp.monthly_incentives || 0
                    }));
                    // Update localStorage as backup
                    localStorage.setItem('employees', JSON.stringify(appState.employees));
                }

                // Fetch all advances
                const { data: advancesData, error: advancesError } = await window.supabaseClient
                    .from('advances')
                    .select('*');

                if (advancesError) throw advancesError;

                if (advancesData) {
                    appState.advances = advancesData;
                    // Update localStorage as backup
                    localStorage.setItem('advances', JSON.stringify(advancesData));
                }

                // Fetch all salary reports
                const { data: reportsData, error: reportsError } = await window.supabaseClient
                    .from('salary_reports')
                    .select('*');

                if (reportsError) throw reportsError;

                if (reportsData) {
                    appState.salaryReports = reportsData;
                    // Update localStorage as backup
                    localStorage.setItem('salaryReports', JSON.stringify(reportsData));
                }

                console.log('Data successfully loaded from Supabase');
                return;
            } catch (error) {
                console.error('Error fetching data from Supabase:', error);
                showAlert('فشل تحميل البيانات من قاعدة البيانات، سيتم استخدام البيانات المحلية', 'warning');
                // Fall back to localStorage
            }
        }

        // Load from localStorage if offline or if Supabase fetch failed
        const savedEmployees = localStorage.getItem('employees');
        if (savedEmployees) {
            appState.employees = JSON.parse(savedEmployees);
        }

        const savedAdvances = localStorage.getItem('advances');
        if (savedAdvances) {
            appState.advances = JSON.parse(savedAdvances);
        }

        const savedReports = localStorage.getItem('salaryReports');
        if (savedReports) {
            appState.salaryReports = JSON.parse(savedReports);
        }

    } catch (error) {
        console.error('Error loading saved data:', error);
        showAlert('حدث خطأ أثناء تحميل البيانات المحفوظة', 'danger');
    }
}

// Export functions for Excel/PDF
function exportToExcel(data, filename) {
    // Implementation will be added in reports.js
}

function exportToPDF(data, filename) {
    // Implementation will be added in reports.js
}
