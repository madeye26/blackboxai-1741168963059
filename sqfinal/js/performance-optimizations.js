/**
 * Performance Optimizations for Payroll System
 * This file contains functions to improve application performance
 */

// Cache management for frequently accessed data
const dataCache = {
    employees: new Map(),
    salaryReports: new Map(),
    advances: new Map(),
    lastClearTime: Date.now()
};

// Cache configuration
const cacheConfig = {
    maxAge: 1000 * 60 * 30, // 30 minutes cache lifetime
    enabled: true
};

/**
 * Initialize performance optimizations
 */
function initPerformanceOptimizations() {
    // Register service worker for caching static assets
    registerServiceWorker();
    
    // Set up periodic cache cleanup
    setInterval(cleanupCache, cacheConfig.maxAge);
    
    // Implement lazy loading for heavy components
    setupLazyLoading();
    
    // Optimize event handlers
    optimizeEventHandlers();
    
    console.log('Performance optimizations initialized');
}

/**
 * Register service worker for caching static assets
 */
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('ServiceWorker registered with scope:', registration.scope);
                })
                .catch(error => {
                    console.error('ServiceWorker registration failed:', error);
                });
        });
    }
}

/**
 * Get data from cache or fetch it if not available
 * @param {string} type - Type of data (employees, salaryReports, advances)
 * @param {string} id - Identifier for the specific item
 * @param {Function} fetchFunction - Function to call if data is not in cache
 * @returns {Object} The requested data
 */
function getCachedData(type, id, fetchFunction) {
    if (!cacheConfig.enabled) {
        return fetchFunction();
    }
    
    const cache = dataCache[type];
    if (!cache) return fetchFunction();
    
    const cacheKey = id || 'all';
    
    if (cache.has(cacheKey)) {
        const cachedItem = cache.get(cacheKey);
        if (Date.now() - cachedItem.timestamp < cacheConfig.maxAge) {
            return cachedItem.data;
        }
    }
    
    // Cache miss or expired, fetch fresh data
    const data = fetchFunction();
    cache.set(cacheKey, {
        data: data,
        timestamp: Date.now()
    });
    
    return data;
}

/**
 * Store data in cache
 * @param {string} type - Type of data (employees, salaryReports, advances)
 * @param {string} id - Identifier for the specific item
 * @param {Object} data - Data to cache
 */
function setCachedData(type, id, data) {
    if (!cacheConfig.enabled) return;
    
    const cache = dataCache[type];
    if (!cache) return;
    
    const cacheKey = id || 'all';
    
    cache.set(cacheKey, {
        data: data,
        timestamp: Date.now()
    });
}

/**
 * Clear specific cache or all caches
 * @param {string} type - Type of cache to clear (optional)
 */
function clearCache(type) {
    if (type && dataCache[type]) {
        dataCache[type].clear();
    } else {
        Object.keys(dataCache).forEach(key => {
            if (key !== 'lastClearTime') {
                dataCache[key].clear();
            }
        });
    }
    dataCache.lastClearTime = Date.now();
}

/**
 * Periodic cache cleanup to prevent memory leaks
 */
function cleanupCache() {
    const now = Date.now();
    
    Object.keys(dataCache).forEach(type => {
        if (type !== 'lastClearTime') {
            const cache = dataCache[type];
            
            cache.forEach((value, key) => {
                if (now - value.timestamp > cacheConfig.maxAge) {
                    cache.delete(key);
                }
            });
        }
    });
}

/**
 * Set up lazy loading for heavy components
 */
function setupLazyLoading() {
    // Lazy load charts when they become visible
    if ('IntersectionObserver' in window) {
        const chartObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const chartElement = entry.target;
                    const chartId = chartElement.id;
                    
                    // Load and initialize chart
                    if (typeof initializeChart === 'function') {
                        initializeChart(chartId);
                    }
                    
                    // Unobserve after loading
                    observer.unobserve(chartElement);
                }
            });
        });
        
        // Observe all chart containers
        document.querySelectorAll('.chart-container').forEach(chart => {
            chartObserver.observe(chart);
        });
    }
}

/**
 * Optimize event handlers to reduce DOM operations
 */
function optimizeEventHandlers() {
    // Use event delegation where possible
    document.addEventListener('click', handleDelegatedClicks);
    
    // Debounce input events
    setupDebouncedInputs();
}

/**
 * Handle delegated click events
 * @param {Event} event - The click event
 */
function handleDelegatedClicks(event) {
    // Handle print buttons
    if (event.target.matches('.print-button, .print-button *')) {
        event.preventDefault();
        const buttonElement = event.target.closest('.print-button');
        const employeeCode = buttonElement.dataset.employeeCode;
        const month = buttonElement.dataset.month;
        
        if (employeeCode && month) {
            printSalarySlip(employeeCode, month);
        }
    }
    
    // Add more delegated handlers as needed
}

/**
 * Set up debounced input handlers
 */
function setupDebouncedInputs() {
    const inputElements = document.querySelectorAll('input[type="text"], input[type="number"], textarea');
    
    inputElements.forEach(input => {
        input.addEventListener('input', debounce(function(e) {
            // Handle the input event after debounce
            const inputHandler = input.dataset.handler;
            if (inputHandler && window[inputHandler]) {
                window[inputHandler](e);
            }
        }, 300));
    });
}

/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

/**
 * Create a Web Worker for heavy calculations
 * @param {Function} workerFunction - Function to run in worker
 * @returns {Worker} The created worker
 */
function createCalculationWorker(workerFunction) {
    // Convert function to string and create a blob URL
    const workerCode = `
        ${workerFunction.toString()};
        self.onmessage = function(e) {
            const result = (${workerFunction.name})(e.data);
            self.postMessage(result);
        }
    `;
    
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    
    return new Worker(workerUrl);
}

/**
 * Optimize images by lazy loading and using appropriate formats
 */
function optimizeImages() {
    // Use native lazy loading where supported
    document.querySelectorAll('img').forEach(img => {
        if ('loading' in HTMLImageElement.prototype) {
            img.loading = 'lazy';
        }
    });
}

// Export functions for use in other modules
window.performanceUtils = {
    initPerformanceOptimizations,
    getCachedData,
    setCachedData,
    clearCache,
    createCalculationWorker,
    debounce
};