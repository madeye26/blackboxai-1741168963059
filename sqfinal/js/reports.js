// Reports System Functions
function loadReportsSystem() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="form-container">
            <h3 class="mb-4">نظام التقارير</h3>
            <ul class="nav nav-tabs" id="reportTabs" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="monthly-tab" data-bs-toggle="tab" 
                            data-bs-target="#monthly" type="button" role="tab">
                        التقارير الشهرية
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="yearly-tab" data-bs-toggle="tab" 
                            data-bs-target="#yearly" type="button" role="tab">
                        التقارير السنوية
                    </button>
                </li>
            </ul>
            <div class="tab-content mt-3" id="reportsTabContent">
                <div class="tab-pane fade show active" id="monthly" role="tabpanel">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label class="form-label">اختر الشهر</label>
                            <input type="month" class="form-control" id="report-month">
                        </div>
                        <div class="col-md-6 d-flex align-items-end">
                            <button class="btn btn-primary" id="generate-monthly-btn" onclick="generateMonthlyReport()">
                                <span class="btn-text">عرض التقرير</span>
                            </button>
                            <button class="btn btn-secondary ms-2" onclick="backupData()">
                                <i class="fas fa-download me-2"></i>نسخة احتياطية
                            </button>
                            <label class="btn btn-secondary ms-2 mb-0">
                                <i class="fas fa-upload me-2"></i>استعادة البيانات
                                <input type="file" hidden accept=".json" onchange="restoreData(this.files[0])">
                            </label>
                        </div>
                    </div>
                    <div id="monthly-report-content"></div>
                </div>
                <div class="tab-pane fade" id="yearly" role="tabpanel">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label class="form-label">اختر السنة</label>
                            <select class="form-select" id="report-year">
                                ${generateYearOptions()}
                            </select>
                        </div>
                        <div class="col-md-6 d-flex align-items-end">
                            <button class="btn btn-primary" id="generate-yearly-btn" onclick="generateYearlyReport()">
                                <span class="btn-text">عرض التقرير</span>
                            </button>
                        </div>
                    </div>
                    <div id="yearly-report-content"></div>
                </div>
            </div>
        </div>
    `;
}

// Helper Functions
function showLoading(buttonId) {
    const btn = document.getElementById(buttonId);
    const btnText = btn.querySelector('.btn-text');
    const originalText = btnText.textContent;
    btnText.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> جاري التحميل...';
    btn.disabled = true;
    return () => {
        btnText.textContent = originalText;
        btn.disabled = false;
    };
}

function calculateTotals(reports) {
    return reports.reduce((totals, report) => {
        totals.totalSalaries += report.calculations.basicSalary;
        totals.totalIncentives += report.calculations.incentivesAmount;
        totals.totalAdvances += report.calculations.advancesAmount;
        totals.totalDeductions += report.calculations.totalDeductions;
        return totals;
    }, {
        totalSalaries: 0,
        totalIncentives: 0,
        totalAdvances: 0,
        totalDeductions: 0
    });
}

function calculateTrend(current, previous) {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
}

// Generate Monthly Report
async function generateMonthlyReport() {
    const month = document.getElementById('report-month').value;
    if (!month) {
        showAlert('الرجاء اختيار الشهر', 'warning');
        return;
    }

    const resetLoading = showLoading('generate-monthly-btn');
    const reportContent = document.getElementById('monthly-report-content');

    try {
        const monthlyReports = appState.salaryReports.filter(report => report.month === month);
        
        if (monthlyReports.length === 0) {
            reportContent.innerHTML = '<div class="alert alert-info">لا توجد بيانات لهذا الشهر</div>';
            return;
        }

        const totals = calculateTotals(monthlyReports);
        const previousMonth = getPreviousMonthData(month);
        const trend = calculateTrend(totals.totalSalaries, previousMonth?.totalSalaries || 0);

        reportContent.innerHTML = generateMonthlyReportHTML(monthlyReports, totals, trend, month);
        
        // Initialize Chart.js locale settings
        initializeChartLocale();
        
        // Add charts to the report
        enhanceMonthlyReportWithCharts(monthlyReports, month);
        
        // Add export buttons
        addExportButtons('monthly', month, reportContent);

    } catch (error) {
        console.error('Report generation error:', error);
        reportContent.innerHTML = `<div class="alert alert-danger">حدث خطأ أثناء إنشاء التقرير</div>`;
    } finally {
        resetLoading();
    }
}

// Generate Yearly Report
async function generateYearlyReport() {
    const year = document.getElementById('report-year').value;
    if (!year) {
        showAlert('الرجاء اختيار السنة', 'warning');
        return;
    }

    const resetLoading = showLoading('generate-yearly-btn');
    const reportContent = document.getElementById('yearly-report-content');

    try {
        const yearlyReports = appState.salaryReports.filter(report => report.month.startsWith(year));
        
        if (yearlyReports.length === 0) {
            reportContent.innerHTML = '<div class="alert alert-info">لا توجد بيانات لهذه السنة</div>';
            return;
        }

        const monthlyBreakdown = calculateMonthlyBreakdown(yearlyReports);
        const yearlyTotals = calculateYearlyTotals(monthlyBreakdown);

        reportContent.innerHTML = generateYearlyReportHTML(yearlyTotals, monthlyBreakdown, year);
        
        // Initialize Chart.js locale settings
        initializeChartLocale();
        
        // Add charts to the yearly report
        enhanceYearlyReportWithCharts(monthlyBreakdown, year);
        
        // Add export buttons
        addExportButtons('yearly', year, reportContent);

    } catch (error) {
        console.error('Report generation error:', error);
        reportContent.innerHTML = `<div class="alert alert-danger">حدث خطأ أثناء إنشاء التقرير</div>`;
    } finally {
        resetLoading();
    }
}

// Export Functions
async function exportToExcel(type, period) {
    try {
        const data = type === 'monthly' ? 
            prepareMonthlyExportData(period) : 
            prepareYearlyExportData(period);

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Report");
        
        const fileName = `${type}_report_${period}.xlsx`;
        XLSX.writeFile(wb, fileName);
        
        showAlert('تم تصدير التقرير بنجاح', 'success');
    } catch (error) {
        console.error('Export error:', error);
        showAlert('حدث خطأ أثناء تصدير التقرير', 'danger');
    }
}

// Add export buttons to reports
function addExportButtons(type, period, container) {
    // Create export buttons container if it doesn't exist
    if (!document.querySelector('.export-buttons')) {
        const exportBtns = document.createElement('div');
        exportBtns.className = 'export-buttons';
        exportBtns.innerHTML = `
            <button class="btn btn-sm btn-outline-success export-btn" onclick="exportToExcel('${type}', '${period}')">
                <i class="fas fa-file-excel"></i> تصدير Excel
            </button>
            <button class="btn btn-sm btn-outline-danger export-btn" onclick="exportToPDF('${type}', '${period}')">
                <i class="fas fa-file-pdf"></i> تصدير PDF
            </button>
            <button class="btn btn-sm btn-outline-primary export-btn" onclick="window.print()">
                <i class="fas fa-print"></i> طباعة
            </button>
        `;
        
        // Insert before the report content
        container.parentNode.insertBefore(exportBtns, container);
    }
}

async function exportToPDF(type, period) {
    try {
        const element = document.getElementById(`${type}-report-content`);
        const fileName = `${type}_report_${period}.pdf`;
        
        const opt = {
            margin: 1,
            filename: fileName,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
        };

        await html2pdf().set(opt).from(element).save();
        showAlert('تم تصدير التقرير بنجاح', 'success');
    } catch (error) {
        console.error('Export error:', error);
        showAlert('حدث خطأ أثناء تصدير التقرير', 'danger');
    }
}

// Data Preparation Functions
function prepareMonthlyExportData(month) {
    const reports = appState.salaryReports.filter(report => report.month === month);
    return reports.map(report => ({
        'اسم الموظف': report.employeeName,
        'الراتب الأساسي': `${report.calculations.basicSalary.toFixed(2)} ج.م`,
        'الحوافز': `${report.calculations.incentivesAmount.toFixed(2)} ج.م`,
        'الأوفرتايم': `${report.calculations.overtimeAmount.toFixed(2)} ج.م`,
        'الخصومات': `${report.calculations.totalDeductions.toFixed(2)} ج.م`,
        'صافي الراتب': `${report.calculations.netSalary.toFixed(2)} ج.م`
    }));
}

function prepareYearlyExportData(year) {
    const reports = appState.salaryReports.filter(report => report.month.startsWith(year));
    const monthlyBreakdown = calculateMonthlyBreakdown(reports);
    
    return Object.entries(monthlyBreakdown).map(([month, totals]) => ({
        'الشهر': formatMonth(month),
        'إجمالي الرواتب': `${totals.totalSalaries.toFixed(2)} ج.م`,
        'إجمالي الحوافز': `${totals.totalIncentives.toFixed(2)} ج.م`,
        'إجمالي السلف': `${totals.totalAdvances.toFixed(2)} ج.م`,
        'إجمالي الخصومات': `${totals.totalDeductions.toFixed(2)} ج.م`
    }));
}

// Utility Functions
function generateYearOptions() {
    const currentYear = new Date().getFullYear();
    let options = '';
    for (let year = currentYear; year >= currentYear - 5; year--) {
        options += `<option value="${year}">${year}</option>`;
    }
    return options;
}

function formatMonth(monthStr) {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' });
}

function getPreviousMonthData(currentMonth) {
    const [year, month] = currentMonth.split('-');
    const previousDate = new Date(year, parseInt(month) - 2);
    const previousMonth = previousDate.toISOString().slice(0, 7);
    
    const previousReports = appState.salaryReports.filter(report => report.month === previousMonth);
    return previousReports.length > 0 ? calculateTotals(previousReports) : null;
}

function calculateMonthlyBreakdown(reports) {
    const breakdown = {};
    reports.forEach(report => {
        const month = report.month;
        if (!breakdown[month]) {
            breakdown[month] = {
                totalSalaries: 0,
                totalIncentives: 0,
                totalAdvances: 0,
                totalDeductions: 0
            };
        }
        
        const calcs = report.calculations;
        breakdown[month].totalSalaries += calcs.basicSalary;
        breakdown[month].totalIncentives += calcs.incentivesAmount;
        breakdown[month].totalAdvances += calcs.advancesAmount;
        breakdown[month].totalDeductions += calcs.totalDeductions;
    });
    return breakdown;
}

function calculateYearlyTotals(monthlyBreakdown) {
    return Object.values(monthlyBreakdown).reduce((totals, month) => {
        totals.totalSalaries += month.totalSalaries;
        totals.totalIncentives += month.totalIncentives;
        totals.totalAdvances += month.totalAdvances;
        totals.totalDeductions += month.totalDeductions;
        return totals;
    }, {
        totalSalaries: 0,
        totalIncentives: 0,
        totalAdvances: 0,
        totalDeductions: 0
    });
}
