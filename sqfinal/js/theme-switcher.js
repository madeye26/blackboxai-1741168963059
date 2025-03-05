// Theme Switcher Functionality

// Function to toggle between light and dark mode with transition
function toggleDarkMode() {
    // Add transition class for smooth theme change
    document.body.classList.add('theme-transition');
    
    // Toggle dark mode class
    document.body.classList.toggle('dark-mode');
    
    // Save user preference to localStorage
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    
    // Update toggle icon
    updateThemeToggleIcon(isDarkMode);
    
    // Remove transition class after transition completes
    setTimeout(() => {
        document.body.classList.remove('theme-transition');
    }, 500);
}

// Function to update the theme toggle icon
function updateThemeToggleIcon(isDarkMode) {
    const themeToggleIcon = document.querySelector('.theme-toggle i');
    if (themeToggleIcon) {
        if (isDarkMode) {
            themeToggleIcon.classList.remove('fa-moon');
            themeToggleIcon.classList.add('fa-sun');
        } else {
            themeToggleIcon.classList.remove('fa-sun');
            themeToggleIcon.classList.add('fa-moon');
        }
    }
}

// Function to create the theme toggle button
function createThemeToggle() {
    // Check if the toggle already exists
    if (document.querySelector('.theme-toggle')) {
        // If it exists, just add the event listener
        document.querySelector('.theme-toggle').addEventListener('click', toggleDarkMode);
        return;
    }
    
    // Create a toggle button in the navbar instead of floating button
    const navbar = document.querySelector('.navbar .navbar-nav');
    if (navbar) {
        const themeToggle = document.createElement('div');
        themeToggle.className = 'nav-item me-3';
        themeToggle.innerHTML = `
            <button class="theme-toggle btn btn-outline-primary btn-sm" title="تبديل المظهر">
                <i class="fas fa-moon"></i>
            </button>
        `;
        navbar.insertBefore(themeToggle, navbar.firstChild);
        themeToggle.querySelector('.theme-toggle').addEventListener('click', toggleDarkMode);
    } else {
        // Fallback to the floating button if navbar not found
        const themeToggle = document.createElement('div');
        themeToggle.className = 'theme-toggle';
        themeToggle.setAttribute('title', 'تبديل المظهر');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        themeToggle.addEventListener('click', toggleDarkMode);
        document.body.appendChild(themeToggle);
    }
}

// Function to initialize theme based on user preference
function initializeTheme() {
    // Create the theme toggle button
    createThemeToggle();
    
    // Check for saved theme preference or system preference
    const savedDarkMode = localStorage.getItem('darkMode');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Apply saved preference or default to light mode
    if (savedDarkMode === 'true') {
        document.body.classList.add('dark-mode');
        updateThemeToggleIcon(true);
    } else {
        updateThemeToggleIcon(false);
    }
    
    // Add smooth transition for theme changes
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
}

// Initialize theme when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeTheme);