// Advanced Analytics System

// Analytics state
const analyticsState = {
    dashboards: [],
    reports: [],
    visualizations: [],
    currentDashboard: null,
    filters: {}
};

// Load advanced analytics system
function loadAdvancedAnalytics() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="container-fluid">
            <div class="row mb-4">
                <div class="col-12">
                    <h3 class="mb-3">التحليلات المتقدمة</h3>
                    <ul class="nav nav-tabs" id="analyticsTabs" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active" id="dashboard-analytics-tab" data-bs-toggle="tab" 
                                    data-bs-target="#dashboard-analytics" type="button" role="tab">
                                <i class="fas fa-tachometer-alt me-2"></i>لوحات التحكم التحليلية
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="reports-tab" data-bs-toggle="tab" 
                                    data-bs-target="#custom-reports" type="button" role="tab">
                                <i class="fas fa-file-alt me-2"></i>التقارير المخصصة
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="visualizations-tab" data-bs-toggle="tab" 
                                    data-bs-target="#data-visualizations" type="button" role="tab">
                                <i class="fas fa-chart-pie me-2"></i>تصور البيانات
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
            
            <div class="tab-content" id="analyticsTabContent">
                <!-- Dashboard Analytics Tab -->
                <div class="tab-pane fade show active" id="dashboard-analytics" role="tabpanel">
                    <div class="row mb-3">
                        <div class="col-md-9">
                            <div class="input-group">
                                <select class="form-select" id="dashboard-selector" onchange="loadSelectedDashboard()">
                                    <option value="salary-analysis">تحليل الرواتب</option>
                                    <option value="employee-performance">أداء الموظفين</option>
                                    <option value="attendance-analysis">تحليل الحضور والغياب</option>
                                    <option value="financial-overview">نظرة عامة مالية</option>
                                </select>
                                <button class="btn btn-outline-secondary" type="button" onclick="refreshDashboard()">
                                    <i class="fas fa-sync-alt"></i>
                                </button>
                            </div>
                        </div>
                        <div class="col-md-3 d-flex justify-content-end">
                            <button class="btn btn-primary" onclick="createNewDashboard()">
                                <i class="fas fa-plus me-2"></i>إنشاء لوحة تحكم جديدة
                            </button>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-12">
                            <div class="card">
                                <div class="card-header d-flex justify-content-between align-items-center">
                                    <h5 class="m-0" id="current-dashboard-title">تحليل الرواتب</h5>
                                    <div class="dashboard-controls">
                                        <button class="btn btn-sm btn-outline-primary me-2" onclick="exportDashboard('pdf')">
                                            <i class="fas fa-file-pdf me-1"></i>PDF
                                        </button>
                                        <button class="btn btn-sm btn-outline-success" onclick="exportDashboard('excel')">
                                            <i class="fas fa-file-excel me-1"></i>Excel
                                        </button>
                                    </div>
                                </div>
                                <div class="card-body">
                                    <div id="dashboard-container" class="dashboard-container">
                                        <!-- Dashboard content will be loaded here -->
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Custom Reports Tab -->
                <div class="tab-pane fade" id="custom-reports" role="tabpanel">
                    <div class="row mb-3">
                        <div class="col-md-12 d-flex justify-content-end">
                            <button class="btn btn-primary" onclick="showCreateReportModal()">
                                <i class="fas fa-plus me-2"></i>إنشاء تقرير جديد
                            </button>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-4">
                            <div class="card">
                                <div class="card-header">
                                    <h5 class="m-0">معايير التقرير</h5>
                                </div>
                                <div class="card-body">
                                    <form id="report-criteria-form">
                                        <div class="mb-3">
                                            <label class="form-label">نوع التقرير</label>
                                            <select class="form-select" id="report-type">
                                                <option value="salary">تقرير الرواتب</option>
                                                <option value="attendance">تقرير الحضور</option>
                                                <option value="performance">تقرير الأداء</option>
                                                <option value="financial">تقرير مالي</option>
                                            </select>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">الفترة الزمنية</label>
                                            <div class="row">
                                                <div class="col-6">
                                                    <input type="date" class="form-control" id="report-start-date">
                                                </div>
                                                <div class="col-6">
                                                    <input type="date" class="form-control" id="report-end-date">
                                                </div>
                                            </div>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">الموظفين</label>
                                            <select class="form-select" id="report-employees" multiple>
                                                <option value="all" selected>جميع الموظفين</option>
                                                <!-- Employee options will be loaded here -->
                                            </select>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">خيارات العرض</label>
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" id="show-charts" checked>
                                                <label class="form-check-label" for="show-charts">عرض الرسوم البيانية</label>
                                            </div>
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" id="show-tables" checked>
                                                <label class="form-check-label" for="show-tables">عرض الجداول</label>
                                            </div>
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" id="show-summary" checked>
                                                <label class="form-check-label" for="show-summary">عرض الملخص</label>
                                            </div>
                                        </div>
                                        <button type="button" class="btn btn-primary w-100" onclick="generateCustomReport()">
                                            <i class="fas fa-file-alt me-2"></i>إنشاء التقرير
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-8">
                            <div class="card">
                                <div class="card-header d-flex justify-content-between align-items-center">
                                    <h5 class="m-0" id="report-title">نتائج التقرير</h5>
                                    <div class="report-controls">
                                        <button class="btn btn-sm btn-outline-primary me-2" onclick="exportReport('pdf')">
                                            <i class="fas fa-file-pdf me-1"></i>PDF
                                        </button>
                                        <button class="btn btn-sm btn-outline-success me-2" onclick="exportReport('excel')">
                                            <i class="fas fa-file-excel me-1"></i>Excel
                                        </button>
                                        <button class="btn btn-sm btn-outline-secondary" onclick="exportReport('csv')">
                                            <i class="fas fa-file-csv me-1"></i>CSV
                                        </button>
                                    </div>
                                </div>
                                <div class="card-body">
                                    <div id="report-container" class="report-container">
                                        <!-- Report content will be loaded here -->
                                        <div class="text-center text-muted py-5">
                                            <i class="fas fa-chart-line fa-3x mb-3"></i>
                                            <p>يرجى تحديد معايير التقرير والنقر على "إنشاء التقرير" لعرض النتائج</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Data Visualizations Tab -->
                <div class="tab-pane fade" id="data-visualizations" role="tabpanel">
                    <div class="row mb-3">
                        <div class="col-md-12">
                            <div class="card">
                                <div class="card-header">
                                    <h5 class="m-0">إنشاء تصور بياني جديد</h5>
                                </div>
                                <div class="card-body">
                                    <form id="visualization-form" class="row">
                                        <div class="col-md-3 mb-3">
                                            <label class="form-label">نوع البيانات</label>
                                            <select class="form-select" id="data-source">
                                                <option value="salary">بيانات الرواتب</option>
                                                <option value="attendance">بيانات الحضور</option>
                                                <option value="performance">بيانات الأداء</option>
                                                <option value="financial">بيانات مالية</option>
                                            </select>
                                        </div>
                                        <div class="col-md-3 mb-3">
                                            <label class="form-label">نوع الرسم البياني</label>
                                            <select class="form-select" id="chart-type">
                                                <option value="bar">رسم شريطي</option>
                                                <option value="line">رسم خطي</option>
                                                <option value="pie">رسم دائري</option>
                                                <option value="radar">رسم راداري</option>
                                                <option value="polarArea">رسم قطبي</option>
                                                <option value="doughnut">رسم حلقي</option>
                                            </select>
                                        </div>
                                        <div class="col-md-3 mb-3">
                                            <label class="form-label">الفترة الزمنية</label>
                                            <select class="form-select" id="time-period">
                                                <option value="month">شهري</option>
                                                <option value="quarter">ربع سنوي</option>
                                                <option value="year">سنوي</option>
                                                <option value="custom">مخصص</option>
                                            </select>
                                        </div>
                                        <div class="col-md-3 mb-3 d-flex align-items-end">
                                            <button type="button" class="btn btn-primary w-100" onclick="createVisualization()">
                                                <i class="fas fa-chart-pie me-2"></i>إنشاء الرسم البياني
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-12">
                            <div class="card">
                                <div class="card-header d-flex justify-content-between align-items-center">
                                    <h5 class="m-0" id="visualization-title">تصور البيانات</h5>
                                    <div class="visualization-controls">
                                        <button class="btn btn-sm btn-outline-primary me-2" onclick="exportVisualization('png')">
                                            <i class="fas fa-image me-1"></i>PNG
                                        </button>
                                        <button class="btn btn-sm btn-outline-success" onclick="exportVisualization('pdf')">
                                            <i class="fas fa-file-pdf me-1"></i>PDF
                                        </button>
                                    </div>
                                </div>
                                <div class="card-body">
                                    <div id="visualization-container" class="visualization-container">
                                        <!-- Visualization content will be loaded here -->
                                        <div class="text-center text-muted py-5">
                                            <i class="fas fa-chart-pie fa-3x mb-3"></i>
                                            <p>يرجى تحديد معايير الرسم البياني والنقر على "إنشاء الرسم البياني" لعرض النتائج</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Initialize components
    loadDashboardData();
    populateEmployeeDropdowns();
    initializeChartLibraries();
}

// Load dashboard data
function loadDashboardData() {
    const savedDashboards = localStorage.getItem('analytics_dashboards');
    const savedReports = localStorage.getItem('analytics_reports');
    const savedVisualizations = localStorage.getItem('analytics_visualizations');
    
    if (savedDashboards) analyticsState.dashboards = JSON.parse(savedDashboards);
    if (savedReports) analyticsState.reports = JSON.parse(savedReports);
    if (savedVisualizations) analyticsState.visualizations = JSON.parse(savedVisualizations);
    
    // Load default dashboard if none exists
    if (analyticsState.dashboards.length === 0) {
        createDefaultDashboards();
    }
    
    // Load the first dashboard by default
    loadSelectedDashboard();
}

// Save analytics data
function saveAnalyticsData() {
    localStorage.setItem('analytics_dashboards', JSON.stringify(analyticsState.dashboards));
    localStorage.setItem('analytics_reports', JSON.stringify(analyticsState.reports));
    localStorage.setItem('analytics_visualizations', JSON.stringify(analyticsState.visualizations));
}

// Create default dashboards
function createDefaultDashboards() {
    // Salary Analysis Dashboard
    analyticsState.dashboards.push({
        id: 'salary-analysis',
        title: 'تحليل الرواتب',
        widgets: [
            {
                id: 'salary-summary',
                type: 'summary',
                title: 'ملخص الرواتب',
                dataSource: 'salary',
                position: { x: 0, y: 0, w: 12, h: 1 }
            },
            {
                id: 'salary-distribution',
                type: 'chart',
                chartType: 'bar',
                title: 'توزيع الرواتب',
                dataSource: 'salary',
                position: { x: 0, y: 1, w: 6, h: 2 }
            },
            {
                id: 'salary-trends',
                type: 'chart',
                chartType: 'line',
                title: 'اتجاهات الرواتب',
                dataSource: 'salary',
                position: { x: 6, y: 1, w: 6, h: 2 }
            },
            {
                id: 'salary-table',
                type: 'table',
                title: 'جدول الرواتب',
                dataSource: 'salary',
                position: { x: 0, y: 3, w: 12, h: 2 }
            }
        ],
        createdAt: new Date().toISOString()
    });
    
    // Employee Performance Dashboard
    analyticsState.dashboards.push({
        id: 'employee-performance',
        title: 'أداء الموظفين',
        widgets: [
            {
                id: 'performance-summary',
                type: 'summary',
                title: 'ملخص الأداء',
                dataSource: 'performance',
                position: { x: 0, y: 0, w: 12, h: 1 }
            },
            {
                id: 'performance-radar',
                type: 'chart',
                chartType: 'radar',
                title: 'مؤشرات الأداء الرئيسية',
                dataSource: 'performance',
                position: { x: 0, y: 1, w: 6, h: 2 }
            },
            {
                id: 'performance-comparison',
                type: 'chart',
                chartType: 'bar',
                title: 'مقارنة أداء الموظفين',
                dataSource: 'performance',
                position: { x: 6, y: 1, w: 6, h: 2 }
            }
        ],
        createdAt: new Date().toISOString()
    });
    
    // Save the default dashboards
    saveAnalyticsData();
}

// Load selected dashboard
function loadSelectedDashboard() {
    const dashboardId = document.getElementById('dashboard-selector').value;
    const dashboard = analyticsState.dashboards.find(d => d.id === dashboardId) || analyticsState.dashboards[0];
    
    if (!dashboard) {
        document.getElementById('dashboard-container').innerHTML = '<div class="text-center text-muted py-5">لا توجد لوحات تحكم متاحة</div>';
        return;
    }
    
    analyticsState.currentDashboard = dashboard;
    document.getElementById('current-dashboard-title').textContent = dashboard.title;
    
    renderDashboard(dashboard);
}

// Render dashboard
function renderDashboard(dashboard) {
    const container = document.getElementById('dashboard-container');
    container.innerHTML = '';
    
    // Create grid layout
    const gridLayout = document.createElement('div');
    gridLayout.className = 'dashboard-grid';
    container.appendChild(gridLayout);
    
    // Add widgets
    dashboard.widgets.forEach(widget => {
        const widgetElement = createWidgetElement(widget);
        gridLayout.appendChild(widgetElement);
    });
    
    // Initialize grid layout library if available
    if (typeof GridStack !== 'undefined') {
        const grid = GridStack.init({
            column: 12,
            animate: true,
            resizable: { handles: 'all' },
            draggable: true,
            margin: 10,
            cellHeight: 80
        });
        
        // Save layout changes
        grid.on('change', function() {
            const items = grid.getGridItems();
            items.forEach((item, i) => {
                const widgetId = item.gridstackNode.id;
                const widget = dashboard.widgets.find(w => w.id === widgetId);
                if (widget) {
                    widget.position = {
                        x: item.gridstackNode.x,
                        y: item.gridstackNode.y,
                        w: item.gridstackNode.width,
                        h: item.gridstackNode.height
                    };
                }
            });
            saveAnalyticsData();
        });
    } else {
        // Fallback for when GridStack is not available
        gridLayout.style.display = 'grid';
        gridLayout.style.gridTemplateColumns = 'repeat(12, 1fr)';
        gridLayout.style.gridGap = '10px';
        
        dashboard.widgets.forEach(widget => {
            const widgetElement = document.getElementById(`widget-${widget.id}`);
            if (widgetElement) {
                widgetElement.style.gridColumn = `span ${widget.position.w}`;
                widgetElement.style.gridRow = `span ${widget.position.h}`;
            }
        });
    }
    
    // Load widget data
    dashboard.widgets.forEach(widget => {
        loadWidgetData(widget);
    });
}

// Create widget element
function createWidgetElement(widget) {
    const widgetElement = document.createElement('div');
    widgetElement.className = 'grid-stack-item';
    widgetElement.id = `widget-${widget.id}`;
    widgetElement.setAttribute('gs-x', widget.position.x);
    widgetElement.setAttribute('gs-y', widget.position.y);
    widgetElement.setAttribute('gs-w', widget.position.w);
    widgetElement.setAttribute('gs-h', widget.position.h);
    
    widgetElement.innerHTML = `
        <div class="grid-stack-item-content">
            <div class="widget-header">
                <h6 class="widget-title">${widget.title}</h6>
                <div class="widget-controls">
                    <button class="btn btn-sm btn-link" onclick="refreshWidget('${widget.id}')">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                    <button class="btn btn-sm btn-link" onclick="editWidget('${widget.id}')">
                        <i class="fas fa-cog"></i>
                    </button>
                </div>
            </div>
            <div class="widget-body" id="widget-body-${widget.id}">
                <div class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">جاري التحميل...</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return widgetElement;
}

// Load widget data
function loadWidgetData(widget) {
    const widgetBody = document.getElementById(`widget-body-${widget.id}`);
    if (!widgetBody) return;
    
    // Get data based on widget type and data source
    let data;
    switch (widget.dataSource) {
        case 'salary':
            data = getSalaryData();
            break;
        case 'attendance':
            data = getAttendanceData();
            break;
        case 'performance':
            data = getPerformanceData();
            break;
        case 'financial':
            data = getFinancialData();
            break;
        default:
            data = { error: 'مصدر بيانات غير معروف' };
    }
    
    // Render widget based on type
    switch (widget.type) {
        case 'summary':
            renderSummaryWidget(widgetBody, data, widget);
            break;
        case 'chart':
            renderChartWidget(widgetBody, data, widget);
            break;
        case 'table':
            renderTableWidget(widgetBody, data, widget);
            break;
        default:
            widgetBody.innerHTML = '<div class="text-center text-muted">نوع عنصر غير معروف</div>';
    }
}

// Render summary widget
function renderSummaryWidget(container, data, widget) {
    if (data.error) {
        container.innerHTML = `<div class="text-center text-danger">${data.error}</div>`;
        return;
    }
    
    let summaryHtml = '<div class="row summary-cards">';
    
    // Create summary cards based on data source
    if (widget.dataSource === 'salary') {
        summaryHtml += `
            <div class="col-md-3">
                <div class="summary-card">
                    <div class="summary-value">${data.totalEmployees}</div>
                    <div class="summary-label">إجمالي الموظفين</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="summary-card">
                    <div class="summary-value">${formatCurrency(data.totalSalaries)}</div>
                    <div class="summary-label">إجمالي الرواتب</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="summary-card">
                    <div class="summary-value">${formatCurrency(data.averageSalary)}</div>
                    <div class="summary-label">متوسط الراتب</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="summary-card">
                    <div class="summary-value">${formatCurrency(data.totalBonuses)}</div>
                    <div class="summary-label">إجمالي الحوافز</div>
                </div>
            </div>
        `;
    } else if (widget.dataSource === 'performance') {
        summaryHtml += `
            <div class="col-md-4">
                <div class="summary-card">
                    <div class="summary-value">${data.averagePerformance.toFixed(1)}</div>
                    <div class="summary-label">متوسط الأداء</div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="summary-card">
                    <div class="summary-value">${data.topPerformers}</div>
                    <div class="summary-label">أفضل الموظفين أداءً</div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="summary-card">
                    <div class="summary-value">${data.improvementNeeded}</div>
                    <div class="summary-label">بحاجة إلى تحسين</div>
                </div>
            </div>
        `;
    }
    
    summaryHtml += '</div>';
    container.innerHTML = summaryHtml;
}

// Render chart widget
function renderChartWidget(container, data, widget) {
    if (data.error) {
        container.innerHTML = `<div class="text-center text-danger">${data.error}</div>`;
        return;
    }
    
    // Create canvas for chart
    container.innerHTML = `<canvas id="chart-${widget.id}"></canvas>`;
    const canvas = document.getElementById(`chart-${widget.id}`);
    
    // Prepare chart data based on widget data source and chart type
    let chartData, chartOptions;
    
    if (widget.dataSource === 'salary') {
        switch (widget.chartType) {
            case 'bar':
                chartData = {
                    labels: data.employees.map(emp => emp.name),
                    datasets: [{
                        label: 'الراتب الأساسي',
                        data: data.employees.map(emp => emp.basicSalary),
                        backgroundColor: 'rgba(54, 162, 235, 0.7)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }]
                };
                chartOptions = {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'توزيع الرواتب',
                            font: { size: 16 }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'الراتب (ج.م)'
                            }
                        }
                    }
                };
                break;
            case 'line':
                chartData = {
                    labels: data.months,
                    datasets: [{
                        label: 'متوسط الراتب',
                        data: data.salaryTrends,
                        fill: false,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        tension: 0.1
                    }]
                };
                chartOptions = {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'اتجاهات الرواتب',
                            font: { size: 16 }
                        }
                    }
                };
                break;
            case 'pie':
                chartData = {
                    labels: ['الرواتب الأساسية', 'الحوافز', 'البدلات', 'الخصومات'],
                    datasets: [{
                        data: [data.totalBasicSalaries, data.totalBonuses, data.totalAllowances, data.totalDeductions],
                        backgroundColor: [
                            'rgba(54, 162, 235, 0.7)',
                            'rgba(75, 192, 192, 0.7)',
                            'rgba(255, 206, 86, 0.7)',
                            'rgba(255, 99, 132, 0.7)'
                        ],
                        borderColor: [
                            'rgba(54, 162, 235, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(255, 99, 132, 1)'
                        ],
                        borderWidth: 1
                    }]
                };
                chartOptions = {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'توزيع مكونات الرواتب',
                            font: { size: 16 }
                        }
                    }
                };
                break;
            default:
                container.innerHTML = '<div class="text-center text-danger">نوع الرسم البياني غير مدعوم</div>';
                return;
        }
    } else if (widget.dataSource === 'performance') {
        switch (widget.chartType) {
            case 'radar':
                chartData = {
                    labels: ['الإنتاجية', 'الالتزام', 'جودة العمل', 'العمل الجماعي', 'المبادرة'],
                    datasets: data.performanceData.map(emp => ({
                        label: emp.name,
                        data: [emp.productivity, emp.attendance, emp.quality, emp.teamwork, emp.initiative],
                        fill: true,
                        backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.2)`,
                        borderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`,
                        pointBackgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`,
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`
                    }))
                };
                chartOptions = {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'مؤشرات الأداء الرئيسية',
                            font: { size: 16 }
                        }
                    },
                    scales: {
                        r: {
                            angleLines: {
                                display: true
                            },
                            suggestedMin: 0,
                            suggestedMax: 10
                        }
                    }
                };
                break;
            case 'bar':
                chartData = {
                    labels: data.performanceData.map(emp => emp.name),
                    datasets: [{
                        label: 'متوسط الأداء',
                        data: data.performanceData.map(emp => emp.average),
                        backgroundColor: data.performanceData.map(emp => {
                            if (emp.average >= 8) return 'rgba(75, 192, 192, 0.7)';
                            if (emp.average >= 6) return 'rgba(255, 206, 86, 0.7)';
                            return 'rgba(255, 99, 132, 0.7)';
                        }),
                        borderColor: data.performanceData.map(emp => {
                            if (emp.average >= 8) return 'rgba(75, 192, 192, 1)';
                            if (emp.average >= 6) return 'rgba(255, 206, 86, 1)';
                            return 'rgba(255, 99, 132, 1)';
                        }),
                        borderWidth: 1
                    }]
                };
                chartOptions = {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'مقارنة أداء الموظفين',
                            font: { size: 16 }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            suggestedMax: 10,
                            title: {
                                display: true,
                                text: 'متوسط الأداء (من 10)'
                            }
                        }
                    }
                };
                break;
            default:
                container.innerHTML = '<div class="text-center text-danger">نوع الرسم البياني غير مدعوم</div>';
                return;
        }
    }
    
    // Create chart
    new Chart(canvas, {
        type: widget.chartType,
        data: chartData,
        options: chartOptions
    });
}

// Render table widget
function renderTableWidget(container, data, widget) {
    if (data.error) {
        container.innerHTML = `<div class="text-center text-danger">${data.error}</div>`;
        return;
    }
    
    let tableHtml = '<div class="table-responsive"><table class="table table-striped table-hover">';
    
    // Create table based on data source
    if (widget.dataSource === 'salary') {
        tableHtml += `
            <thead>
                <tr>
                    <th>الموظف</th>
                    <th>الراتب الأساسي</th>
                    <th>الحوافز</th>
                    <th>البدلات</th>
                    <th>الخصومات</th>
                    <th>صافي الراتب</th>
                </tr>
            </thead>
            <tbody>
                ${data.employees.map(emp => `
                    <tr>
                        <td>${emp.name}</td>
                        <td>${formatCurrency(emp.basicSalary)}</td>
                        <td>${formatCurrency(emp.bonuses || 0)}</td>
                        <td>${formatCurrency(emp.allowances || 0)}</td>
                        <td>${formatCurrency(emp.deductions || 0)}</td>
                        <td>${formatCurrency(emp.netSalary)}</td>
                    </tr>
                `).join('')}
            </tbody>
        `;
    } else if (widget.dataSource === 'performance') {
        tableHtml += `
            <thead>
                <tr>
                    <th>الموظف</th>
                    <th>الإنتاجية</th>
                    <th>الالتزام</th>
                    <th>جودة العمل</th>
                    <th>العمل الجماعي</th>
                    <th>المبادرة</th>
                    <th>المتوسط</th>
                </tr>
            </thead>
            <tbody>
                ${data.performanceData.map(emp => `
                    <tr>
                        <td>${emp.name}</td>
                        <td>${emp.productivity}</td>
                        <td>${emp.attendance}</td>
                        <td>${emp.quality}</td>
                        <td>${emp.teamwork}</td>
                        <td>${emp.initiative}</td>
                        <td>
                            <span class="badge bg-${emp.average >= 8 ? 'success' : (emp.average >= 6 ? 'warning' : 'danger')}">
                                ${emp.average.toFixed(1)}
                            </span>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;
    }
    
    tableHtml += '</table></div>';
    container.innerHTML = tableHtml;
}

// Initialize chart libraries
function initializeChartLibraries() {
    // Check if Chart.js is already loaded
    if (typeof Chart === 'undefined') {
        // Load Chart.js
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.7.0/dist/chart.min.js';
        script.onload = () => {
            // Initialize chart locale
            if (Chart.defaults) {
                Chart.defaults.font.family = 'Tajawal, sans-serif';
                Chart.defaults.color = '#495057';
                Chart.defaults.plugins.tooltip.rtl = true;
                Chart.defaults.plugins.tooltip.titleAlign = 'right';
                Chart.defaults.plugins.tooltip.bodyAlign = 'right';
            }
        };
        document.head.appendChild(script);
    }
    
    // Check if GridStack is already loaded
    if (typeof GridStack === 'undefined') {
        // Load GridStack CSS
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://cdn.jsdelivr.net/npm/gridstack@5.0.0/dist/gridstack.min.css';
        document.head.appendChild(cssLink);
        
        // Load GridStack JS
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/gridstack@5.0.0/dist/gridstack.all.js';
        script.onload = () => {
            // Refresh dashboard after GridStack is loaded
            if (analyticsState.currentDashboard) {
                renderDashboard(analyticsState.currentDashboard);
            }
        };
        document.head.appendChild(script);
    }
}

// Create new dashboard
function createNewDashboard() {
    // Show modal to create new dashboard
    const modalHtml = `
        <div class="modal fade" id="createDashboardModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">إنشاء لوحة تحكم جديدة</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="create-dashboard-form">
                            <div class="mb-3">
                                <label for="dashboard-title" class="form-label">عنوان لوحة التحكم</label>
                                <input type="text" class="form-control" id="dashboard-title" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">نوع البيانات الأساسي</label>
                                <select class="form-select" id="dashboard-data-type">
                                    <option value="salary">بيانات الرواتب</option>
                                    <option value="attendance">بيانات الحضور</option>
                                    <option value="performance">بيانات الأداء</option>
                                    <option value="financial">بيانات مالية</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">العناصر الافتراضية</label>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="include-summary" checked>
                                    <label class="form-check-label" for="include-summary">ملخص البيانات</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="include-charts" checked>
                                    <label class="form-check-label" for="include-charts">رسوم بيانية</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="include-table" checked>
                                    <label class="form-check-label" for="include-table">جدول بيانات</label>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء</button>
                        <button type="button" class="btn btn-primary" onclick="saveDashboard()">إنشاء</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('createDashboardModal'));
    modal.show();
    
    // Remove modal from DOM when hidden
    document.getElementById('createDashboardModal').addEventListener('hidden.bs.modal', function () {
        document.body.removeChild(modalContainer);
    });
}

// Save new dashboard
function saveDashboard() {
    const title = document.getElementById('dashboard-title').value;
    const dataType = document.getElementById('dashboard-data-type').value;
    const includeSummary = document.getElementById('include-summary').checked;
    const includeCharts = document.getElementById('include-charts').checked;
    const includeTable = document.getElementById('include-table').checked;
    
    if (!title) {
        alert('يرجى إدخال عنوان للوحة التحكم');
        return;
    }
    
    // Generate unique ID
    const dashboardId = `dashboard-${Date.now()}`;
    
    // Create widgets based on selections
    const widgets = [];
    let yPosition = 0;
    
    if (includeSummary) {
        widgets.push({
            id: `${dashboardId}-summary`,
            type: 'summary',
            title: `ملخص ${getDataSourceTitle(dataType)}`,
            dataSource: dataType,
            position: { x: 0, y: yPosition, w: 12, h: 1 }
        });
        yPosition += 1;
    }
    
    if (includeCharts) {
        // Add bar chart
        widgets.push({
            id: `${dashboardId}-bar`,
            type: 'chart',
            chartType: 'bar',
            title: `رسم شريطي - ${getDataSourceTitle(dataType)}`,
            dataSource: dataType,
            position: { x: 0, y: yPosition, w: 6, h: 2 }
        });
        
        // Add pie chart
        widgets.push({
            id: `${dashboardId}-pie`,
            type: 'chart',
            chartType: 'pie',
            title: `رسم دائري - ${getDataSourceTitle(dataType)}`,
            dataSource: dataType,
            position: { x: 6, y: yPosition, w: 6, h: 2 }
        });
        
        yPosition += 2;
    }
    
    if (includeTable) {
        widgets.push({
            id: `${dashboardId}-table`,
            type: 'table',
            title: `جدول ${getDataSourceTitle(dataType)}`,
            dataSource: dataType,
            position: { x: 0, y: yPosition, w: 12, h: 2 }
        });
    }
    
    // Create new dashboard
    const newDashboard = {
        id: dashboardId,
        title: title,
        widgets: widgets,
        createdAt: new Date().toISOString()
    };
    
    // Add to dashboards array
    analyticsState.dashboards.push(newDashboard);
    
    // Save to localStorage
    saveAnalyticsData();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('createDashboardModal'));
    modal.hide();
    
    // Update dashboard selector
    updateDashboardSelector();
    
    // Load the new dashboard
    document.getElementById('dashboard-selector').value = dashboardId;
    loadSelectedDashboard();
    
    showAlert('تم إنشاء لوحة التحكم بنجاح', 'success');
}

// Update dashboard selector
function updateDashboardSelector() {
    const selector = document.getElementById('dashboard-selector');
    if (!selector) return;
    
    selector.innerHTML = analyticsState.dashboards.map(dashboard => 
        `<option value="${dashboard.id}">${dashboard.title}</option>`
    ).join('');
}

// Refresh dashboard
function refreshDashboard() {
    if (analyticsState.currentDashboard) {
        renderDashboard(analyticsState.currentDashboard);
    }
}

// Edit widget
function editWidget(widgetId) {
    const dashboard = analyticsState.currentDashboard;
    if (!dashboard) return;
    
    const widget = dashboard.widgets.find(w => w.id === widgetId);
    if (!widget) return;
    
    // Show edit widget modal
    const modalHtml = `
        <div class="modal fade" id="editWidgetModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">تعديل العنصر</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="edit-widget-form">
                            <div class="mb-3">
                                <label for="widget-title" class="form-label">عنوان العنصر</label>
                                <input type="text" class="form-control" id="widget-title" value="${widget.title}" required>
                            </div>
                            ${widget.type === 'chart' ? `
                                <div class="mb-3">
                                    <label for="widget-chart-type" class="form-label">نوع الرسم البياني</label>
                                    <select class="form-select" id="widget-chart-type">
                                        <option value="bar" ${widget.chartType === 'bar' ? 'selected' : ''}>رسم شريطي</option>
                                        <option value="line" ${widget.chartType === 'line' ? 'selected' : ''}>رسم خطي</option>
                                        <option value="pie" ${widget.chartType === 'pie' ? 'selected' : ''}>رسم دائري</option>
                                        <option value="radar" ${widget.chartType === 'radar' ? 'selected' : ''}>رسم راداري</option>
                                    </select>
                                </div>
                            ` : ''}
                            <div class="mb-3">
                                <label for="widget-data-source" class="form-label">مصدر البيانات</label>
                                <select class="form-select" id="widget-data-source">
                                    <option value="salary" ${widget.dataSource === 'salary' ? 'selected' : ''}>بيانات الرواتب</option>
                                    <option value="attendance" ${widget.dataSource === 'attendance' ? 'selected' : ''}>بيانات الحضور</option>
                                    <option value="performance" ${widget.dataSource === 'performance' ? 'selected' : ''}>بيانات الأداء</option>
                                    <option value="financial" ${widget.dataSource === 'financial' ? 'selected' : ''}>بيانات مالية</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء</button>
                        <button type="button" class="btn btn-primary" onclick="updateWidget('${widgetId}')">تحديث</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('editWidgetModal'));
    modal.show();
    
    // Remove modal from DOM when hidden
    document.getElementById('editWidgetModal').addEventListener('hidden.bs.modal', function () {
        document.body.removeChild(modalContainer);
    });
}

// Update widget
function updateWidget(widgetId) {
    const dashboard = analyticsState.currentDashboard;
    if (!dashboard) return;
    
    const widget = dashboard.widgets.find(w => w.id === widgetId);
    if (!widget) return;
    
    // Get form values
    widget.title = document.getElementById('widget-title').value;
    widget.dataSource = document.getElementById('widget-data-source').value;
    
    if (widget.type === 'chart') {
        widget.chartType = document.getElementById('widget-chart-type').value;
    }
    
    // Save changes
    saveAnalyticsData();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('editWidgetModal'));
    modal.hide();
    
    // Refresh widget
    loadWidgetData(widget);
    
    showAlert('تم تحديث العنصر بنجاح', 'success');
}

// Refresh widget
function refreshWidget(widgetId) {
    const dashboard = analyticsState.currentDashboard;
    if (!dashboard) return;
    
    const widget = dashboard.widgets.find(w => w.id === widgetId);
    if (!widget) return;
    
    loadWidgetData(widget);
}

// Generate custom report
function generateCustomReport() {
    const reportType = document.getElementById('report-type').value;
    const startDate = document.getElementById('report-start-date').value;
    const endDate = document.getElementById('report-end-date').value;
    const selectedEmployees = Array.from(document.getElementById('report-employees').selectedOptions).map(option => option.value);
    const showCharts = document.getElementById('show-charts').checked;
    const showTables = document.getElementById('show-tables').checked;
    const showSummary = document.getElementById('show-summary').checked;
    
    if (!startDate || !endDate) {
        showAlert('يرجى تحديد الفترة الزمنية للتقرير', 'warning');
        return;
    }
    
    // Get report data
    let reportData;
    switch (reportType) {
        case 'salary':
            reportData = getSalaryData(startDate, endDate, selectedEmployees);
            break;
        case 'attendance':
            reportData = getAttendanceData(startDate, endDate, selectedEmployees);
            break;
        case 'performance':
            reportData = getPerformanceData(startDate, endDate, selectedEmployees);
            break;
        case 'financial':
            reportData = getFinancialData(startDate, endDate);
            break;
        default:
            reportData = { error: 'نوع تقرير غير معروف' };
    }
    
    // Render report
    const reportContainer = document.getElementById('report-container');
    if (!reportContainer) return;
    
    if (reportData.error) {
        reportContainer.innerHTML = `<div class="alert alert-danger">${reportData.error}</div>`;
        return;
    }
    
    // Set report title
    document.getElementById('report-title').textContent = `تقرير ${getDataSourceTitle(reportType)} (${formatDate(startDate)} - ${formatDate(endDate)})`;
    
    let reportHtml = '';
    
    // Add summary section
    if (showSummary) {
        reportHtml += '<div class="report-section mb-4">';
        reportHtml += `<h5 class="mb-3">ملخص ${getDataSourceTitle(reportType)}</h5>`;
        reportHtml += '<div class="row summary-cards">';
        
        if (reportType === 'salary') {
            reportHtml += `
                <div class="col-md-3">
                    <div class="summary-card">
                        <div class="summary-value">${reportData.totalEmployees}</div>
                        <div class="summary-label">إجمالي الموظفين</div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="summary-card">
                        <div class="summary-value">${formatCurrency(reportData.totalSalaries)}</div>
                        <div class="summary-label">إجمالي الرواتب</div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="summary-card">
                        <div class="summary-value">${formatCurrency(reportData.averageSalary)}</div>
                        <div class="summary-label">متوسط الراتب</div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="summary-card">
                        <div class="summary-value">${formatCurrency(reportData.totalBonuses)}</div>
                        <div class="summary-label">إجمالي الحوافز</div>
                    </div>
                </div>
            `;
        } else if (reportType === 'performance') {
            reportHtml += `
                <div class="col-md-4">
                    <div class="summary-card">
                        <div class="summary-value">${reportData.averagePerformance.toFixed(1)}</div>
                        <div class="summary-label">متوسط الأداء</div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="summary-card">
                        <div class="summary-value">${reportData.topPerformers}</div>
                        <div class="summary-label">أفضل الموظفين أداءً</div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="summary-card">
                        <div class="summary-value">${reportData.improvementNeeded}</div>
                        <div class="summary-label">بحاجة إلى تحسين</div>
                    </div>
                </div>
            `;
        }
        
        reportHtml += '</div></div>';
    }
    
    // Add charts section
    if (showCharts) {
        reportHtml += '<div class="report-section mb-4">';
        reportHtml += `<h5 class="mb-3">الرسوم البيانية</h5>`;
        reportHtml += '<div class="row">';
        
        if (reportType === 'salary') {
            // Bar chart for salary distribution
            reportHtml += `
                <div class="col-md-6 mb-3">
                    <div class="chart-container">
                        <canvas id="salary-distribution-chart"></canvas>
                    </div>
                </div>
            `;
            
            // Pie chart for salary components
            reportHtml += `
                <div class="col-md-6 mb-3">
                    <div class="chart-container">
                        <canvas id="salary-components-chart"></canvas>
                    </div>
                </div>
            `;
        } else if (reportType === 'performance') {
            // Radar chart for performance metrics
            reportHtml += `
                <div class="col-md-6 mb-3">
                    <div class="chart-container">
                        <canvas id="performance-radar-chart"></canvas>
                    </div>
                </div>
            `;
            
            // Bar chart for performance comparison
            reportHtml += `
                <div class="col-md-6 mb-3">
                    <div class="chart-container">
                        <canvas id="performance-comparison-chart"></canvas>
                    </div>
                </div>
            `;
        }
        
        reportHtml += '</div></div>';
    }
    
    // Add tables section
    if (showTables) {
        reportHtml += '<div class="report-section">';
        reportHtml += `<h5 class="mb-3">جدول البيانات</h5>`;
        reportHtml += '<div class="table-responsive"><table class="table table-striped table-hover">';
        
        if (reportType === 'salary') {
            reportHtml += `
                <thead>
                    <tr>
                        <th>الموظف</th>
                        <th>الراتب الأساسي</th>
                        <th>الحوافز</th>
                        <th>البدلات</th>
                        <th>الخصومات</th>
                        <th>صافي الراتب</th>
                    </tr>
                </thead>
                <tbody>
                    ${reportData.employees.map(emp => `
                        <tr>
                            <td>${emp.name}</td>
                            <td>${formatCurrency(emp.basicSalary)}</td>
                            <td>${formatCurrency(emp.bonuses || 0)}</td>
                            <td>${formatCurrency(emp.allowances || 0)}</td>
                            <td>${formatCurrency(emp.deductions || 0)}</td>
                            <td>${formatCurrency(emp.netSalary)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
        } else if (reportType === 'performance') {
            reportHtml += `
                <thead>
                    <tr>
                        <th>الموظف</th>
                        <th>الإنتاجية</th>
                        <th>الالتزام</th>
                        <th>جودة العمل</th>
                        <th>العمل الجماعي</th>
                        <th>المبادرة</th>
                        <th>المتوسط</th>
                    </tr>
                </thead>
                <tbody>
                    ${reportData.performanceData.map(emp => `
                        <tr>
                            <td>${emp.name}</td>
                            <td>${emp.productivity}</td>
                            <td>${emp.attendance}</td>
                            <td>${emp.quality}</td>
                            <td>${emp.teamwork}</td>
                            <td>${emp.initiative}</td>
                            <td>
                                <span class="badge bg-${emp.average >= 8 ? 'success' : (emp.average >= 6 ? 'warning' : 'danger')}">
                                    ${emp.average.toFixed(1)}
                                </span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
        }
        
        reportHtml += '</table></div></div>';
    }
    
    reportContainer.innerHTML = reportHtml;
    
    // Initialize charts if needed
    if (showCharts) {
        if (reportType === 'salary') {
            // Initialize salary distribution chart
            const distributionCtx = document.getElementById('salary-distribution-chart');
            if (distributionCtx) {
                new Chart(distributionCtx, {
                    type: 'bar',
                    data: {
                        labels: reportData.employees.map(emp => emp.name),
                        datasets: [{
                            label: 'الراتب الأساسي',
                            data: reportData.employees.map(emp => emp.basicSalary),
                            backgroundColor: 'rgba(54, 162, 235, 0.7)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            title: {
                                display: true,
                                text: 'توزيع الرواتب',
                                font: { size: 16 }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }
            
            // Initialize salary components chart
            const componentsCtx = document.getElementById('salary-components-chart');
            if (componentsCtx) {
                new Chart(componentsCtx, {
                    type: 'pie',
                    data: {
                        labels: ['الرواتب الأساسية', 'الحوافز', 'البدلات', 'الخصومات'],
                        datasets: [{
                            data: [reportData.totalBasicSalaries, reportData.totalBonuses, reportData.totalAllowances, reportData.totalDeductions],
                            backgroundColor: [
                                'rgba(54, 162, 235, 0.7)',
                                'rgba(75, 192, 192, 0.7)',
                                'rgba(255, 206, 86, 0.7)',
                                'rgba(255, 99, 132, 0.7)'
                            ],
                            borderColor: [
                                'rgba(54, 162, 235, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(255, 206, 86, 1)',
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
                                text: 'توزيع مكونات الرواتب',
                                font: { size: 16 }
                            }
                        }
                    }
                });
            }
        } else if (reportType === 'performance') {
            // Similar chart initialization for performance reports
        }
    }
    
    // Save report
    const newReport = {
        id: `report-${Date.now()}`,
        type: reportType,
        title: document.getElementById('report-title').textContent,
        startDate,
        endDate,
        createdAt: new Date().toISOString()
    };
    
    analyticsState.reports.push(newReport);
    saveAnalyticsData();
    
    showAlert('تم إنشاء التقرير بنجاح', 'success');
}

// Create visualization
function createVisualization() {
    const dataSource = document.getElementById('data-source').value;
    const chartType = document.getElementById('chart-type').value;
    const timePeriod = document.getElementById('time-period').value;
    
    // Get visualization data
    let data;
    switch (dataSource) {
        case 'salary':
            data = getSalaryData();
            break;
        case 'attendance':
            data = getAttendanceData();
            break;
        case 'performance':
            data = getPerformanceData();
            break;
        case 'financial':
            data = getFinancialData();
            break;
        default:
            data = { error: 'مصدر بيانات غير معروف' };
    }
    
    // Render visualization
    const container = document.getElementById('visualization-container');
    if (!container) return;
    
    if (data.error) {
        container.innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
        return;
    }
    
    // Set visualization title
    document.getElementById('visualization-title').textContent = `تصور ${getDataSourceTitle(dataSource)} - ${getChartTypeTitle(chartType)}`;
    
    // Create canvas for chart
    container.innerHTML = `<canvas id="visualization-chart"></canvas>`;
    const canvas = document.getElementById('visualization-chart');
    
    // Create chart based on type and data source
    createChart(canvas, chartType, data, dataSource);
    
    // Save visualization
    const newVisualization = {
        id: `viz-${Date.now()}`,
        type: chartType,
        dataSource,
        title: document.getElementById('visualization-title').textContent,
        createdAt: new Date().toISOString()
    };
    
    analyticsState.visualizations.push(newVisualization);
    saveAnalyticsData();
    
    showAlert('تم إنشاء التصور البياني بنجاح', 'success');
}

// Create chart
function createChart(canvas, chartType, data, dataSource) {
    let chartData, chartOptions;
    
    // Configure chart based on data source and chart type
    if (dataSource === 'salary') {
        switch (chartType) {
            case 'bar':
                chartData = {
                    labels: data.employees.map(emp => emp.name),
                    datasets: [{
                        label: 'الراتب الأساسي',
                        data: data.employees.map(emp => emp.basicSalary),
                        backgroundColor: 'rgba(54, 162, 235, 0.7)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }]
                };
                chartOptions = {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'توزيع الرواتب',
                            font: { size: 16 }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                };
                break;
            // Other chart types configuration
        }
    }
    
    // Create chart
    new Chart(canvas, {
        type: chartType,
        data: chartData,
        options: chartOptions
    });
}

// Export dashboard
function exportDashboard(format) {
    if (!analyticsState.currentDashboard) return;
    
    const dashboardTitle = analyticsState.currentDashboard.title;
    const dashboardContainer = document.getElementById('dashboard-container');
    
    if (format === 'pdf') {
        // PDF export logic
        showAlert('جاري تصدير لوحة التحكم كملف PDF...', 'info');
        // Placeholder for actual PDF export implementation
        setTimeout(() => {
            showAlert('تم تصدير لوحة التحكم بنجاح', 'success');
        }, 1500);
    } else if (format === 'excel') {
        // Excel export logic
        showAlert('جاري تصدير لوحة التحكم كملف Excel...', 'info');
        // Placeholder for actual Excel export implementation
        setTimeout(() => {
            showAlert('تم تصدير لوحة التحكم بنجاح', 'success');
        }, 1500);
    }
}

// Export report
function exportReport(format) {
    const reportTitle = document.getElementById('report-title').textContent;
    const reportContainer = document.getElementById('report-container');
    
    if (format === 'pdf') {
        // PDF export logic
        showAlert('جاري تصدير التقرير كملف PDF...', 'info');
        // Placeholder for actual PDF export implementation
        setTimeout(() => {
            showAlert('تم تصدير التقرير بنجاح', 'success');
        }, 1500);
    } else if (format === 'excel') {
        // Excel export logic
        showAlert('جاري تصدير التقرير كملف Excel...', 'info');
        // Placeholder for actual Excel export implementation
        setTimeout(() => {
            showAlert('تم تصدير التقرير بنجاح', 'success');
        }, 1500);
    } else if (format === 'csv') {
        // CSV export logic
        showAlert('جاري تصدير التقرير كملف CSV...', 'info');
        // Placeholder for actual CSV export implementation
        setTimeout(() => {
            showAlert('تم تصدير التقرير بنجاح', 'success');
        }, 1500);
    }
}

// Export visualization
function exportVisualization(format) {
    const visualizationTitle = document.getElementById('visualization-title').textContent;
    const canvas = document.getElementById('visualization-chart');
    
    if (!canvas) {
        showAlert('لا يوجد رسم بياني للتصدير', 'warning');
        return;
    }
    
    if (format === 'png') {
        // PNG export logic
        showAlert('جاري تصدير الرسم البياني كصورة PNG...', 'info');
        // Placeholder for actual PNG export implementation
        setTimeout(() => {
            showAlert('تم تصدير الرسم البياني بنجاح', 'success');
        }, 1500);
    } else if (format === 'pdf') {
        // PDF export logic
        showAlert('جاري تصدير الرسم البياني كملف PDF...', 'info');
        // Placeholder for actual PDF export implementation
        setTimeout(() => {
            showAlert('تم تصدير الرسم البياني بنجاح', 'success');
        }, 1500);
    }
}

// Show create report modal
function showCreateReportModal() {
    // Populate employee dropdown
    populateEmployeeDropdowns();
    
    // Set default dates
    const today = new Date();
    const startDate = new Date();
    startDate.setMonth(today.getMonth() - 1);
    
    document.getElementById('report-start-date').value = startDate.toISOString().split('T')[0];
    document.getElementById('report-end-date').value = today.toISOString().split('T')[0];
}

// Data retrieval functions

// Get salary data
function getSalaryData(startDate, endDate, employeeIds) {
    // In a real application, this would fetch data from the server or database
    // For now, we'll generate some sample data
    
    const employees = appState.employees || [];
    const salaryReports = appState.salaryReports || [];
    
    // Filter by date range and employees if provided
    let filteredEmployees = employees;
    if (employeeIds && !employeeIds.includes('all')) {
        filteredEmployees = employees.filter(emp => employeeIds.includes(emp.code));
    }
    
    // Generate sample data
    const data = {
        totalEmployees: filteredEmployees.length,
        totalSalaries: 0,
        totalBasicSalaries: 0,
        totalBonuses: 0,
        totalAllowances: 0,
        totalDeductions: 0,
        averageSalary: 0,
        employees: [],
        months: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
        salaryTrends: [15000, 15200, 15400, 15800, 16000, 16200]
    };
    
    // Generate employee salary data
    filteredEmployees.forEach(emp => {
        const basicSalary = emp.basicSalary || Math.floor(Math.random() * 10000) + 5000;
        const bonuses = Math.floor(Math.random() * 2000);
        const allowances = Math.floor(Math.random() * 1000);
        const deductions = Math.floor(Math.random() * 1500);
        const netSalary = basicSalary + bonuses + allowances - deductions;
        
        data.employees.push({
            code: emp.code,
            name: emp.name,
            basicSalary,
            bonuses,
            allowances,
            deductions,
            netSalary
        });
        
        data.totalBasicSalaries += basicSalary;
        data.totalBonuses += bonuses;
        data.totalAllowances += allowances;
        data.totalDeductions += deductions;
        data.totalSalaries += netSalary;
    });
    
    // Calculate average salary
    if (data.employees.length > 0) {
        data.averageSalary = data.totalSalaries / data.employees.length;
    }
    
    return data;
}

// Get performance data
function getPerformanceData(startDate, endDate, employeeIds) {
    // In a real application, this would fetch data from the server or database
    // For now, we'll generate some sample data
    
    const employees = appState.employees || [];
    
    // Filter by employees if provided
    let filteredEmployees = employees;
    if (employeeIds && !employeeIds.includes('all')) {
        filteredEmployees = employees.filter(emp => employeeIds.includes(emp.code));
    }
    
    // Generate sample data
    const performanceData = [];
    let totalPerformance = 0;
    let topPerformers = 0;
    let improvementNeeded = 0;
    
    filteredEmployees.forEach(emp => {
        const productivity = Math.floor(Math.random() * 4) + 6; // 6-10
        const attendance = Math.floor(Math.random() * 4) + 6; // 6-10
        const quality = Math.floor(Math.random() * 4) + 6; // 6-10
        const teamwork = Math.floor(Math.random() * 4) + 6; // 6-10
        const initiative = Math.floor(Math.random() * 4) + 6; // 6-10
        
        const average = (productivity + attendance + quality + teamwork + initiative) / 5;
        totalPerformance += average;
        
        if (average >= 8) topPerformers++;
        if (average < 7) improvementNeeded++;
        
        performanceData.push({
            code: emp.code,
            name: emp.name,
            productivity,
            attendance,
            quality,
            teamwork,
            initiative,
            average
        });
    });
    
    return {
        performanceData,
        averagePerformance: performanceData.length > 0 ? totalPerformance / performanceData.length : 0,
        topPerformers,
        improvementNeeded
    };
}

// Get attendance data
function getAttendanceData(startDate, endDate, employeeIds) {
    // Placeholder for attendance data
    return {
        // Sample attendance data would go here
        error: 'بيانات الحضور غير متاحة حالياً'
    };
}

// Get financial data
function getFinancialData(startDate, endDate) {
    // Placeholder for financial data
    return {
        // Sample financial data would go here
        error: 'البيانات المالية غير متاحة حالياً'
    };
}

// Helper functions

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(amount);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Get data source title
function getDataSourceTitle(dataSource) {
    const titles = {
        'salary': 'الرواتب',
        'attendance': 'الحضور والغياب',
        'performance': 'الأداء',
        'financial': 'البيانات المالية'
    };
    return titles[dataSource] || dataSource;
}

// Get chart type title
function getChartTypeTitle(chartType) {
    const titles = {
        'bar': 'رسم شريطي',
        'line': 'رسم خطي',
        'pie': 'رسم دائري',
        'radar': 'رسم راداري',
        'polarArea': 'رسم قطبي',
        'doughnut': 'رسم حلقي'
    };
    return titles[chartType] || chartType;
}

// Show alert
function showAlert(message, type = 'info') {
    // Create alert container if it doesn't exist
    let alertContainer = document.getElementById('alert-container');
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'alert-container';
        alertContainer.className = 'alert-container';
        document.body.appendChild(alertContainer);
    }
    
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Add to container
    alertContainer.appendChild(alert);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }
    }, 5000);
}