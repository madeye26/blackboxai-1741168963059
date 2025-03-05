// Theme Color Selector Functionality

// Available theme colors
const themeColors = {
    blue: {
        primary: '#3a8eff',
        hover: '#2a7de9',
        focus: 'rgba(58, 142, 255, 0.5)'
    },
    green: {
        primary: '#4caf50',
        hover: '#3d8b40',
        focus: 'rgba(76, 175, 80, 0.5)'
    },
    purple: {
        primary: '#9c27b0',
        hover: '#7b1fa2',
        focus: 'rgba(156, 39, 176, 0.5)'
    },
    orange: {
        primary: '#ff9800',
        hover: '#f57c00',
        focus: 'rgba(255, 152, 0, 0.5)'
    },
    teal: {
        primary: '#009688',
        hover: '#00796b',
        focus: 'rgba(0, 150, 136, 0.5)'
    }
};

// Function to create the theme color selector
function createThemeColorSelector() {
    // Check if the selector already exists
    if (document.querySelector('.theme-color-selector')) {
        return;
    }
    
    // Create the theme color selector in the navbar
    const navbar = document.querySelector('.navbar .navbar-nav');
    if (navbar) {
        // Create dropdown container
        const colorSelectorContainer = document.createElement('div');
        colorSelectorContainer.className = 'nav-item dropdown me-3';
        
        // Create dropdown toggle button
        const dropdownToggle = document.createElement('button');
        dropdownToggle.className = 'btn btn-sm btn-outline-primary dropdown-toggle';
        dropdownToggle.type = 'button';
        dropdownToggle.id = 'colorDropdown';
        dropdownToggle.setAttribute('data-bs-toggle', 'dropdown');
        dropdownToggle.setAttribute('aria-expanded', 'false');
        dropdownToggle.innerHTML = '<i class="fas fa-palette me-1"></i>تخصيص الألوان';
        
        // Create dropdown menu
        const dropdownMenu = document.createElement('ul');
        dropdownMenu.className = 'dropdown-menu color-dropdown';
        dropdownMenu.setAttribute('aria-labelledby', 'colorDropdown');
        
        // Add color options to dropdown
        Object.keys(themeColors).forEach(color => {
            const colorOption = document.createElement('li');
            const colorLink = document.createElement('a');
            colorLink.className = 'dropdown-item d-flex align-items-center';
            colorLink.href = '#';
            colorLink.setAttribute('data-color', color);
            
            // Create color preview
            const colorPreview = document.createElement('span');
            colorPreview.className = 'color-preview me-2';
            colorPreview.style.backgroundColor = themeColors[color].primary;
            
            // Add color name
            const colorName = document.createElement('span');
            colorName.textContent = getColorNameInArabic(color);
            
            // Assemble the dropdown item
            colorLink.appendChild(colorPreview);
            colorLink.appendChild(colorName);
            colorOption.appendChild(colorLink);
            dropdownMenu.appendChild(colorOption);
            
            // Add click event
            colorLink.addEventListener('click', (e) => {
                e.preventDefault();
                applyThemeColor(color);
            });
        });
        
        // Assemble the dropdown
        colorSelectorContainer.appendChild(dropdownToggle);
        colorSelectorContainer.appendChild(dropdownMenu);
        
        // Add to navbar before the export dropdown
        const exportDropdown = navbar.querySelector('.dropdown');
        if (exportDropdown) {
            navbar.insertBefore(colorSelectorContainer, exportDropdown);
        } else {
            navbar.appendChild(colorSelectorContainer);
        }
    } else {
        // Fallback to floating button if navbar not found
        const themeColorSelector = document.createElement('div');
        themeColorSelector.className = 'theme-color-selector';
        themeColorSelector.setAttribute('title', 'تخصيص الألوان');
        themeColorSelector.innerHTML = '<i class="fas fa-palette"></i>';
        
        // Create the color options container
        const colorOptions = document.createElement('div');
        colorOptions.className = 'theme-color-options';
        
        // Add color options
        Object.keys(themeColors).forEach(color => {
            const colorOption = document.createElement('div');
            colorOption.className = `color-option ${color}`;
            colorOption.setAttribute('data-color', color);
            colorOption.setAttribute('title', getColorNameInArabic(color));
            colorOption.addEventListener('click', () => applyThemeColor(color));
            colorOptions.appendChild(colorOption);
        });
        
        // Toggle color options visibility
        themeColorSelector.addEventListener('click', () => {
            colorOptions.classList.toggle('show');
        });
        
        // Close color options when clicking outside
        document.addEventListener('click', (event) => {
            if (!themeColorSelector.contains(event.target) && !colorOptions.contains(event.target)) {
                colorOptions.classList.remove('show');
            }
        });
        
        // Append elements to the body
        document.body.appendChild(themeColorSelector);
        document.body.appendChild(colorOptions);
    }
}

// Helper function to get color names in Arabic
function getColorNameInArabic(color) {
    const colorNames = {
        blue: 'أزرق',
        green: 'أخضر',
        purple: 'بنفسجي',
        orange: 'برتقالي',
        teal: 'أزرق مخضر'
    };
    
    return colorNames[color] || color;
}

// Function to apply the selected theme color
function applyThemeColor(color) {
    // Get the selected color theme
    const selectedTheme = themeColors[color];
    if (!selectedTheme) return;
    
    // Remove existing theme classes
    document.body.classList.remove('theme-blue', 'theme-green', 'theme-purple', 'theme-orange', 'theme-teal');
    
    // Add the new theme class
    document.body.classList.add(`theme-${color}`);
    
    // Update CSS variables for both light and dark mode
    document.documentElement.style.setProperty('--primary-color', selectedTheme.primary);
    document.documentElement.style.setProperty('--dark-primary', selectedTheme.primary);
    
    // Save the selected theme to localStorage
    localStorage.setItem('themeColor', color);
}

// Function to initialize the theme color
function initializeThemeColor() {
    // Create the theme color selector
    createThemeColorSelector();
    
    // Check for saved theme color preference
    const savedThemeColor = localStorage.getItem('themeColor');
    
    // Apply saved theme color or default to blue
    if (savedThemeColor && themeColors[savedThemeColor]) {
        applyThemeColor(savedThemeColor);
    }
}

// Initialize theme color when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeThemeColor);