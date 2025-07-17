// Form Page JavaScript
let currentStep = 1;
let formData = {};

document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    setupEventListeners();
});

function initializeForm() {
    console.log('Ghana Budget Planner Form Loaded');
    showStep(1);
    updateProgress();
}

function setupEventListeners() {
    // Form submission
    const budgetForm = document.getElementById('budgetForm');
    if (budgetForm) {
        budgetForm.addEventListener('submit', handleFormSubmission);
    }

    // Input validation on blur
    setupInputValidation();
    
    // Step navigation
    setupStepNavigation();
}

function setupInputValidation() {
    const inputs = document.querySelectorAll('input[required], select[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

function setupStepNavigation() {
    // Update progress when step changes
    document.addEventListener('stepChanged', updateProgress);
}

function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < 3) {
            hideCurrentStep();
            currentStep++;
            showCurrentStep();
            updateStepIndicator();
            updateProgress();
        }
    }
}

function prevStep() {
    if (currentStep > 1) {
        hideCurrentStep();
        currentStep--;
        showCurrentStep();
        updateStepIndicator();
        updateProgress();
    }
}

function showStep(stepNumber) {
    currentStep = stepNumber;
    showCurrentStep();
    updateStepIndicator();
    updateProgress();
}

function validateCurrentStep() {
    const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    const requiredFields = currentStepElement.querySelectorAll('[required]');
    let isValid = true;
    
    for (let field of requiredFields) {
        if (!validateField({ target: field })) {
            isValid = false;
        }
    }
    
    // Step-specific validations
    if (currentStep === 1 && isValid) {
        isValid = validateStep1();
    } else if (currentStep === 2 && isValid) {
        isValid = validateStep2();
    }
    
    return isValid;
}

function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    
    // Clear previous errors
    clearFieldError({ target: field });
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    // Type-specific validation
    if (field.type === 'number' && value) {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < 0) {
            showFieldError(field, 'Please enter a valid positive number');
            return false;
        }
    }
    
    // Email validation if applicable
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Please enter a valid email address');
            return false;
        }
    }
    
    return true;
}

function validateStep1() {
    const income = parseFloat(document.getElementById('income').value);
    if (income <= 0) {
        showFieldError(document.getElementById('income'), 'Income must be greater than 0');
        return false;
    }
    
    if (income < 100) {
        showFieldError(document.getElementById('income'), 'Please enter a realistic income amount');
        return false;
    }
    
    return true;
}

function validateStep2() {
    const income = parseFloat(document.getElementById('income').value || 0);
    const rent = parseFloat(document.getElementById('rent').value || 0);
    const transport = parseFloat(document.getElementById('transport').value || 0);
    const food = parseFloat(document.getElementById('food').value || 0);
    
    const totalExpenses = rent + transport + food;
    
    if (totalExpenses > income * 0.9) {
        alert('Your total expenses seem very high compared to your income. Please review your values or consider if some expenses can be reduced.');
        return false;
    }
    
    // Rent should not exceed 50% of income typically
    if (rent > income * 0.5) {
        const confirmed = confirm('Your rent is more than 50% of your income, which is quite high. Do you want to continue?');
        if (!confirmed) {
            return false;
        }
    }
    
    return true;
}

function showFieldError(field, message) {
    // Remove existing error
    clearFieldError({ target: field });
    
    // Add new error
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = 'var(--error-color)';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '0.25rem';
    errorDiv.style.display = 'flex';
    errorDiv.style.alignItems = 'center';
    errorDiv.style.gap = '0.25rem';
    
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i>${message}`;
    
    // Insert after the input group or field
    const inputGroup = field.closest('.input-group') || field;
    inputGroup.parentNode.appendChild(errorDiv);
    
    // Highlight the field
    field.style.borderColor = 'var(--error-color)';
    field.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
    
    // Focus the field
    field.focus();
}

function clearFieldError(event) {
    const field = event.target;
    
    // Remove error message
    const errorMessage = field.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
    
    // Reset field styling
    field.style.borderColor = '';
    field.style.boxShadow = '';
}

function hideCurrentStep() {
    const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    if (currentStepElement) {
        currentStepElement.classList.remove('active');
    }
}

function showCurrentStep() {
    const newStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    if (newStepElement) {
        newStepElement.classList.add('active');
        
        // Focus first input in the step
        const firstInput = newStepElement.querySelector('input, select');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

function updateStepIndicator() {
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        if (index + 1 <= currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

function updateProgress() {
    const progressFill = document.getElementById('formProgress');
    const currentStepSpan = document.getElementById('currentStep');
    
    if (progressFill) {
        const percentage = (currentStep / 3) * 100;
        progressFill.style.width = percentage + '%';
    }
    
    if (currentStepSpan) {
        currentStepSpan.textContent = currentStep;
    }
}

async function handleFormSubmission(e) {
    e.preventDefault();
    
    if (!validateCurrentStep()) {
        return;
    }
    
    // Show loading state
    const submitButton = document.querySelector('.submit-button');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    submitButton.disabled = true;
    
    try {
        // Collect form data
        collectFormData();
        
        // Store data for results page
        localStorage.setItem('budgetFormData', JSON.stringify(formData));
        
        // Submit to Formspree (in background)
        const formDataObj = new FormData(e.target);
        fetch(e.target.action, {
            method: 'POST',
            body: formDataObj,
            headers: {
                'Accept': 'application/json'
            }
        }).catch(error => {
            console.log('Form submission error (non-blocking):', error);
        });
        
        // Small delay for UX
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Redirect to results page
        window.location.href = 'results.html';
        
    } catch (error) {
        console.error('Error:', error);
        alert('There was an error generating your budget plan. Please try again.');
    } finally {
        // Reset button
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
}

function collectFormData() {
    const form = document.getElementById('budgetForm');
    const formDataObj = new FormData(form);
    
    formData = {
        income: parseFloat(formDataObj.get('income')),
        occupation: formDataObj.get('occupation'),
        education: formDataObj.get('education'),
        duration: formDataObj.get('duration'),
        rent: parseFloat(formDataObj.get('rent') || 0),
        transport: parseFloat(formDataObj.get('transport') || 0),
        food: parseFloat(formDataObj.get('food') || 0),
        lifestyle: formDataObj.get('lifestyle'),
        goals: formDataObj.getAll('goals'),
        savingsTarget: parseFloat(formDataObj.get('savings_target') || 0),
        priority: formDataObj.get('priority'),
        timestamp: new Date().toISOString()
    };
    
    console.log('Form data collected:', formData);
}

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        const activeElement = document.activeElement;
        
        // If in a text input, move to next step
        if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'SELECT') {
            e.preventDefault();
            
            if (currentStep < 3) {
                nextStep();
            } else {
                // Submit form on last step
                const submitButton = document.querySelector('.submit-button');
                if (submitButton) {
                    submitButton.click();
                }
            }
        }
    }
});

// Auto-save form data to localStorage
function autoSaveFormData() {
    const form = document.getElementById('budgetForm');
    const formDataObj = new FormData(form);
    const data = {};
    
    for (let [key, value] of formDataObj.entries()) {
        data[key] = value;
    }
    
    localStorage.setItem('budgetFormDraft', JSON.stringify(data));
}

// Load saved form data
function loadSavedFormData() {
    const savedData = localStorage.getItem('budgetFormDraft');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            Object.keys(data).forEach(key => {
                const field = document.querySelector(`[name="${key}"]`);
                if (field) {
                    field.value = data[key];
                }
            });
        } catch (error) {
            console.log('Error loading saved form data:', error);
        }
    }
}

// Auto-save on input change
document.addEventListener('change', autoSaveFormData);
document.addEventListener('input', autoSaveFormData);

// Load saved data on page load
document.addEventListener('DOMContentLoaded', loadSavedFormData);

// Clear draft when form is submitted successfully
window.addEventListener('beforeunload', function() {
    // Only clear if we're navigating to results
    if (window.location.href.includes('results.html')) {
        localStorage.removeItem('budgetFormDraft');
    }
});

// Add smooth transitions between steps
function addStepTransitions() {
    const steps = document.querySelectorAll('.form-step');
    steps.forEach(step => {
        step.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    });
}

document.addEventListener('DOMContentLoaded', addStepTransitions);