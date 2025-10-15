// Configuration constants
const CONFIG = {
    hearts: {
        count: 8,
        minSize: 20,
        maxSize: 50,
        minDuration: 3,
        maxDuration: 5,
        maxDelay: 3
    },
    toast: {
        duration: 4000,
        animationDuration: 300
    }
};

// State management
const state = {
    selectedRating: 0
};

// Utility functions
const utils = {
    random: (min, max) => min + Math.random() * (max - min),
    
    createElement: (tag, className, innerHTML = '') => {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (innerHTML) element.innerHTML = innerHTML;
        return element;
    },
    
    safeQuerySelector: (selector, context = document) => {
        const element = context.querySelector(selector);
        if (!element) {
            console.warn(`Element not found: ${selector}`);
        }
        return element;
    },
    
    safeQuerySelectorAll: (selector, context = document) => {
        return context.querySelectorAll(selector);
    }
};

// Floating hearts functionality
const floatingHearts = {
    heartSVG: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
    </svg>`,
    
    create() {
        const container = utils.safeQuerySelector('#floating-hearts');
        if (!container) return;
        
        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();
        
        for (let i = 0; i < CONFIG.hearts.count; i++) {
            const heart = this.createHeart();
            fragment.appendChild(heart);
        }
        
        container.appendChild(fragment);
    },
    
    createHeart() {
        const heart = utils.createElement('div', 'floating-heart', this.heartSVG);
        
        // Randomize position and animation
        Object.assign(heart.style, {
            left: `${utils.random(0, 100)}%`,
            top: `${utils.random(0, 100)}%`,
            width: `${utils.random(CONFIG.hearts.minSize, CONFIG.hearts.maxSize)}px`,
            height: `${utils.random(CONFIG.hearts.minSize, CONFIG.hearts.maxSize)}px`,
            animationDelay: `${utils.random(0, CONFIG.hearts.maxDelay)}s`,
            animationDuration: `${utils.random(CONFIG.hearts.minDuration, CONFIG.hearts.maxDuration)}s`
        });
        
        return heart;
    }
};

// Heart rating functionality
const heartRating = {
    buttons: null,
    container: null,
    hiddenInput: null,
    
    init() {
        this.buttons = utils.safeQuerySelectorAll('.heart-btn');
        this.container = utils.safeQuerySelector('#heart-rating');
        this.hiddenInput = utils.safeQuerySelector('#rating');
        
        if (!this.buttons.length || !this.container) {
            console.error('Heart rating elements not found');
            return;
        }
        
        this.attachEvents();
    },
    
    attachEvents() {
        // Click events for rating selection
        this.buttons.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const rating = parseInt(btn.getAttribute('data-rating'));
                this.selectRating(rating);
            });
            
            // Hover preview
            btn.addEventListener('mouseenter', () => {
                const rating = parseInt(btn.getAttribute('data-rating'));
                this.updateDisplay(rating);
            });
        });
        
        // Reset to selected rating on mouse leave
        if (this.container) {
            this.container.addEventListener('mouseleave', () => {
                this.updateDisplay(state.selectedRating);
            });
        }
    },
    
    selectRating(rating) {
        state.selectedRating = rating;
        if (this.hiddenInput) {
            this.hiddenInput.value = rating;
        }
        this.updateDisplay(rating);
    },
    
    updateDisplay(rating) {
        this.buttons.forEach((btn, index) => {
            if (index < rating) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    },
    
    reset() {
        state.selectedRating = 0;
        this.updateDisplay(0);
        if (this.hiddenInput) {
            this.hiddenInput.value = '';
        }
    }
};

// Toast notification functionality
const toast = {
    container: null,
    
    init() {
        this.container = utils.safeQuerySelector('#toast-container');
    },
    
    show(title, description, type = 'success') {
        if (!this.container) {
            console.warn('Toast container not found');
            return;
        }
        
        const toastEl = this.create(title, description, type);
        this.container.appendChild(toastEl);
        
        // Auto-remove toast
        setTimeout(() => {
            this.remove(toastEl);
        }, CONFIG.toast.duration);
    },
    
    create(title, description, type) {
        const toastEl = utils.createElement('div', `toast ${type}`);
        
        toastEl.innerHTML = `
            <div class="toast-title">${this.escapeHtml(title)}</div>
            <div class="toast-description">${this.escapeHtml(description)}</div>
        `;
        
        return toastEl;
    },
    
    remove(toastEl) {
        toastEl.style.animation = 'slideInRight 0.3s ease-out reverse';
        
        setTimeout(() => {
            if (toastEl.parentNode) {
                toastEl.parentNode.removeChild(toastEl);
            }
        }, CONFIG.toast.animationDuration);
    },
    
    // Basic XSS protection
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Form handling
const feedbackForm = {
    form: null,
    fields: {},
    
    init() {
        this.form = utils.safeQuerySelector('#feedback-form');
        if (!this.form) {
            console.error('Feedback form not found');
            return;
        }
        
        this.cacheFields();
        this.attachEvents();
    },
    
    cacheFields() {
        this.fields = {
            name: utils.safeQuerySelector('#name'),
            email: utils.safeQuerySelector('#email'),
            rating: utils.safeQuerySelector('#rating'),
            message: utils.safeQuerySelector('#message')
        };
    },
    
    attachEvents() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    },
    
    handleSubmit() {
        const formData = this.getFormData();
        
        if (!this.validate(formData)) {
            toast.show(
                'Please fill in all fields',
                "We'd love to hear your complete feedback!",
                'error'
            );
            return;
        }
        
        this.submit(formData);
    },
    
    getFormData() {
        return {
            name: this.fields.name?.value.trim() || '',
            email: this.fields.email?.value.trim() || '',
            rating: this.fields.rating?.value || '',
            message: this.fields.message?.value.trim() || ''
        };
    },
    
    validate(data) {
        // Check all required fields
        if (!data.name || !data.email || !data.rating || !data.message) {
            return false;
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            toast.show(
                'Invalid email',
                'Please enter a valid email address',
                'error'
            );
            return false;
        }
        
        return true;
    },
    
    submit(data) {
        // Show success message
        toast.show(
            'Thank you for your feedback!',
            'Your love and thoughts mean the world to us ❤️',
            'success'
        );
        
        // Log form data (replace with actual submission logic)
        console.log('Form submitted:', data);
        
        // Reset form
        this.reset();
    },
    
    reset() {
        this.form.reset();
        heartRating.reset();
    }
};

// Initialize everything when DOM is ready
function init() {
    floatingHearts.create();
    heartRating.init();
    toast.init();
    feedbackForm.init();
}

// Start the application
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}