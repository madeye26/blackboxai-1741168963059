// Dashboard Customization Functionality

// Default dashboard layout configuration
const defaultDashboardConfig = {
    layout: [
        { id: 'stats-row', visible: true, order: 1 },
        { id: 'quick-actions', visible: true, order: 2 },
        { id: 'recent-activities', visible: true, order: 3 },
        { id: 'employee-chart', visible: true, order: 4 },
        { id: 'salary-chart', visible: true, order: 5 }
    ],
    userPreferences: {
        showWelcomeMessage: true,
        compactView: false,
        animationsEnabled: true
    }
};

// Get user dashboard configuration
function getUserDashboardConfig() {
    const savedConfig = localStorage.getItem('dashboardConfig');
    return savedConfig ? JSON.parse(savedConfig) : defaultDashboardConfig;
}

// Save user dashboard configuration
function saveDashboardConfig(config) {
    localStorage.setItem('dashboardConfig', JSON.stringify(config));
}

// Apply dashboard layout based on configuration
function applyDashboardLayout() {
    const config = getUserDashboardConfig();
    
    // Sort sections by order
    const sortedLayout = [...config.layout].sort((a, b) => a.order - b.order);
    
    // Apply visibility and order
    sortedLayout.forEach(section => {
        const sectionElement = document.getElementById(section.id);
        if (sectionElement) {
            // Set visibility
            sectionElement.style.display = section.visible ? '' : 'none';
            
            // Reorder in DOM
            const parent = sectionElement.parentNode;
            parent.appendChild(sectionElement);
        }
    });
    
    // Apply user preferences
    applyUserPreferences(config.userPreferences);
}

// Apply user preferences
function applyUserPreferences(preferences) {
    const dashboardContainer = document.querySelector('.dashboard-container');
    if (!dashboardContainer) return;
    
    // Apply compact view if enabled
    if (preferences.compactView) {
        dashboardContainer.classList.add('compact-view');
    } else {
        dashboardContainer.classList.remove('compact-view');
    }
    
    // Apply animations toggle
    if (preferences.animationsEnabled) {
        dashboardContainer.classList.remove('no-animations');
    } else {
        dashboardContainer.classList.add('no-animations');
    }
    
    // Show/hide welcome message
    const welcomeMessage = document.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.style.display = preferences.showWelcomeMessage ? '' : 'none';
    }
}

// Create dashboard customization modal
function createCustomizationModal() {
    // Check if modal already exists
    if (document.getElementById('dashboard-customize-modal')) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'dashboard-customize-modal';
    modal.setAttribute('tabindex', '-1');
    modal.setAttribute('aria-labelledby', 'customizeModalLabel');
    modal.setAttribute('aria-hidden', 'true');
    
    const config = getUserDashboardConfig();
    
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="customizeModalLabel">تخصيص لوحة التحكم</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row mb-4">
                        <div class="col-12">
                            <h6 class="mb-3">ترتيب وإظهار العناصر</h6>
                            <div class="dashboard-sections-list">
                                ${config.layout.map((section, index) => `
                                    <div class="dashboard-section-item" data-id="${section.id}">
                                        <div class="d-flex align-items-center">
                                            <i class="fas fa-grip-vertical me-2 handle"></i>
                                            <div class="form-check form-switch ms-2">
                                                <input class="form-check-input section-visibility" type="checkbox" id="section-${section.id}" ${section.visible ? 'checked' : ''}>
                                                <label class="form-check-label" for="section-${section.id}">
                                                    ${getSectionName(section.id)}
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <h6 class="mb-3">خيارات العرض</h6>
                            <div class="form-check form-switch mb-3">
                                <input class="form-check-input" type="checkbox" id="welcome-message-toggle" ${config.userPreferences.showWelcomeMessage ? 'checked' : ''}>
                                <label class="form-check-label" for="welcome-message-toggle">عرض رسالة الترحيب</label>
                            </div>
                            <div class="form-check form-switch mb-3">
                                <input class="form-check-input" type="checkbox" id="compact-view-toggle" ${config.userPreferences.compactView ? 'checked' : ''}>
                                <label class="form-check-label" for="compact-view-toggle">عرض مضغوط</label>
                            </div>
                            <div class="form-check form-switch mb-3">
                                <input class="form-check-input" type="checkbox" id="animations-toggle" ${config.userPreferences.animationsEnabled ? 'checked' : ''}>
                                <label class="form-check-label" for="animations-toggle">تفعيل الحركات</label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <h6 class="mb-3">إعدادات إضافية</h6>
                            <button class="btn btn-outline-secondary w-100 mb-2" id="reset-dashboard-btn">
                                <i class="fas fa-undo me-2"></i>استعادة الإعدادات الافتراضية
                            </button>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء</button>
                    <button type="button" class="btn btn-primary" id="save-dashboard-config">حفظ التغييرات</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Initialize event listeners for the modal
    initializeCustomizationModalEvents();
}

// Get readable section name from ID
function getSectionName(id) {
    const sectionNames = {
        'stats-row': 'إحصائيات سريعة',
        'quick-actions': 'إجراءات سريعة',
        'recent-activities': 'النشاطات الأخيرة',
        'employee-chart': 'رسم بياني للموظفين',
        'salary-chart': 'رسم بياني للرواتب'
    };
    
    return sectionNames[id] || id;
}

// Initialize event listeners for customization modal
function initializeCustomizationModalEvents() {
    // Save button event
    const saveButton = document.getElementById('save-dashboard-config');
    if (saveButton) {
        saveButton.addEventListener('click', saveCustomizationChanges);
    }
    
    // Reset button event
    const resetButton = document.getElementById('reset-dashboard-btn');
    if (resetButton) {
        resetButton.addEventListener('click', resetDashboardConfig);
    }
    
    // Initialize drag and drop for sections (using a simple implementation)
    // Note: In a real implementation, you might want to use a library like SortableJS
    initializeDragAndDrop();
}

// Initialize drag and drop functionality using SortableJS
function initializeDragAndDrop() {
    // Check if Sortable is available
    if (typeof Sortable === 'undefined') {
        console.error('Sortable library is not loaded. Please include the SortableJS library.');
        return;
    }
    
    // Initialize sortable for dashboard sections list in customization modal
    const sectionsList = document.querySelector('.dashboard-sections-list');
    if (sectionsList) {
        new Sortable(sectionsList, {
            animation: 150,
            handle: '.handle',
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            onEnd: function(evt) {
                // Update the order in the configuration based on new positions
                updateSectionOrderFromModal();
            }
        });
    }
}

// Save customization changes
function saveCustomizationChanges() {
    const config = getUserDashboardConfig();
    
    // Update section visibility
    const visibilityToggles = document.querySelectorAll('.section-visibility');
    visibilityToggles.forEach(toggle => {
        const sectionId = toggle.id.replace('section-', '');
        const sectionConfig = config.layout.find(item => item.id === sectionId);
        if (sectionConfig) {
            sectionConfig.visible = toggle.checked;
        }
    });
    
    // Update order based on DOM order
    // In a real implementation with drag and drop, you would get the order from the sorted items
    
    // Update user preferences
    config.userPreferences.showWelcomeMessage = document.getElementById('welcome-message-toggle').checked;
    config.userPreferences.compactView = document.getElementById('compact-view-toggle').checked;
    config.userPreferences.animationsEnabled = document.getElementById('animations-toggle').checked;
    
    // Save and apply changes
    saveDashboardConfig(config);
    applyDashboardLayout();
    
    // Close modal
    const modalElement = document.getElementById('dashboard-customize-modal');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) {
        modalInstance.hide();
    }
    
    // Show success message
    showAlert('تم حفظ تخصيص لوحة التحكم بنجاح', 'success');
}

// Reset dashboard configuration to defaults
function resetDashboardConfig() {
    if (confirm('هل أنت متأكد من استعادة الإعدادات الافتراضية؟')) {
        saveDashboardConfig(defaultDashboardConfig);
        applyDashboardLayout();
        
        // Close and reopen modal to reflect changes
        const modalElement = document.getElementById('dashboard-customize-modal');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
            modalInstance.hide();
            setTimeout(() => {
                createCustomizationModal();
                new bootstrap.Modal(document.getElementById('dashboard-customize-modal')).show();
            }, 500);
        }
        
        showAlert('تم استعادة الإعدادات الافتراضية', 'info');
    }
}

// Create dashboard customize button
function createDashboardCustomizeButton() {
    // Check if button already exists
    if (document.querySelector('.dashboard-customize-btn')) return;
    
    const customizeBtn = document.createElement('div');
    customizeBtn.className = 'dashboard-customize-btn';
    customizeBtn.setAttribute('title', 'تخصيص لوحة التحكم');
    customizeBtn.innerHTML = '<i class="fas fa-cog"></i>';
    
    customizeBtn.addEventListener('click', () => {
        createCustomizationModal();
        new bootstrap.Modal(document.getElementById('dashboard-customize-btn')).show();
    });
    
    document.body.appendChild(customizeBtn);
}

// Initialize dashboard customization
function initializeDashboardCustomization() {
    // Create customize button
    createDashboardCustomizeButton();
    
    // Apply saved layout
    applyDashboardLayout();
    
    // Add event listener for dashboard tab to reapply layout when dashboard is shown
    const dashboardTab = document.getElementById('dashboard-tab');
    if (dashboardTab) {
        dashboardTab.addEventListener('click', applyDashboardLayout);
    }
}

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeDashboardCustomization);