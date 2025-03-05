// Display salary calculation results
function displaySalaryResult(employee, calculations, month) {
    const resultDiv = document.getElementById('salary-result');
    resultDiv.innerHTML = `
        <div class="salary-card">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h4 class="m-0">نتيجة حساب الراتب</h4>
                <button class="btn btn-primary" onclick="printSalarySlip('${employee.code}', '${month}')">
                    <i class="fas fa-print me-2"></i>طباعة كشف الراتب
                </button>
            </div>
            
            <!-- بيانات الموظف -->
            <div class="section-card mb-4">
                <h5 class="section-title">بيانات الموظف</h5>
                <div class="row">
                    <div class="col-md-4 mb-3">
                        <div class="salary-component">
                            <div class="title">كود الموظف</div>
                            <div class="value">${employee.code}</div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="salary-component">
                            <div class="title">اسم الموظف</div>
                            <div class="value">${employee.name}</div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="salary-component">
                            <div class="title">الشهر</div>
                            <div class="value">${month}</div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-4 mb-3">
                        <div class="salary-component">
                            <div class="title">عدد أيام العمل</div>
                            <div class="value">${calculations.workDays}</div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="salary-component">
                            <div class="title">قيمة الوحدة اليومية</div>
                            <div class="value">${calculations.dailyRate.toFixed(2)} ج.م</div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="salary-component">
                            <div class="title">قيمة اليوم بالحوافز</div>
                            <div class="value">${calculations.dailyRateWithIncentives.toFixed(2)} ج.م</div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-4 mb-3">
                        <div class="salary-component">
                            <div class="title">عدد ساعات العمل</div>
                            <div class="value">${calculations.dailyWorkHours}</div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="salary-component">
                            <div class="title">قيمة وحدة الأوفرتايم</div>
                            <div class="value">${calculations.overtimeUnitValue.toFixed(2)} ج.م</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- المستحقات -->
            <div class="section-card mb-4">
                <h5 class="section-title">المستحقات</h5>
                <div class="row">
                    <div class="col-md-3 mb-3">
                        <div class="salary-component">
                            <div class="title">الراتب الأساسي</div>
                            <div class="value">${calculations.basicSalary.toFixed(2)} ج.م</div>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="salary-component">
                            <div class="title">الحوافز الشهرية</div>
                            <div class="value">${calculations.monthlyIncentives.toFixed(2)} ج.م</div>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="salary-component">
                            <div class="title">المكافأة</div>
                            <div class="value">${calculations.bonus.toFixed(2)} ج.م</div>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="salary-component">
                            <div class="title">قيمة الأوفرتايم</div>
                            <div class="value">${calculations.overtimeAmount.toFixed(2)} ج.م</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- الخصومات -->
            <div class="section-card mb-4">
                <h5 class="section-title">الخصومات</h5>
                <div class="row">
                    <div class="col-md-4 mb-3">
                        <div class="salary-component">
                            <div class="title">المشتريات</div>
                            <div class="value text-danger">${calculations.deductions.purchases.toFixed(2)} ج.م</div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="salary-component">
                            <div class="title">السلف المستحقة</div>
                            <div class="value text-danger">${calculations.deductions.advances.toFixed(2)} ج.م</div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="salary-component">
                            <div class="title">أيام الغياب</div>
                            <div class="value">${calculations.absenceDays}</div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-4 mb-3">
                        <div class="salary-component">
                            <div class="title">الغيابات</div>
                            <div class="value text-danger">${calculations.deductions.absenceDeductions.toFixed(2)} ج.م</div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="salary-component">
                            <div class="title">الخصومات/الساعات</div>
                            <div class="value text-danger">${calculations.deductions.hourlyDeductions.toFixed(2)} ج.م</div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="salary-component">
                            <div class="title">أيام الجزاءات</div>
                            <div class="value">${calculations.penaltyDays || 0}</div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-4 mb-3">
                        <div class="salary-component">
                            <div class="title">الجزاءات</div>
                            <div class="value text-danger">${calculations.deductions.penalties.toFixed(2)} ج.م</div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="salary-component">
                            <div class="title">إجمالي الخصومات</div>
                            <div class="value text-danger">${calculations.totalDeductions.toFixed(2)} ج.م</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- الإجماليات -->
            <div class="section-card">
                <h5 class="section-title">الإجماليات</h5>
                <div class="row">
                    <div class="col-md-4 mb-3">
                        <div class="salary-component">
                            <div class="title">إجمالي المرتب بالحافز</div>
                            <div class="value">${calculations.totalSalaryWithIncentives.toFixed(2)} ج.م</div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="salary-component">
                            <div class="title">إجمالي الراتب</div>
                            <div class="value">${calculations.grossSalary.toFixed(2)} ج.م</div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="salary-component highlight">
                            <div class="title">صافي الراتب</div>
                            <div class="value text-success">${calculations.netSalary.toFixed(2)} ج.م</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Print salary slip
function printSalarySlip(employeeCode, month) {
    const report = appState.salaryReports.find(
        r => r.employeeCode === employeeCode && r.month === month
    );

    if (!report) {
        showAlert('لم يتم العثور على تقرير الراتب', 'danger');
        return;
    }

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>كشف راتب - ${report.employeeName}</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.rtl.min.css">
            <link rel="stylesheet" href="styles/main.css">
            <style>
                @media print {
                    body {
                        padding: 20px;
                    }
                    .print-header {
                        text-align: center;
                        margin-bottom: 30px;
                    }
                    .print-header h2 {
                        margin-bottom: 10px;
                    }
                    .print-header p {
                        margin-bottom: 5px;
                        color: #666;
                    }
                }
            </style>
        </head>
        <body>
            <div class="print-header">
                <h2>كشف راتب</h2>
                <p>الموظف: ${report.employeeName}</p>
                <p>كود الموظف: ${report.employeeCode}</p>
                <p>الشهر: ${report.month}</p>
            </div>
            <div id="salary-result">
                ${document.getElementById('salary-result').innerHTML}
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
        printWindow.print();
    }, 500);
}
