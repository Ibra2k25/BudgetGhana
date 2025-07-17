// Results Page JavaScript
let budgetData = {};
let charts = {};

document.addEventListener('DOMContentLoaded', function() {
    initializeResults();
    setupEventListeners();
});

function initializeResults() {
    console.log('Ghana Budget Planner Results Loaded');
    
    // Load data from localStorage
    loadBudgetData();
    
    // Generate budget plan
    if (budgetData && Object.keys(budgetData).length > 0) {
        generateBudgetPlan();
        triggerConfetti();
    } else {
        // Redirect back to form if no data
        alert('No budget data found. Please fill out the form first.');
        window.location.href = 'form.html';
    }
}

function setupEventListeners() {
    // Window events
    window.addEventListener('resize', handleResize);
}

function loadBudgetData() {
    const savedData = localStorage.getItem('budgetFormData');
    if (savedData) {
        try {
            budgetData = JSON.parse(savedData);
            console.log('Loaded budget data:', budgetData);
        } catch (error) {
            console.error('Error parsing budget data:', error);
            budgetData = {};
        }
    }
}

// Budget Calculation Engine
function generateBudgetPlan() {
    const calculations = calculateBudget(budgetData);
    displayBudgetResults(calculations);
    createCharts(calculations);
    generateRecommendations(calculations);
    animateCounters();
    
    // Store calculations for PDF export
    window.budgetCalculations = calculations;
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
    
    // Update summary
    displaySummary(calculations);
}

function displayNeedsSection(needs) {
    const needsItems = document.getElementById('needsItems');
    const items = [
        { name: 'Rent/Accommodation', desc: 'Monthly housing costs', amount: needs.rent, icon: 'fa-home', color: 'icon-accent' },
        { name: 'Utilities', desc: 'Electricity, water, internet', amount: needs.utilities, icon: 'fa-bolt', color: 'icon-secondary' },
        { name: 'Transportation', desc: 'Commuting and travel', amount: needs.transport, icon: 'fa-car', color: 'icon-primary' },
        { name: 'Food & Groceries', desc: 'Essential nutrition', amount: needs.food, icon: 'fa-utensils', color: 'icon-accent' }
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
        { name: 'Entertainment', desc: 'Movies, events, fun', amount: wants.entertainment, icon: 'fa-film', color: 'icon-secondary' },
        { name: 'Dining Out', desc: 'Restaurants and takeout', amount: wants.dining, icon: 'fa-pizza-slice', color: 'icon-accent' },
        { name: 'Shopping', desc: 'Clothes and accessories', amount: wants.shopping, icon: 'fa-shopping-bag', color: 'icon-primary' },
        { name: 'Hobbies', desc: 'Personal interests', amount: wants.hobbies, icon: 'fa-gamepad', color: 'icon-secondary' }
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
        { name: 'Emergency Fund', desc: '3-6 months expenses', amount: savings.emergency, icon: 'fa-shield-alt', color: 'icon-primary' },
        { name: 'Investments', desc: 'Stocks, bonds, mutual funds', amount: savings.investment, icon: 'fa-chart-line', color: 'icon-secondary' },
        { name: 'Goal Savings', desc: 'Specific financial goals', amount: savings.goals, icon: 'fa-bullseye', color: 'icon-accent' }
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

function displaySummary(calculations) {
    const totalExpenses = calculations.needs.total + calculations.wants.total;
    const remainingBalance = calculations.afterTax - totalExpenses - calculations.savings.total;
    
    updateElement('summaryIncome', formatCurrency(calculations.afterTax));
    updateElement('summaryExpenses', formatCurrency(totalExpenses));
    updateElement('summarySavings', formatCurrency(calculations.savings.total));
    updateElement('summaryBalance', formatCurrency(remainingBalance));
}

function generateHealthInsights(score, calculations) {
    const insights = [];
    
    if (score >= 80) {
        insights.push({ text: 'Excellent financial health!', icon: 'fa-star', color: 'icon-primary' });
    } else if (score >= 60) {
        insights.push({ text: 'Good financial foundation', icon: 'fa-thumbs-up', color: 'icon-secondary' });
    } else {
        insights.push({ text: 'Room for improvement', icon: 'fa-arrow-up', color: 'icon-accent' });
    }
    
    const savingsRate = (calculations.savings.total / calculations.afterTax) * 100;
    if (savingsRate >= 20) {
        insights.push({ text: 'Great savings rate!', icon: 'fa-piggy-bank', color: 'icon-primary' });
    } else if (savingsRate < 10) {
        insights.push({ text: 'Consider increasing savings', icon: 'fa-exclamation-triangle', color: 'icon-accent' });
    }
    
    const housingRatio = (calculations.needs.rent / calculations.afterTax) * 100;
    if (housingRatio > 30) {
        insights.push({ text: 'Housing costs are high', icon: 'fa-home', color: 'icon-secondary' });
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
                '#4F46E5', // Primary
                '#7C3AED', // Secondary  
                '#F59E0B'  // Accent
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
                    score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444',
                    '#E5E7EB'
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
            color: 'icon-primary'
        });
    }
    
    // Housing recommendations
    if (housingRatio > 30) {
        recommendations.push({
            title: 'Consider Housing Costs',
            text: 'Your housing costs are above 30% of income. Look for ways to reduce rent or increase income.',
            icon: 'fa-home',
            color: 'icon-secondary'
        });
    }
    
    // Emergency fund
    const emergencyMonths = calculations.savings.emergency / (calculations.needs.total + calculations.wants.total);
    if (emergencyMonths < 3) {
        recommendations.push({
            title: 'Build Emergency Fund',
            text: 'Aim for 3-6 months of expenses in an emergency fund for financial security.',
            icon: 'fa-shield-alt',
            color: 'icon-accent'
        });
    }
    
    // Investment recommendations
    if (calculations.savings.investment > 0) {
        recommendations.push({
            title: 'Diversify Investments',
            text: 'Consider a mix of local and international investments, including Ghana Stock Exchange options.',
            icon: 'fa-chart-line',
            color: 'icon-primary'
        });
    }
    
    // Lifestyle optimization
    if (calculations.wants.percentage > 30) {
        recommendations.push({
            title: 'Optimize Lifestyle Spending',
            text: 'Look for ways to enjoy life while spending mindfully on wants and entertainment.',
            icon: 'fa-balance-scale',
            color: 'icon-secondary'
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

// Confetti Animation
function triggerConfetti() {
    if (typeof confetti === 'undefined') return;
    
    // Modern neutral colors confetti
    const colors = ['#4F46E5', '#7C3AED', '#F59E0B'];
    
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
    pdf.setTextColor(79, 70, 229); // Primary color
    pdf.text('Ghana Cedis Budget Plan', 20, 30);
    
    // Add date
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Generated on: ' + new Date().toLocaleDateString(), 20, 45);
    
    // Add budget summary
    pdf.setFontSize(14);
    pdf.text('Budget Summary', 20, 65);
    
    pdf.setFontSize(11);
    const calculations = window.budgetCalculations;
    
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
        const url = window.location.origin + '/index.html';
        navigator.clipboard.writeText(url).then(() => {
            alert('Link copied to clipboard!');
        }).catch(() => {
            alert('Share: ' + url);
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