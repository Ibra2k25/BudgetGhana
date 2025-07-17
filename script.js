// Global Variables
let currentStep = 1;
let budgetData = {};
let charts = {};

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    animateOnScroll();
});

// Initialize Application
function initializeApp() {
    showLanding();
    setupScrollAnimations();
    setupNumberCounters();
}

// Event Listeners Setup
function setupEventListeners() {
    // Form submission
    const budgetForm = document.getElementById('budgetForm');
    if (budgetForm) {
        budgetForm.addEventListener('submit', handleFormSubmission);
    }

    // Navigation events
    setupNavigation();
    
    // Window events
    window.addEventListener('scroll', animateOnScroll);
    window.addEventListener('resize', handleResize);
}

// Section Navigation
function showLanding() {
    hideAllSections();
    document.getElementById('landing').classList.add('active');
    triggerConfetti(false);
}

function showForm() {
    hideAllSections();
    document.getElementById('form').classList.add('active');
    resetForm();
}

function showResults() {
    hideAllSections();
    document.getElementById('results').classList.add('active');
    generateBudgetPlan();
    triggerConfetti(true);
}

function showTerms() {
    hideAllSections();
    document.getElementById('terms').classList.add('active');
}

function hideAllSections() {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
}

// Navigation Setup
function setupNavigation() {
    // Terms link
    const termsLink = document.querySelector('a[href="#terms"]');
    if (termsLink) {
        termsLink.addEventListener('click', (e) => {
            e.preventDefault();
            showTerms();
        });
    }
}

// Form Handling
function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < 3) {
            hideCurrentStep();
            currentStep++;
            showCurrentStep();
            updateStepIndicator();
        }
    }
}

function prevStep() {
    if (currentStep > 1) {
        hideCurrentStep();
        currentStep--;
        showCurrentStep();
        updateStepIndicator();
    }
}

function validateCurrentStep() {
    const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    const requiredFields = currentStepElement.querySelectorAll('[required]');
    
    for (let field of requiredFields) {
        if (!field.value.trim()) {
            field.focus();
            showValidationError(field, 'This field is required');
            return false;
        }
    }
    
    // Step-specific validations
    if (currentStep === 1) {
        return validateStep1();
    } else if (currentStep === 2) {
        return validateStep2();
    }
    
    return true;
}

function validateStep1() {
    const income = parseFloat(document.getElementById('income').value);
    if (income <= 0) {
        showValidationError(document.getElementById('income'), 'Income must be greater than 0');
        return false;
    }
    return true;
}

function validateStep2() {
    const income = parseFloat(document.getElementById('income').value);
    const rent = parseFloat(document.getElementById('rent').value || 0);
    const transport = parseFloat(document.getElementById('transport').value || 0);
    const food = parseFloat(document.getElementById('food').value || 0);
    
    const totalExpenses = rent + transport + food;
    if (totalExpenses > income) {
        alert('Your total expenses cannot exceed your income. Please adjust your values.');
        return false;
    }
    
    return true;
}

function showValidationError(field, message) {
    // Remove existing error
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = 'var(--ghana-red)';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '0.25rem';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
    
    // Remove error after 3 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 3000);
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

function resetForm() {
    currentStep = 1;
    document.getElementById('budgetForm').reset();
    hideAllSteps();
    showCurrentStep();
    updateStepIndicator();
}

function hideAllSteps() {
    const steps = document.querySelectorAll('.form-step');
    steps.forEach(step => step.classList.remove('active'));
}

// Form Submission
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
        
        // Submit to Formspree (in background)
        const formData = new FormData(e.target);
        fetch(e.target.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        }).catch(error => {
            console.log('Form submission error (non-blocking):', error);
        });
        
        // Small delay for UX
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Show results
        showResults();
        
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
    const formData = new FormData(form);
    
    budgetData = {
        income: parseFloat(formData.get('income')),
        occupation: formData.get('occupation'),
        education: formData.get('education'),
        duration: formData.get('duration'),
        rent: parseFloat(formData.get('rent') || 0),
        transport: parseFloat(formData.get('transport') || 0),
        food: parseFloat(formData.get('food') || 0),
        lifestyle: formData.get('lifestyle'),
        goals: formData.getAll('goals'),
        savingsTarget: parseFloat(formData.get('savings_target') || 0),
        priority: formData.get('priority')
    };
}

// Budget Calculation Engine
function generateBudgetPlan() {
    const calculations = calculateBudget(budgetData);
    displayBudgetResults(calculations);
    createCharts(calculations);
    generateRecommendations(calculations);
    animateCounters();
}

function calculateBudget(data) {
    const income = data.income;
    const lifestyle = data.lifestyle;
    const occupation = data.occupation;
    
    // Ghana-specific calculations based on local living standards
    const calculations = {
        income: income,
        afterTax: calculateAfterTax(income),
        needs: {},
        wants: {},
        savings: {},
        healthScore: 0
    };
    
    // After-tax calculation (Ghana tax rates)
    calculations.afterTax = calculateAfterTax(income);
    const disposableIncome = calculations.afterTax;
    
    // Calculate needs (50-60% of income)
    calculations.needs = calculateNeeds(disposableIncome, data, lifestyle);
    
    // Calculate wants (20-30% of income)
    calculations.wants = calculateWants(disposableIncome, data, lifestyle);
    
    // Calculate savings (20-30% of income)
    calculations.savings = calculateSavings(disposableIncome, data);
    
    // Calculate financial health score
    calculations.healthScore = calculateHealthScore(calculations);
    
    return calculations;
}

function calculateAfterTax(income) {
    // Simplified Ghana tax calculation
    if (income <= 365) return income; // Below taxable threshold
    
    let tax = 0;
    if (income > 365 && income <= 720) {
        tax = (income - 365) * 0.05; // 5%
    } else if (income > 720 && income <= 2160) {
        tax = 365 * 0.05 + (income - 720) * 0.10; // 10%
    } else if (income > 2160 && income <= 4320) {
        tax = 365 * 0.05 + 1440 * 0.10 + (income - 2160) * 0.175; // 17.5%
    } else {
        tax = 365 * 0.05 + 1440 * 0.10 + 2160 * 0.175 + (income - 4320) * 0.25; // 25%
    }
    
    return income - tax;
}

function calculateNeeds(disposableIncome, data, lifestyle) {
    const lifestyleMultipliers = {
        'minimalist': 0.45,
        'moderate': 0.50,
        'comfortable': 0.55,
        'luxury': 0.60
    };
    
    const needsPercentage = lifestyleMultipliers[lifestyle] || 0.50;
    const totalNeeds = disposableIncome * needsPercentage;
    
    // Use user-provided expenses or calculate defaults
    const rent = data.rent || (totalNeeds * 0.45); // 45% of needs
    const utilities = totalNeeds * 0.15; // 15% of needs
    const transport = data.transport || (totalNeeds * 0.20); // 20% of needs
    const food = data.food || (totalNeeds * 0.20); // 20% of needs
    
    return {
        total: totalNeeds,
        rent: Math.min(rent, totalNeeds * 0.50), // Cap at 50% of needs
        utilities: utilities,
        transport: Math.min(transport, totalNeeds * 0.25),
        food: Math.min(food, totalNeeds * 0.30),
        percentage: needsPercentage * 100
    };
}

function calculateWants(disposableIncome, data, lifestyle) {
    const lifestyleMultipliers = {
        'minimalist': 0.15,
        'moderate': 0.25,
        'comfortable': 0.30,
        'luxury': 0.35
    };
    
    const wantsPercentage = lifestyleMultipliers[lifestyle] || 0.25;
    const totalWants = disposableIncome * wantsPercentage;
    
    return {
        total: totalWants,
        entertainment: totalWants * 0.30,
        dining: totalWants * 0.25,
        shopping: totalWants * 0.20,
        hobbies: totalWants * 0.15,
        misc: totalWants * 0.10,
        percentage: wantsPercentage * 100
    };
}

function calculateSavings(disposableIncome, data) {
    const targetSavings = data.savingsTarget || (disposableIncome * 0.20);
    const maxPossibleSavings = disposableIncome * 0.40; // Max 40%
    const actualSavings = Math.min(targetSavings, maxPossibleSavings);
    
    return {
        total: actualSavings,
        emergency: actualSavings * 0.40, // 40% to emergency fund
        investment: actualSavings * 0.35, // 35% to investments
        goals: actualSavings * 0.25, // 25% to specific goals
        percentage: (actualSavings / disposableIncome) * 100
    };
}

function calculateHealthScore(calculations) {
    let score = 0;
    const income = calculations.afterTax;
    
    // Savings rate (30 points)
    const savingsRate = (calculations.savings.total / income) * 100;
    if (savingsRate >= 20) score += 30;
    else if (savingsRate >= 15) score += 25;
    else if (savingsRate >= 10) score += 20;
    else if (savingsRate >= 5) score += 15;
    else score += 10;
    
    // Needs vs Income ratio (25 points)
    const needsRatio = (calculations.needs.total / income) * 100;
    if (needsRatio <= 50) score += 25;
    else if (needsRatio <= 60) score += 20;
    else if (needsRatio <= 70) score += 15;
    else score += 10;
    
    // Housing cost ratio (20 points)
    const housingRatio = (calculations.needs.rent / income) * 100;
    if (housingRatio <= 25) score += 20;
    else if (housingRatio <= 30) score += 15;
    else if (housingRatio <= 35) score += 10;
    else score += 5;
    
    // Emergency fund potential (15 points)
    const emergencyFund = calculations.savings.emergency;
    const monthlyExpenses = calculations.needs.total + calculations.wants.total;
    const emergencyMonths = emergencyFund > 0 ? emergencyFund / monthlyExpenses : 0;
    
    if (emergencyMonths >= 6) score += 15;
    else if (emergencyMonths >= 3) score += 12;
    else if (emergencyMonths >= 1) score += 8;
    else score += 5;
    
    // Balance factor (10 points)
    const totalAllocated = calculations.needs.total + calculations.wants.total + calculations.savings.total;
    if (totalAllocated <= income) score += 10;
    else score += 5;
    
    return Math.min(score, 100);
}

// Display Results
function displayBudgetResults(calculations) {
    // Update income display
    updateElement('totalIncome', formatCurrency(calculations.income));
    updateElement('afterTax', formatCurrency(calculations.afterTax));
    
    // Update needs section
    displayNeedsSection(calculations.needs);
    updateElement('totalNeeds', formatCurrency(calculations.needs.total));
    
    // Update wants section
    displayWantsSection(calculations.wants);
    updateElement('totalWants', formatCurrency(calculations.wants.total));
    
    // Update savings section
    displaySavingsSection(calculations.savings);
    
    // Update health score
    displayHealthScore(calculations.healthScore, calculations);
}

function displayNeedsSection(needs) {
    const needsItems = document.getElementById('needsItems');
    const items = [
        { name: 'Rent/Accommodation', desc: 'Monthly housing costs', amount: needs.rent, icon: 'fa-home', color: 'ghana-red' },
        { name: 'Utilities', desc: 'Electricity, water, internet', amount: needs.utilities, icon: 'fa-bolt', color: 'ghana-yellow' },
        { name: 'Transportation', desc: 'Commuting and travel', amount: needs.transport, icon: 'fa-car', color: 'ghana-green' },
        { name: 'Food & Groceries', desc: 'Essential nutrition', amount: needs.food, icon: 'fa-utensils', color: 'ghana-red' }
    ];
    
    needsItems.innerHTML = items.map(item => `
        <div class="expense-item">
            <div class="expense-item-left">
                <div class="expense-item-icon ${item.color}">
                    <i class="fas ${item.icon}"></i>
                </div>
                <div class="expense-item-info">
                    <h4>${item.name}</h4>
                    <p>${item.desc}</p>
                </div>
            </div>
            <div class="expense-amount">${formatCurrency(item.amount)}</div>
        </div>
    `).join('');
}

function displayWantsSection(wants) {
    const wantsItems = document.getElementById('wantsItems');
    const items = [
        { name: 'Entertainment', desc: 'Movies, events, fun', amount: wants.entertainment, icon: 'fa-film', color: 'ghana-yellow' },
        { name: 'Dining Out', desc: 'Restaurants and takeout', amount: wants.dining, icon: 'fa-pizza-slice', color: 'ghana-red' },
        { name: 'Shopping', desc: 'Clothes and accessories', amount: wants.shopping, icon: 'fa-shopping-bag', color: 'ghana-green' },
        { name: 'Hobbies', desc: 'Personal interests', amount: wants.hobbies, icon: 'fa-gamepad', color: 'ghana-yellow' }
    ];
    
    wantsItems.innerHTML = items.map(item => `
        <div class="expense-item">
            <div class="expense-item-left">
                <div class="expense-item-icon ${item.color}">
                    <i class="fas ${item.icon}"></i>
                </div>
                <div class="expense-item-info">
                    <h4>${item.name}</h4>
                    <p>${item.desc}</p>
                </div>
            </div>
            <div class="expense-amount">${formatCurrency(item.amount)}</div>
        </div>
    `).join('');
}

function displaySavingsSection(savings) {
    const savingsBreakdown = document.getElementById('savingsBreakdown');
    const items = [
        { name: 'Emergency Fund', desc: '3-6 months expenses', amount: savings.emergency, icon: 'fa-shield-alt', color: 'ghana-green' },
        { name: 'Investments', desc: 'Stocks, bonds, mutual funds', amount: savings.investment, icon: 'fa-chart-line', color: 'ghana-yellow' },
        { name: 'Goal Savings', desc: 'Specific financial goals', amount: savings.goals, icon: 'fa-bullseye', color: 'ghana-red' }
    ];
    
    savingsBreakdown.innerHTML = items.map(item => `
        <div class="expense-item">
            <div class="expense-item-left">
                <div class="expense-item-icon ${item.color}">
                    <i class="fas ${item.icon}"></i>
                </div>
                <div class="expense-item-info">
                    <h4>${item.name}</h4>
                    <p>${item.desc}</p>
                </div>
            </div>
            <div class="expense-amount">${formatCurrency(item.amount)}</div>
        </div>
    `).join('');
    
    // Update savings progress
    const progressFill = document.getElementById('savingsProgress');
    const progressText = document.getElementById('savingsPercentage');
    const targetPercentage = Math.min(savings.percentage, 100);
    
    progressFill.style.width = targetPercentage + '%';
    progressText.textContent = targetPercentage.toFixed(1) + '%';
}

function displayHealthScore(score, calculations) {
    updateElement('healthScore', score);
    
    // Create health insights
    const insights = generateHealthInsights(score, calculations);
    const healthInsights = document.getElementById('healthInsights');
    
    healthInsights.innerHTML = insights.map(insight => `
        <div class="insight-item">
            <div class="insight-icon ${insight.color}">
                <i class="fas ${insight.icon}"></i>
            </div>
            <div class="insight-text">${insight.text}</div>
        </div>
    `).join('');
}

function generateHealthInsights(score, calculations) {
    const insights = [];
    
    if (score >= 80) {
        insights.push({ text: 'Excellent financial health!', icon: 'fa-star', color: 'ghana-green' });
    } else if (score >= 60) {
        insights.push({ text: 'Good financial foundation', icon: 'fa-thumbs-up', color: 'ghana-yellow' });
    } else {
        insights.push({ text: 'Room for improvement', icon: 'fa-arrow-up', color: 'ghana-red' });
    }
    
    const savingsRate = (calculations.savings.total / calculations.afterTax) * 100;
    if (savingsRate >= 20) {
        insights.push({ text: 'Great savings rate!', icon: 'fa-piggy-bank', color: 'ghana-green' });
    } else if (savingsRate < 10) {
        insights.push({ text: 'Consider increasing savings', icon: 'fa-exclamation-triangle', color: 'ghana-red' });
    }
    
    const housingRatio = (calculations.needs.rent / calculations.afterTax) * 100;
    if (housingRatio > 30) {
        insights.push({ text: 'Housing costs are high', icon: 'fa-home', color: 'ghana-yellow' });
    }
    
    return insights;
}

// Charts Creation
function createCharts(calculations) {
    createBudgetChart(calculations);
    createHealthScoreChart(calculations.healthScore);
}

function createBudgetChart(calculations) {
    const ctx = document.getElementById('budgetChart').getContext('2d');
    
    // Destroy existing chart
    if (charts.budget) {
        charts.budget.destroy();
    }
    
    const data = {
        labels: ['Needs', 'Wants', 'Savings'],
        datasets: [{
            data: [
                calculations.needs.total,
                calculations.wants.total,
                calculations.savings.total
            ],
            backgroundColor: [
                '#CE1126', // Ghana Red
                '#FCD116', // Ghana Yellow
                '#006B3F'  // Ghana Green
            ],
            borderWidth: 3,
            borderColor: '#FFFFFF'
        }]
    };
    
    charts.budget = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 14,
                            family: 'Inter'
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = formatCurrency(context.parsed);
                            const percentage = ((context.parsed / calculations.afterTax) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true,
                duration: 1500
            }
        }
    });
}

function createHealthScoreChart(score) {
    const ctx = document.getElementById('healthScoreChart').getContext('2d');
    
    // Destroy existing chart
    if (charts.health) {
        charts.health.destroy();
    }
    
    charts.health = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [score, 100 - score],
                backgroundColor: [
                    score >= 80 ? '#006B3F' : score >= 60 ? '#FCD116' : '#CE1126',
                    '#E9ECEF'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    display: false
                }
            },
            animation: {
                animateScale: true,
                duration: 2000
            }
        }
    });
}

// Recommendations Generation
function generateRecommendations(calculations) {
    const recommendations = [];
    const savingsRate = (calculations.savings.total / calculations.afterTax) * 100;
    const housingRatio = (calculations.needs.rent / calculations.afterTax) * 100;
    
    // Savings recommendations
    if (savingsRate < 10) {
        recommendations.push({
            title: 'Boost Your Savings Rate',
            text: 'Aim to save at least 20% of your income. Start small and gradually increase your savings rate.',
            icon: 'fa-piggy-bank',
            color: 'ghana-green'
        });
    }
    
    // Housing recommendations
    if (housingRatio > 30) {
        recommendations.push({
            title: 'Consider Housing Costs',
            text: 'Your housing costs are above 30% of income. Look for ways to reduce rent or increase income.',
            icon: 'fa-home',
            color: 'ghana-yellow'
        });
    }
    
    // Emergency fund
    const emergencyMonths = calculations.savings.emergency / (calculations.needs.total + calculations.wants.total);
    if (emergencyMonths < 3) {
        recommendations.push({
            title: 'Build Emergency Fund',
            text: 'Aim for 3-6 months of expenses in an emergency fund for financial security.',
            icon: 'fa-shield-alt',
            color: 'ghana-red'
        });
    }
    
    // Investment recommendations
    if (calculations.savings.investment > 0) {
        recommendations.push({
            title: 'Diversify Investments',
            text: 'Consider a mix of local and international investments, including Ghana Stock Exchange options.',
            icon: 'fa-chart-line',
            color: 'ghana-green'
        });
    }
    
    // Lifestyle optimization
    if (calculations.wants.percentage > 30) {
        recommendations.push({
            title: 'Optimize Lifestyle Spending',
            text: 'Look for ways to enjoy life while spending mindfully on wants and entertainment.',
            icon: 'fa-balance-scale',
            color: 'ghana-yellow'
        });
    }
    
    // Display recommendations
    const recommendationsList = document.getElementById('recommendationsList');
    recommendationsList.innerHTML = recommendations.map(rec => `
        <div class="recommendation-item">
            <div class="recommendation-icon ${rec.color}">
                <i class="fas ${rec.icon}"></i>
            </div>
            <div class="recommendation-content">
                <h4>${rec.title}</h4>
                <p>${rec.text}</p>
            </div>
        </div>
    `).join('');
}

// Utility Functions
function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function formatCurrency(amount) {
    return '₵ ' + Math.round(amount).toLocaleString();
}

// Animation Functions
function animateCounters() {
    const counters = document.querySelectorAll('.amount');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent.replace(/[₵,\s]/g, ''));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            counter.textContent = Math.round(current).toLocaleString();
        }, 16);
    });
}

function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Observe elements with animation classes
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

function animateOnScroll() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('visible');
        }
    });
}

function setupNumberCounters() {
    const previewAmounts = document.querySelectorAll('.preview-card .amount');
    
    previewAmounts.forEach((amount, index) => {
        const delay = index * 200;
        setTimeout(() => {
            amount.style.animation = 'countUp 1s ease forwards';
        }, delay);
    });
}

// Confetti Animation
function triggerConfetti(celebrate = true) {
    if (!celebrate || typeof confetti === 'undefined') return;
    
    // Ghana flag colors confetti
    const colors = ['#CE1126', '#FCD116', '#006B3F'];
    
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: colors
    });
    
    // Additional burst after delay
    setTimeout(() => {
        confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: colors
        });
        confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: colors
        });
    }, 500);
}

// Export Functions
function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    
    // Add title
    pdf.setFontSize(20);
    pdf.setTextColor(206, 17, 38); // Ghana red
    pdf.text('Ghana Cedis Budget Plan', 20, 30);
    
    // Add date
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Generated on: ' + new Date().toLocaleDateString(), 20, 45);
    
    // Add budget summary
    pdf.setFontSize(14);
    pdf.text('Budget Summary', 20, 65);
    
    pdf.setFontSize(11);
    const income = budgetData.income;
    const calculations = calculateBudget(budgetData);
    
    let yPos = 80;
    const lineHeight = 8;
    
    const budgetLines = [
        `Monthly Income: ${formatCurrency(calculations.income)}`,
        `After Tax Income: ${formatCurrency(calculations.afterTax)}`,
        '',
        'NEEDS (Essential Expenses):',
        `  Rent/Accommodation: ${formatCurrency(calculations.needs.rent)}`,
        `  Utilities: ${formatCurrency(calculations.needs.utilities)}`,
        `  Transportation: ${formatCurrency(calculations.needs.transport)}`,
        `  Food & Groceries: ${formatCurrency(calculations.needs.food)}`,
        `  Total Needs: ${formatCurrency(calculations.needs.total)}`,
        '',
        'WANTS (Lifestyle Expenses):',
        `  Entertainment: ${formatCurrency(calculations.wants.entertainment)}`,
        `  Dining Out: ${formatCurrency(calculations.wants.dining)}`,
        `  Shopping: ${formatCurrency(calculations.wants.shopping)}`,
        `  Hobbies: ${formatCurrency(calculations.wants.hobbies)}`,
        `  Total Wants: ${formatCurrency(calculations.wants.total)}`,
        '',
        'SAVINGS & INVESTMENTS:',
        `  Emergency Fund: ${formatCurrency(calculations.savings.emergency)}`,
        `  Investments: ${formatCurrency(calculations.savings.investment)}`,
        `  Goal Savings: ${formatCurrency(calculations.savings.goals)}`,
        `  Total Savings: ${formatCurrency(calculations.savings.total)}`,
        '',
        `Financial Health Score: ${calculations.healthScore}/100`
    ];
    
    budgetLines.forEach(line => {
        if (yPos > 270) { // Page break
            pdf.addPage();
            yPos = 20;
        }
        
        if (line.startsWith('NEEDS') || line.startsWith('WANTS') || line.startsWith('SAVINGS')) {
            pdf.setFont(undefined, 'bold');
        } else {
            pdf.setFont(undefined, 'normal');
        }
        
        pdf.text(line, 20, yPos);
        yPos += lineHeight;
    });
    
    // Add recommendations
    yPos += 10;
    if (yPos > 250) {
        pdf.addPage();
        yPos = 20;
    }
    
    pdf.setFont(undefined, 'bold');
    pdf.text('Recommendations:', 20, yPos);
    yPos += lineHeight;
    
    // Add footer
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setTextColor(128, 128, 128);
        pdf.text('Generated by Ghana Budget Planner', 20, 285);
        pdf.text(`Page ${i} of ${pageCount}`, 170, 285);
    }
    
    // Save the PDF
    pdf.save('ghana-budget-plan.pdf');
}

function shareResults() {
    if (navigator.share) {
        navigator.share({
            title: 'My Ghana Budget Plan',
            text: 'Check out my personalized budget plan created with Ghana Budget Planner!',
            url: window.location.href
        }).catch(console.error);
    } else {
        // Fallback - copy link to clipboard
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert('Link copied to clipboard!');
        }).catch(() => {
            alert('Share feature not available in this browser.');
        });
    }
}

// Responsive Handler
function handleResize() {
    // Redraw charts on resize
    Object.values(charts).forEach(chart => {
        if (chart) {
            chart.resize();
        }
    });
}

// CSS Animation Keyframes (to be added via JavaScript)
function addCustomAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes countUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .dashboard-card {
            animation: slideInUp 0.6s ease forwards;
        }
        
        .dashboard-card:nth-child(1) { animation-delay: 0.1s; }
        .dashboard-card:nth-child(2) { animation-delay: 0.2s; }
        .dashboard-card:nth-child(3) { animation-delay: 0.3s; }
        .dashboard-card:nth-child(4) { animation-delay: 0.4s; }
        .dashboard-card:nth-child(5) { animation-delay: 0.5s; }
        .dashboard-card:nth-child(6) { animation-delay: 0.6s; }
        .dashboard-card:nth-child(7) { animation-delay: 0.7s; }
        
        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize custom animations
document.addEventListener('DOMContentLoaded', addCustomAnimations);