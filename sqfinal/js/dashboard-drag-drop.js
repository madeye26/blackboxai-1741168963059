// Dashboard Drag and Drop Functionality

// Initialize SortableJS for dashboard sections
function initializeDashboardDragDrop() {
    // Check if Sortable is available (we'll add the CDN in index.html)
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
                // Update the order in the configuration
                updateSectionOrder();
            }
        });
    }

    // Initialize sortable for the actual dashboard sections when in edit mode
    const dashboardContainer = document.querySelector('.dashboard-container');
    if (dashboardContainer) {
        // Only initialize if in edit mode
        if (dashboardContainer.classList.contains('edit-mode')) {
            new Sortable(dashboardContainer, {
                animation: 150,
                handle: '.section-drag-handle',
                ghostClass: 'sortable-ghost',
                chosenClass: 'sortable-chosen',
                dragClass: 'sortable-drag',
                onEnd: function(evt) {
                    // Update the order in the configuration
                    updateLiveSectionOrder();
                }
            });
        }
    }
}

// Update section order based on the current DOM order in the customization modal
function updateSectionOrder() {
    const config = getUserDashboardConfig();
    const sectionItems = document.querySelectorAll('.dashboard-section-item');
    
    // Update order in config based on DOM order
    sectionItems.forEach((item, index) => {
        const sectionId = item.getAttribute('data-id');
        const sectionConfig = config.layout.find(section => section.id === sectionId);
        if (sectionConfig) {
            sectionConfig.order = index + 1;
        }
    });
    
    // Save the updated configuration
    saveDashboardConfig(config);
}

// Update section order based on live dashboard rearrangement
function updateLiveSectionOrder() {
    const config = getUserDashboardConfig();
    const sectionElements = document.querySelectorAll('.dashboard-container > [id]');
    
    // Create a mapping of section IDs to their new positions
    const newOrder = {};
    sectionElements.forEach((element, index) => {
        const sectionId = element.id;
        if (sectionId) {
            newOrder[sectionId] = index + 1;
        }
    });
    
    // Update the configuration with new order
    config.layout.forEach(section => {
        if (newOrder[section.id] !== undefined) {
            section.order = newOrder[section.id];
        }
    });
    
    // Save the updated configuration
    saveDashboardConfig(config);
    showAlert('تم حفظ ترتيب العناصر بنجاح', 'success');
}

// Toggle dashboard edit mode
function toggleDashboardEditMode() {
    const dashboardContainer = document.querySelector('.dashboard-container');
    if (!dashboardContainer) return;
    
    const isEditMode = dashboardContainer.classList.toggle('edit-mode');
    
    // Add or remove drag handles to sections
    const sections = dashboardContainer.querySelectorAll('[id]');
    sections.forEach(section => {
        if (isEditMode) {
            // Add drag handle if it doesn't exist
            if (!section.querySelector('.section-drag-handle')) {
                const handle = document.createElement('div');
                handle.className = 'section-drag-handle';
                handle.innerHTML = '<i class="fas fa-grip-vertical"></i>';
                section.prepend(handle);
            }
        } else {
            // Remove drag handles
            const handle = section.querySelector('.section-drag-handle');
            if (handle) handle.remove();
        }
    });
    
    // Initialize or destroy Sortable based on edit mode
    if (isEditMode) {
        initializeDashboardDragDrop();
        showAlert('يمكنك الآن سحب وإفلات عناصر لوحة التحكم لإعادة ترتيبها', 'info');
    } else {
        // Save the current order before exiting edit mode
        updateLiveSectionOrder();
    }
    
    // Update edit mode button text
    const editModeBtn = document.getElementById('dashboard-edit-mode-btn');
    if (editModeBtn) {
        editModeBtn.innerHTML = isEditMode ? 
            '<i class="fas fa-save me-2"></i>حفظ الترتيب' : 
            '<i class="fas fa-grip-horizontal me-2"></i>تغيير ترتيب العناصر';
    }
}

// Create edit mode button for dashboard
function createDashboardEditModeButton() {
    // Check if button already exists
    if (document.getElementById('dashboard-edit-mode-btn')) return;
    
    let dashboardControls = document.querySelector('.dashboard-controls');
    if (!dashboardControls) {
        // Create dashboard controls container if it doesn't exist
        const container = document.createElement('div');
        container.className = 'dashboard-controls mb-3 d-flex justify-content-end';
        
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.prepend(container);
        }
        
        // Get the newly created dashboard controls
        dashboardControls = document.querySelector('.dashboard-controls');
    }
    
    // Create edit mode button
    const editModeBtn = document.createElement('button');
    editModeBtn.className = 'btn btn-sm btn-outline-primary ms-2';
    editModeBtn.id = 'dashboard-edit-mode-btn';
    editModeBtn.innerHTML = '<i class="fas fa-grip-horizontal me-2"></i>تغيير ترتيب العناصر';
    editModeBtn.addEventListener('click', toggleDashboardEditMode);
    
    if (dashboardControls) {
        dashboardControls.appendChild(editModeBtn);
    }
}

// Add CSS styles for drag and drop functionality
function addDragDropStyles() {
    // Check if styles already exist
    if (document.getElementById('drag-drop-styles')) return;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'drag-drop-styles';
    styleElement.textContent = `
        .dashboard-container.edit-mode > div {
            position: relative;
            border: 2px dashed #ccc;
            padding: 10px;
            margin-bottom: 15px;
            transition: all 0.3s ease;
        }
        
        .dashboard-container.edit-mode > div:hover {
            border-color: var(--primary-color);
        }
        
        .section-drag-handle {
            position: absolute;
            top: 10px;
            right: 10px;
            cursor: grab;
            background: rgba(0,0,0,0.05);
            padding: 5px 10px;
            border-radius: 4px;
            z-index: 10;
        }
        
        .section-drag-handle:hover {
            background: rgba(0,0,0,0.1);
        }
        
        .sortable-ghost {
            opacity: 0.4;
        }
        
        .sortable-chosen {
            background-color: rgba(13, 110, 253, 0.05);
        }
        
        body.dark-mode .dashboard-container.edit-mode > div {
            border-color: #444;
        }
        
        body.dark-mode .dashboard-container.edit-mode > div:hover {
            border-color: var(--dark-primary);
        }
        
        body.dark-mode .section-drag-handle {
            background: rgba(255,255,255,0.1);
        }
        
        body.dark-mode .section-drag-handle:hover {
            background: rgba(255,255,255,0.15);
        }
    `;
    
    document.head.appendChild(styleElement);
}

// Initialize dashboard drag and drop functionality
function initializeDashboardDragDropFeature() {
    // Add required styles
    addDragDropStyles();
    
    // Create edit mode button when dashboard is loaded
    document.addEventListener('dashboardLoaded', function() {
        createDashboardEditModeButton();
    });
    
    // Initialize drag and drop in customization modal when it's opened
    document.addEventListener('dashboardCustomizationModalOpened', function() {
        initializeDashboardDragDrop();
    });
}

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeDashboardDragDropFeature);