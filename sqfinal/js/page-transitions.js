// Page Transitions Handler

// Function to handle page transitions
function handlePageTransition(fromElement, toElement) {
    // If elements don't exist, return
    if (!fromElement || !toElement) return;
    
    // Add transition classes
    fromElement.classList.add('page-transition', 'page-exit');
    toElement.classList.add('page-transition', 'page-enter');
    
    // Force reflow to ensure transitions work
    void toElement.offsetWidth;
    
    // Start transitions
    requestAnimationFrame(() => {
        fromElement.classList.add('page-exit-active');
        toElement.classList.add('page-enter-active');
        
        // Show the new element
        toElement.style.display = 'block';
        
        // Wait for transition to complete
        setTimeout(() => {
            // Hide the old element
            fromElement.style.display = 'none';
            
            // Clean up classes
            fromElement.classList.remove('page-transition', 'page-exit', 'page-exit-active');
            toElement.classList.remove('page-transition', 'page-enter', 'page-enter-active');
        }, 300); // Match this with the CSS transition duration
    });
}

// Function to enhance tab navigation with transitions
function enhanceTabNavigation() {
    const tabLinks = document.querySelectorAll('.list-group-item');
    const mainContent = document.getElementById('main-content');
    
    // Current active content element
    let currentContent = null;
    
    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all tabs
            tabLinks.forEach(tab => tab.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Get the tab ID
            const tabId = this.id;
            
            // Store the current content before it's replaced
            if (mainContent.firstElementChild) {
                currentContent = mainContent.firstElementChild.cloneNode(true);
            }
            
            // Load the new content (this should be handled by your existing navigation logic)
            // We're just enhancing it with transitions
            if (typeof handleNavigation === 'function') {
                // If your app already has a navigation handler, call it
                handleNavigation(tabId);
            }
            
            // Apply transition if we have both old and new content
            if (currentContent && mainContent.firstElementChild && 
                currentContent !== mainContent.firstElementChild) {
                handlePageTransition(currentContent, mainContent.firstElementChild);
            }
        });
    });
}

// Function to add loading animations
function showLoadingSpinner(container) {
    // Create spinner element
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    spinner.id = 'loading-spinner';
    
    // Create container for spinner with centered positioning
    const spinnerContainer = document.createElement('div');
    spinnerContainer.className = 'text-center py-5';
    spinnerContainer.appendChild(spinner);
    
    // Add to container
    container.innerHTML = '';
    container.appendChild(spinnerContainer);
}

// Function to remove loading spinner
function hideLoadingSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.parentElement.remove();
    }
}

// Function to add fade-in effect to elements
function addFadeInEffect(elements) {
    if (!elements) return;
    
    // If elements is a single element, convert to array
    const elementsArray = elements instanceof Element ? [elements] : elements;
    
    // Add fade-in class with staggered delay
    elementsArray.forEach((element, index) => {
        setTimeout(() => {
            element.classList.add('fade-in');
        }, index * 100); // Stagger by 100ms
    });
}

// Initialize page transitions when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    enhanceTabNavigation();
    
    // Add fade-in effect to initial page elements
    const initialElements = document.querySelectorAll('.stats-card, .quick-actions-card, .recent-activities-card');
    addFadeInEffect(initialElements);
});