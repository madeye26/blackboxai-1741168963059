// Data Visualization Functions for Reports

// Initialize Chart.js with Arabic locale
function initializeChartLocale() {
    if (Chart.defaults) {
        Chart.defaults.font.family = 'Tajawal, sans-serif';
        Chart.defaults.color = '#495057';
        Chart.defaults.plugins.tooltip.rtl = true;
        Chart.defaults.plugins.tooltip.titleAlign = 'right';
        Chart.defaults.plugins.tooltip.bodyAlign = 'right';
    }
}

// Create monthly salary breakdown chart
function createMonthlySalaryChart(reports, container) {
    const ctx = document.getElementById(container).getContext('2d');
    
    // Extract employee names and net salaries
    const labels = reports.map(report => report.employeeName);
    const netSalaries = reports.map(report => report.calculations.netSalary);
    const basicSalaries = reports.map(report => report.calculations.basicSalary);
    const incentives = reports.map(report => report.calculations.incentivesAmount || 0);
    const deductions = reports.map(report => report.calculations.totalDeductions);
    
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'الراتب الأساسي',
                    data: basicSalaries,
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'الحوافز',
                    data: incentives,
                    backgroundColor: 'rgba(75, 192, 192, 0.7)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: 'الخصومات',
                    data: deductions,
                    backgroundColor: 'rgba(255, 99, 132, 0.7)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                },
                {
                    label: 'صافي الراتب',
                    data: netSalaries,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    type: 'line',
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'تفاصيل رواتب الموظفين',
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
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('ar-EG', { 
                                    style: 'currency', 
                                    currency: 'EGP' 
                                }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        align: 'center'
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString('ar-EG') + ' ج.م';
                        }
                    }
                }
            }
        }
    });
}

// Create yearly trend chart
function createYearlyTrendChart(monthlyData, container) {
    const ctx = document.getElementById(container).getContext('2d');
    
    // Process data for chart
    const months = Object.keys(monthlyData).sort();
    const formattedMonths = months.map(month => formatMonth(month));
    
    const salaryData = months.map(month => monthlyData[month].totalSalaries);
    const incentivesData = months.map(month => monthlyData[month].totalIncentives);
    const advancesData = months.map(month => monthlyData[month].totalAdvances);
    const deductionsData = months.map(month => monthlyData[month].totalDeductions);
    
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: formattedMonths,
            datasets: [
                {
                    label: 'إجمالي الرواتب',
                    data: salaryData,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2,
                    tension: 0.3
                },
                {
                    label: 'إجمالي الحوافز',
                    data: incentivesData,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    tension: 0.3
                },
                {
                    label: 'إجمالي السلف',
                    data: advancesData,
                    backgroundColor: 'rgba(255, 159, 64, 0.2)',
                    borderColor: 'rgba(255, 159, 64, 1)',
                    borderWidth: 2,
                    tension: 0.3
                },
                {
                    label: 'إجمالي الخصومات',
                    data: deductionsData,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 2,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'اتجاهات الرواتب الشهرية',
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
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('ar-EG', { 
                                    style: 'currency', 
                                    currency: 'EGP' 
                                }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString('ar-EG') + ' ج.م';
                        }
                    }
                }
            }
        }
    });
}

// Create salary distribution pie chart
function createSalaryDistributionChart(reports, container) {
    const ctx = document.getElementById(container).getContext('2d');
    
    // Group employees by salary ranges
    const salaryRanges = {
        'أقل من 3000': 0,
        '3000 - 5000': 0,
        '5000 - 8000': 0,
        '8000 - 12000': 0,
        'أكثر من 12000': 0
    };
    
    reports.forEach(report => {
        const salary = report.calculations.basicSalary;
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
    
    return new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
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
                    text: 'توزيع الرواتب',
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
                            return `${label}: ${value} موظف (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Helper function to format month for charts
function formatMonthForChart(monthStr) {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('ar-EG', { month: 'short' });
}

// Add charts to monthly report
function enhanceMonthlyReportWithCharts(monthlyReports, month) {
    const reportContent = document.getElementById('monthly-report-content');
    
    // Add chart containers if they don't exist
    if (!document.getElementById('monthly-salary-chart-container')) {
        const chartSection = document.createElement('div');
        chartSection.className = 'charts-section mt-4';
        chartSection.innerHTML = `
            <div class="row">
                <div class="col-md-8 mb-4">
                    <div class="chart-card">
                        <h5 class="chart-title">رسم بياني للرواتب</h5>
                        <canvas id="monthly-salary-chart"></canvas>
                    </div>
                </div>
                <div class="col-md-4 mb-4">
                    <div class="chart-card">
                        <h5 class="chart-title">توزيع الرواتب</h5>
                        <canvas id="salary-distribution-chart"></canvas>
                    </div>
                </div>
            </div>
        `;
        reportContent.appendChild(chartSection);
    }
    
    // Create charts
    createMonthlySalaryChart(monthlyReports, 'monthly-salary-chart');
    createSalaryDistributionChart(monthlyReports, 'salary-distribution-chart');
}

// Add charts to yearly report
function enhanceYearlyReportWithCharts(monthlyBreakdown, year) {
    const reportContent = document.getElementById('yearly-report-content');
    
    // Add chart container if it doesn't exist
    if (!document.getElementById('yearly-trend-chart-container')) {
        const chartSection = document.createElement('div');
        chartSection.className = 'charts-section mt-4';
        chartSection.innerHTML = `
            <div class="chart-card">
                <h5 class="chart-title">اتجاهات الرواتب السنوية</h5>
                <canvas id="yearly-trend-chart"></canvas>
            </div>
        `;
        reportContent.appendChild(chartSection);
    }
    
    // Create chart
    createYearlyTrendChart(monthlyBreakdown, 'yearly-trend-chart');
}