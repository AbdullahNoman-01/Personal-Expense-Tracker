/**
 * Personal Expense Tracker - Core Application Engine (home.js)
 * 
 * Features:
 *  - 100% Dynamic Dashboard (Current Balance, Total Income, Total Expenses, Savings Rate)
 *  - LocalStorage Data Persistence with Per-User Isolation
 *  - New users start with $0.00 balance; Guests get a rich preview demo
 *  - Chart.js Visualizations (Income vs Expense Bar Chart & Category Doughnut Chart)
 *  - Unified Add & Edit Transaction Modal with strict real-time input validation
 *  - Transaction History Table with Category Tags, Type Badges, and Action Buttons
 *  - Delete Confirmation Dialog Modal (Bonus Challenge)
 *  - Real-time Search by title/merchant & Multi-criteria Filtering (Type, Category, Date sort)
 *  - Empty state illustrations when transactions are 0
 *  - Dynamic Notification System (Deposit, Withdraw, Add, Edit, Delete, Pay Bill) with unread badge & mark-as-read
 *  - Multi-View Navigation (Dashboard, Transactions, Analytics, Budget Planner, Cards, Invoices, Rewards)
 *  - Invoices & Bills Manager with 1-click Pay Bill action (automatically converts to expense)
 *  - Category Budget Planner with dynamic progress bars & over-budget alerts
 *  - Virtual Debit Card with instant Deposit & Withdraw funds modals
 *  - Gamified Savings Milestones & Badges that unlock dynamically
 *  - CSV Statement Export
 *  - 5 Selectable Theme Colors & Day/Night Mode
 *  - Fully Responsive for Desktop, Tablet, and Mobile
 */

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // 1. Current User Configuration & Storage Keys
    // =========================================================================
    const CURRENT_USER = window.CURRENT_USER || 'guest';
    const IS_AUTHENTICATED = window.IS_AUTHENTICATED === true;
    const USER_FULL_NAME = window.USER_FULL_NAME || 'User';

    const STORAGE_KEY_TX = `pet_tx_${CURRENT_USER}`;
    const STORAGE_KEY_NOTIF = `pet_notif_${CURRENT_USER}`;
    const STORAGE_KEY_BUDGET = `pet_budget_${CURRENT_USER}`;
    const STORAGE_KEY_BILLS = `pet_bills_${CURRENT_USER}`;

    // =========================================================================
    // 2. Categories Definition with Emojis & Tag Colors
    // =========================================================================
    const CATEGORIES = {
        expense: [
            { name: 'Food & Dining', icon: '🍔', tagClass: 'tag-food', color: '#F59E0B' },
            { name: 'Shopping', icon: '🛍️', tagClass: 'tag-food', color: '#10B981' },
            { name: 'Transportation', icon: '🚗', tagClass: 'tag-util', color: '#06B6D4' },
            { name: 'Housing & Utilities', icon: '⚡', tagClass: 'tag-util', color: '#3B82F6' },
            { name: 'Entertainment', icon: '🎬', tagClass: 'tag-ent', color: '#EC4899' },
            { name: 'Health & Fitness', icon: '💊', tagClass: 'tag-income', color: '#8B5CF6' },
            { name: 'Education', icon: '📚', tagClass: 'tag-ent', color: '#6366F1' },
            { name: 'Withdrawal', icon: '🏧', tagClass: 'tag-util', color: '#EF4444' },
            { name: 'Other', icon: '📦', tagClass: 'tag-util', color: '#64748B' }
        ],
        income: [
            { name: 'Salary', icon: '💰', tagClass: 'tag-income', color: '#10B981' },
            { name: 'Freelance', icon: '💻', tagClass: 'tag-income', color: '#059669' },
            { name: 'Investment', icon: '📈', tagClass: 'tag-income', color: '#0EA5E9' },
            { name: 'Deposit', icon: '💳', tagClass: 'tag-income', color: '#2563EB' },
            { name: 'Gift / Bonus', icon: '🎁', tagClass: 'tag-income', color: '#F59E0B' },
            { name: 'Other', icon: '💵', tagClass: 'tag-income', color: '#10B981' }
        ]
    };

    function getCategoryMeta(catName, type = 'expense') {
        const pool = type === 'income' ? CATEGORIES.income : CATEGORIES.expense;
        const found = pool.find(c => c.name.toLowerCase() === (catName || '').toLowerCase());
        if (found) return found;

        // Fallback search across both
        const all = [...CATEGORIES.expense, ...CATEGORIES.income];
        const match = all.find(c => c.name.toLowerCase().includes((catName || '').toLowerCase()));
        return match || { name: catName || 'Other', icon: type === 'income' ? '💰' : '📦', tagClass: 'tag-food', color: '#3B82F6' };
    }

    // =========================================================================
    // 3. Initial Sample Data (Guest Preview vs New User Zero Balance)
    // =========================================================================
    const SAMPLE_GUEST_TRANSACTIONS = [
        {
            id: 'tx_sample_1',
            title: 'Monthly Salary',
            merchant: 'Acme Global Corp',
            category: 'Salary',
            type: 'income',
            amount: 3250.00,
            date: getFormattedDate(1), // yesterday
            timestamp: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: 'tx_sample_2',
            title: 'Supermarket Groceries',
            merchant: 'FreshMart Superstore',
            category: 'Food & Dining',
            type: 'expense',
            amount: 124.50,
            date: getFormattedDate(0), // today
            timestamp: new Date().toISOString()
        },
        {
            id: 'tx_sample_3',
            title: 'Freelance UI Project',
            merchant: 'Upwork Escrow',
            category: 'Freelance',
            type: 'income',
            amount: 850.00,
            date: getFormattedDate(3),
            timestamp: new Date(Date.now() - 3 * 86400000).toISOString()
        },
        {
            id: 'tx_sample_4',
            title: 'Netflix Subscription',
            merchant: 'Netflix Inc.',
            category: 'Entertainment',
            type: 'expense',
            amount: 15.99,
            date: getFormattedDate(2),
            timestamp: new Date(Date.now() - 2 * 86400000).toISOString()
        },
        {
            id: 'tx_sample_5',
            title: 'Electricity & Power Bill',
            merchant: 'City Utilities',
            category: 'Housing & Utilities',
            type: 'expense',
            amount: 85.00,
            date: getFormattedDate(4),
            timestamp: new Date(Date.now() - 4 * 86400000).toISOString()
        },
        {
            id: 'tx_sample_6',
            title: 'Starbucks Morning Coffee',
            merchant: 'Starbucks Coffee #12',
            category: 'Food & Dining',
            type: 'expense',
            amount: 6.80,
            date: getFormattedDate(5),
            timestamp: new Date(Date.now() - 5 * 86400000).toISOString()
        }
    ];

    const DEFAULT_BILLS = [
        { id: 'bill_1', name: 'High-Speed Fiber Internet', category: 'Housing & Utilities', amount: 45.00, dueDate: getFormattedDate(-5), status: 'Unpaid', icon: '🌐' },
        { id: 'bill_2', name: 'Electricity & Power Grid', category: 'Housing & Utilities', amount: 85.00, dueDate: getFormattedDate(-10), status: 'Unpaid', icon: '⚡' },
        { id: 'bill_3', name: 'Apartment Monthly Rent', category: 'Housing & Utilities', amount: 850.00, dueDate: getFormattedDate(-15), status: 'Unpaid', icon: '🏠' },
        { id: 'bill_4', name: 'Netflix Premium 4K', category: 'Entertainment', amount: 15.99, dueDate: getFormattedDate(2), status: 'Paid', icon: '🎬' }
    ];

    const DEFAULT_BUDGETS = {
        'Food & Dining': 500,
        'Shopping': 300,
        'Transportation': 150,
        'Housing & Utilities': 400,
        'Entertainment': 100,
        'Health': 120,
        'Other': 150
    };

    function getFormattedDate(daysAgo = 0) {
        const d = new Date(Date.now() - daysAgo * 86400000);
        return d.toISOString().split('T')[0];
    }

    // =========================================================================
    // 4. Data Layer: Load & Save from LocalStorage
    // =========================================================================
    function loadTransactions() {
        const raw = localStorage.getItem(STORAGE_KEY_TX);
        if (raw !== null) {
            try {
                return JSON.parse(raw);
            } catch (e) {
                console.error("Error parsing transactions from localStorage:", e);
            }
        }

        // If authenticated user created new account -> start with 0 balance & empty array!
        if (IS_AUTHENTICATED) {
            localStorage.setItem(STORAGE_KEY_TX, JSON.stringify([]));
            return [];
        }

        // If guest mode, initialize sample demo data for preview
        localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(SAMPLE_GUEST_TRANSACTIONS));
        return [...SAMPLE_GUEST_TRANSACTIONS];
    }

    function saveTransactions(list) {
        localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(list));
    }

    function loadBudgets() {
        const raw = localStorage.getItem(STORAGE_KEY_BUDGET);
        if (raw) {
            try { return JSON.parse(raw); } catch (e) { }
        }
        return { ...DEFAULT_BUDGETS };
    }

    function saveBudgets(budgets) {
        localStorage.setItem(STORAGE_KEY_BUDGET, JSON.stringify(budgets));
    }

    const BILL_VANISH_MS = 5 * 60 * 1000; // 5 minutes in milliseconds

    function loadBills() {
        const raw = localStorage.getItem(STORAGE_KEY_BILLS);
        let list = [...DEFAULT_BILLS];
        if (raw) {
            try { list = JSON.parse(raw); } catch (e) { }
        }
        // Auto-purge any paid bills that were paid 5 minutes or more ago
        const now = Date.now();
        list = list.filter(b => {
            if (b.status === 'Paid' && b.paidAt && (now - b.paidAt >= BILL_VANISH_MS)) {
                return false;
            }
            return true;
        });
        return list;
    }

    function saveBills(bills) {
        localStorage.setItem(STORAGE_KEY_BILLS, JSON.stringify(bills));
    }

    function loadNotifications() {
        const raw = localStorage.getItem(STORAGE_KEY_NOTIF);
        if (raw) {
            try { return JSON.parse(raw); } catch (e) { }
        }
        // Initial welcome notification
        return [
            {
                id: 'notif_welcome',
                icon: '🎉',
                text: `Welcome to Personal Expense Tracker, ${USER_FULL_NAME}! Manage income, expenses, and savings seamlessly.`,
                time: 'Just now',
                unread: true,
                timestamp: Date.now()
            }
        ];
    }

    function saveNotifications(notifs) {
        localStorage.setItem(STORAGE_KEY_NOTIF, JSON.stringify(notifs));
    }

    function addNotification(text, icon = 'ℹ️') {
        const notifs = loadNotifications();
        const newNotif = {
            id: 'notif_' + Date.now(),
            icon: icon,
            text: text,
            time: 'Just now',
            unread: true,
            timestamp: Date.now()
        };
        notifs.unshift(newNotif);
        // keep max 25
        if (notifs.length > 25) notifs.pop();
        saveNotifications(notifs);
        renderNotifications();
    }

    // App state in memory
    let transactions = loadTransactions();
    let budgets = loadBudgets();
    let bills = loadBills();

    // =========================================================================
    // 5. Toast Notifications Helper
    // =========================================================================
    function showToast(message, type = 'info') {
        let container = document.getElementById('dashToastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'dashToastContainer';
            container.className = 'dash-toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `dash-toast ${type}`;
        
        let icon = 'ℹ️';
        if (type === 'success') icon = '✅';
        if (type === 'warning') icon = '⚠️';
        if (type === 'error') icon = '❌';

        toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 15);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 260);
        }, 3600);
    }

    // =========================================================================
    // 6. Currency Formatter Helper
    // =========================================================================
    function formatMoney(amount) {
        const num = parseFloat(amount) || 0;
        return '$' + num.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    // =========================================================================
    // 7. Core Calculations & Dashboard KPI Totals
    // =========================================================================
    function calculateTotals() {
        let totalIncome = 0;
        let totalExpense = 0;
        let incomeCount = 0;
        let expenseCount = 0;

        transactions.forEach(t => {
            const amt = parseFloat(t.amount) || 0;
            if (t.type === 'income') {
                totalIncome += amt;
                incomeCount++;
            } else {
                totalExpense += amt;
                expenseCount++;
            }
        });

        const currentBalance = totalIncome - totalExpense;
        let savingsRate = 0;
        if (totalIncome > 0) {
            savingsRate = Math.max(0, Math.min(100, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)));
        }

        // Update DOM Elements
        const elBalance = document.getElementById('dashTotalBalance');
        const elIncome = document.getElementById('dashTotalIncome');
        const elExpense = document.getElementById('dashTotalExpense');
        const elSavings = document.getElementById('dashSavingsTarget');
        const elSavingsPct = document.getElementById('dashSavingsPct');
        const elSavingsBar = document.getElementById('dashSavingsBar');
        const elVcBalance = document.getElementById('vcTotalBalance');
        const elIncomeSub = document.getElementById('incomeCountSub');
        const elExpenseSub = document.getElementById('expenseCountSub');
        const elBalanceBadge = document.getElementById('balanceStatusBadge');

        if (elBalance) {
            elBalance.textContent = formatMoney(currentBalance);
            if (currentBalance < 0) {
                elBalance.style.color = '#DC2626';
            } else {
                elBalance.style.color = '';
            }
        }

        if (elIncome) elIncome.textContent = `+${formatMoney(totalIncome)}`;
        if (elExpense) elExpense.textContent = `-${formatMoney(totalExpense)}`;
        if (elSavings) elSavings.textContent = formatMoney(Math.max(0, currentBalance));
        if (elSavingsPct) elSavingsPct.textContent = `${savingsRate}%`;
        if (elSavingsBar) elSavingsBar.style.width = `${savingsRate}%`;
        if (elVcBalance) elVcBalance.textContent = formatMoney(currentBalance);

        if (elIncomeSub) elIncomeSub.textContent = `${incomeCount} income source${incomeCount !== 1 ? 's' : ''}`;
        if (elExpenseSub) elExpenseSub.textContent = `${expenseCount} expense record${expenseCount !== 1 ? 's' : ''}`;

        if (elBalanceBadge) {
            if (currentBalance < 0) {
                elBalanceBadge.textContent = 'Deficit';
                elBalanceBadge.className = 'stat-badge-trend' + ' danger';
                elBalanceBadge.style.background = '#FEF2F2';
                elBalanceBadge.style.color = '#DC2626';
            } else {
                elBalanceBadge.textContent = 'Active';
                elBalanceBadge.className = 'stat-badge-trend positive';
                elBalanceBadge.style.background = '#ECFDF5';
                elBalanceBadge.style.color = '#059669';
            }
        }

        return { totalIncome, totalExpense, currentBalance, savingsRate, incomeCount, expenseCount };
    }

    // =========================================================================
    // 8. Chart.js Visualizations (Bar Chart & Doughnut Chart)
    // =========================================================================
    let chartIncomeExpenseInstance = null;
    let chartCategoryDonutInstance = null;
    let chartAnalyticsTrendInstance = null;
    let chartAnalyticsDonutInstance = null;

    function initCharts() {
        if (typeof Chart === 'undefined') {
            console.warn("Chart.js not loaded yet. Skipping chart initialization.");
            return;
        }

        // Chart.js Global Modern Styling
        Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
        Chart.defaults.color = '#64748B';

        // 1. Dashboard: Income vs Expense Bar Chart
        const ctxBar = document.getElementById('chartIncomeExpense');
        if (ctxBar) {
            chartIncomeExpenseInstance = new Chart(ctxBar, {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: 'Income',
                            data: [],
                            backgroundColor: '#10B981',
                            borderRadius: 8,
                            barPercentage: 0.6,
                            categoryPercentage: 0.6
                        },
                        {
                            label: 'Expenses',
                            data: [],
                            backgroundColor: '#EF4444',
                            borderRadius: 8,
                            barPercentage: 0.6,
                            categoryPercentage: 0.6
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: { boxWidth: 12, usePointStyle: true, font: { weight: '600', size: 12 } }
                        },
                        tooltip: {
                            callbacks: {
                                label: (ctx) => ` ${ctx.dataset.label}: $${ctx.raw.toFixed(2)}`
                            }
                        }
                    },
                    scales: {
                        x: { grid: { display: false } },
                        y: {
                            grid: { color: 'rgba(226, 232, 240, 0.6)' },
                            ticks: { callback: (val) => `$${val}` }
                        }
                    }
                }
            });
        }

        // 2. Dashboard: Expense by Category Doughnut
        const ctxDonut = document.getElementById('chartCategoryDonut');
        if (ctxDonut) {
            chartCategoryDonutInstance = new Chart(ctxDonut, {
                type: 'doughnut',
                data: {
                    labels: [],
                    datasets: [{
                        data: [],
                        backgroundColor: [
                            '#F59E0B', '#3B82F6', '#EC4899', '#10B981',
                            '#8B5CF6', '#06B6D4', '#64748B', '#F97316'
                        ],
                        borderWidth: 2,
                        hoverOffset: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '72%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { boxWidth: 10, usePointStyle: true, font: { size: 11, weight: '600' } }
                        },
                        tooltip: {
                            callbacks: {
                                label: (ctx) => ` ${ctx.label}: $${ctx.raw.toFixed(2)}`
                            }
                        }
                    }
                }
            });
        }

        // 3. Analytics View: Cash Flow Trend Line Chart
        const ctxTrend = document.getElementById('chartAnalyticsTrend');
        if (ctxTrend) {
            chartAnalyticsTrendInstance = new Chart(ctxTrend, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: 'Net Balance',
                            data: [],
                            borderColor: '#2563EB',
                            backgroundColor: 'rgba(37, 99, 235, 0.08)',
                            fill: true,
                            tension: 0.35,
                            pointRadius: 4,
                            pointBackgroundColor: '#2563EB'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (ctx) => ` Balance: $${ctx.raw.toFixed(2)}`
                            }
                        }
                    },
                    scales: {
                        x: { grid: { display: false } },
                        y: {
                            grid: { color: 'rgba(226, 232, 240, 0.6)' },
                            ticks: { callback: (val) => `$${val}` }
                        }
                    }
                }
            });
        }

        // 4. Analytics View: Category Donut Chart
        const ctxAnaDonut = document.getElementById('chartAnalyticsDonut');
        if (ctxAnaDonut) {
            chartAnalyticsDonutInstance = new Chart(ctxAnaDonut, {
                type: 'doughnut',
                data: {
                    labels: [],
                    datasets: [{
                        data: [],
                        backgroundColor: [
                            '#F59E0B', '#3B82F6', '#EC4899', '#10B981',
                            '#8B5CF6', '#06B6D4', '#64748B', '#F97316'
                        ],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '65%',
                    plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 10, usePointStyle: true, font: { size: 11 } } }
                    }
                }
            });
        }
    }

    function updateCharts() {
        if (typeof Chart === 'undefined') return;

        // --- 1. Prepare Category Breakdown ---
        const categoryMap = {};
        transactions.forEach(t => {
            if (t.type === 'expense') {
                const cat = t.category || 'Other';
                categoryMap[cat] = (categoryMap[cat] || 0) + (parseFloat(t.amount) || 0);
            }
        });

        const categoryLabels = Object.keys(categoryMap);
        const categoryValues = Object.values(categoryMap);

        if (chartCategoryDonutInstance) {
            if (categoryLabels.length === 0) {
                chartCategoryDonutInstance.data.labels = ['No Expenses'];
                chartCategoryDonutInstance.data.datasets[0].data = [1];
                chartCategoryDonutInstance.data.datasets[0].backgroundColor = ['#E2E8F0'];
            } else {
                chartCategoryDonutInstance.data.labels = categoryLabels;
                chartCategoryDonutInstance.data.datasets[0].data = categoryValues;
                chartCategoryDonutInstance.data.datasets[0].backgroundColor = [
                    '#F59E0B', '#3B82F6', '#EC4899', '#10B981',
                    '#8B5CF6', '#06B6D4', '#64748B', '#F97316'
                ];
            }
            chartCategoryDonutInstance.update();
        }

        if (chartAnalyticsDonutInstance) {
            if (categoryLabels.length === 0) {
                chartAnalyticsDonutInstance.data.labels = ['No Expenses'];
                chartAnalyticsDonutInstance.data.datasets[0].data = [1];
                chartAnalyticsDonutInstance.data.datasets[0].backgroundColor = ['#E2E8F0'];
            } else {
                chartAnalyticsDonutInstance.data.labels = categoryLabels;
                chartAnalyticsDonutInstance.data.datasets[0].data = categoryValues;
                chartAnalyticsDonutInstance.data.datasets[0].backgroundColor = [
                    '#F59E0B', '#3B82F6', '#EC4899', '#10B981',
                    '#8B5CF6', '#06B6D4', '#64748B', '#F97316'
                ];
            }
            chartAnalyticsDonutInstance.update();
        }

        // --- 2. Monthly Cash Flow (Income vs Expense) ---
        // Group transactions by month
        const monthlyData = {};
        const monthOrder = [];

        transactions.forEach(t => {
            const dateObj = new Date(t.date || t.timestamp || Date.now());
            const monthKey = dateObj.toLocaleString('en-US', { month: 'short', year: '2-digit' });
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { income: 0, expense: 0 };
                monthOrder.push(monthKey);
            }
            const amt = parseFloat(t.amount) || 0;
            if (t.type === 'income') {
                monthlyData[monthKey].income += amt;
            } else {
                monthlyData[monthKey].expense += amt;
            }
        });

        // If no transactions, provide default current month
        if (monthOrder.length === 0) {
            const currentMonth = new Date().toLocaleString('en-US', { month: 'short', year: '2-digit' });
            monthOrder.push(currentMonth);
            monthlyData[currentMonth] = { income: 0, expense: 0 };
        }

        const labels = monthOrder.slice(-6); // last 6 months
        const incomeSeries = labels.map(m => monthlyData[m]?.income || 0);
        const expenseSeries = labels.map(m => monthlyData[m]?.expense || 0);

        if (chartIncomeExpenseInstance) {
            chartIncomeExpenseInstance.data.labels = labels;
            chartIncomeExpenseInstance.data.datasets[0].data = incomeSeries;
            chartIncomeExpenseInstance.data.datasets[1].data = expenseSeries;
            chartIncomeExpenseInstance.update();
        }

        // --- 3. Analytics Net Trend ---
        if (chartAnalyticsTrendInstance) {
            let runningBal = 0;
            const sortedByDate = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
            const trendLabels = [];
            const trendValues = [];

            sortedByDate.forEach(t => {
                const amt = parseFloat(t.amount) || 0;
                if (t.type === 'income') runningBal += amt;
                else runningBal -= amt;

                trendLabels.push(t.date || 'Record');
                trendValues.push(runningBal);
            });

            if (trendLabels.length === 0) {
                chartAnalyticsTrendInstance.data.labels = ['Start'];
                chartAnalyticsTrendInstance.data.datasets[0].data = [0];
            } else {
                chartAnalyticsTrendInstance.data.labels = trendLabels.slice(-10);
                chartAnalyticsTrendInstance.data.datasets[0].data = trendValues.slice(-10);
            }
            chartAnalyticsTrendInstance.update();
        }
    }

    // =========================================================================
    // 9. Table Rendering: Recent Table & Full History Table
    // =========================================================================
    let recentActiveFilter = 'all';
    let fullActiveFilter = 'all';
    let fullCategoryFilter = 'all';
    let fullSearchQuery = '';
    let fullSortOrder = 'date-desc';

    function buildTableRowHTML(t) {
        const amt = parseFloat(t.amount) || 0;
        const isIncome = t.type === 'income';
        const meta = getCategoryMeta(t.category, t.type);

        const amtClass = isIncome ? 'amt-income' : 'amt-expense';
        const sign = isIncome ? '+' : '-';
        const typeBadgeClass = isIncome ? 'income' : 'expense';
        const typeBadgeText = isIncome ? 'Income' : 'Expense';

        return `
            <tr data-id="${t.id}" data-type="${t.type}">
                <td>
                    <div class="tx-cell-title">
                        <span class="tx-cell-icon">${meta.icon}</span>
                        <div>
                            <div class="tx-name">${escapeHTML(t.title)}</div>
                            <div class="tx-merchant">${escapeHTML(t.merchant || 'General')}</div>
                        </div>
                    </div>
                </td>
                <td><span class="tx-tag ${meta.tagClass}">${escapeHTML(t.category)}</span></td>
                <td><span class="tx-badge-type ${typeBadgeClass}">${typeBadgeText}</span></td>
                <td>${escapeHTML(t.date || 'Today')}</td>
                <td class="tx-amt ${amtClass}">${sign}${formatMoney(amt)}</td>
                <td>
                    <div class="btn-tx-actions">
                        <button class="btn-tx-edit" data-id="${t.id}" title="Edit transaction" aria-label="Edit">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="btn-tx-del" data-id="${t.id}" title="Delete transaction" aria-label="Delete">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    function renderRecentTable() {
        const tbody = document.getElementById('recentTxTableBody');
        const emptyCard = document.getElementById('emptyStateRecent');
        const countBadge = document.getElementById('recentTxCountBadge');
        if (!tbody) return;

        let filtered = [...transactions];
        if (recentActiveFilter !== 'all') {
            filtered = filtered.filter(t => t.type === recentActiveFilter);
        }

        // Sort newest first
        filtered.sort((a, b) => new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp));

        const displayItems = filtered.slice(0, 6);

        if (countBadge) {
            countBadge.textContent = `${filtered.length} item${filtered.length !== 1 ? 's' : ''}`;
        }

        if (displayItems.length === 0) {
            tbody.innerHTML = '';
            if (emptyCard) emptyCard.classList.add('show');
            return;
        }

        if (emptyCard) emptyCard.classList.remove('show');
        tbody.innerHTML = displayItems.map(buildTableRowHTML).join('');
        bindTableActionButtons(tbody);
    }

    function renderFullTransactionsTable() {
        const tbody = document.getElementById('fullTxTableBody');
        const emptyCard = document.getElementById('emptyStateFull');
        if (!tbody) return;

        let list = [...transactions];

        // 1. Type Filter
        if (fullActiveFilter !== 'all') {
            list = list.filter(t => t.type === fullActiveFilter);
        }

        // 2. Category Filter
        if (fullCategoryFilter !== 'all') {
            list = list.filter(t => t.category === fullCategoryFilter);
        }

        // 3. Search Filter
        if (fullSearchQuery.trim() !== '') {
            const q = fullSearchQuery.toLowerCase().trim();
            list = list.filter(t => 
                (t.title || '').toLowerCase().includes(q) ||
                (t.merchant || '').toLowerCase().includes(q) ||
                (t.category || '').toLowerCase().includes(q)
            );
        }

        // 4. Sorting
        list.sort((a, b) => {
            const dateA = new Date(a.date || a.timestamp);
            const dateB = new Date(b.date || b.timestamp);
            const amtA = parseFloat(a.amount) || 0;
            const amtB = parseFloat(b.amount) || 0;

            if (fullSortOrder === 'date-desc') return dateB - dateA;
            if (fullSortOrder === 'date-asc') return dateA - dateB;
            if (fullSortOrder === 'amount-desc') return amtB - amtA;
            if (fullSortOrder === 'amount-asc') return amtA - amtB;
            return 0;
        });

        if (list.length === 0) {
            tbody.innerHTML = '';
            if (emptyCard) emptyCard.classList.add('show');
            return;
        }

        if (emptyCard) emptyCard.classList.remove('show');
        tbody.innerHTML = list.map(buildTableRowHTML).join('');
        bindTableActionButtons(tbody);
    }

    function renderAllTables() {
        renderRecentTable();
        renderFullTransactionsTable();
        renderAnalyticsView();
        renderBudgetPlanner();
        renderRewardsView();
    }

    function bindTableActionButtons(container) {
        // Edit Button Click -> Opens Edit Modal with prefilled values
        const editBtns = container.querySelectorAll('.btn-tx-edit');
        editBtns.forEach(btn => {
            btn.onclick = function (e) {
                e.stopPropagation();
                const id = this.getAttribute('data-id');
                openEditTransactionModal(id);
            };
        });

        // Delete Button Click -> Opens Delete Confirmation Dialog Modal
        const delBtns = container.querySelectorAll('.btn-tx-del');
        delBtns.forEach(btn => {
            btn.onclick = function (e) {
                e.stopPropagation();
                const id = this.getAttribute('data-id');
                openDeleteConfirmModal(id);
            };
        });
    }

    function escapeHTML(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // =========================================================================
    // 10. Unified Add & Edit Transaction Modal with Strict Validation
    // =========================================================================
    const txModal = document.getElementById('transactionModal');
    const closeTxModalBtn = document.getElementById('closeTxModalBtn');
    const txForm = document.getElementById('transactionForm');
    const txEditId = document.getElementById('txEditId');
    const txModalTitle = document.getElementById('txModalTitle');
    const txSubmitBtn = document.getElementById('txSubmitBtn');

    const btnTypeExpense = document.getElementById('btnTypeExpense');
    const btnTypeIncome = document.getElementById('btnTypeIncome');
    const txTitleInput = document.getElementById('txTitleInput');
    const txAmountInput = document.getElementById('txAmountInput');
    const txDateInput = document.getElementById('txDateInput');
    const txCategoryInput = document.getElementById('txCategoryInput');
    const txMerchantInput = document.getElementById('txMerchantInput');

    const txTitleError = document.getElementById('txTitleError');
    const txAmountError = document.getElementById('txAmountError');
    const txDateError = document.getElementById('txDateError');

    let currentSelectedType = 'expense';

    function populateCategoryDropdown(type, selectedCategory = '') {
        if (!txCategoryInput) return;
        const list = type === 'income' ? CATEGORIES.income : CATEGORIES.expense;
        txCategoryInput.innerHTML = list.map(c => 
            `<option value="${escapeHTML(c.name)}" ${c.name === selectedCategory ? 'selected' : ''}>${c.icon} ${escapeHTML(c.name)}</option>`
        ).join('');
    }

    function setTransactionType(type) {
        currentSelectedType = type;
        if (type === 'income') {
            btnTypeIncome.classList.add('active');
            btnTypeExpense.classList.remove('active');
        } else {
            btnTypeExpense.classList.add('active');
            btnTypeIncome.classList.remove('active');
        }
        populateCategoryDropdown(type, txCategoryInput.value);
    }

    if (btnTypeExpense) btnTypeExpense.addEventListener('click', () => setTransactionType('expense'));
    if (btnTypeIncome) btnTypeIncome.addEventListener('click', () => setTransactionType('income'));

    function openAddTransactionModal() {
        if (!txModal) return;
        txEditId.value = '';
        txModalTitle.textContent = 'Add Transaction';
        txSubmitBtn.innerHTML = '<span>Add Transaction</span>';
        
        txForm.reset();
        setTransactionType('expense');
        txDateInput.value = new Date().toISOString().split('T')[0];

        clearValidationErrors();
        txModal.classList.add('show');
        document.body.style.overflow = 'hidden';
        if (txTitleInput) txTitleInput.focus();
    }

    function openEditTransactionModal(id) {
        const item = transactions.find(t => String(t.id) === String(id));
        if (!item || !txModal) return;

        txEditId.value = item.id;
        txModalTitle.textContent = 'Edit Transaction';
        txSubmitBtn.innerHTML = '<span>Update Transaction</span>';

        txTitleInput.value = item.title || '';
        txAmountInput.value = item.amount || '';
        txDateInput.value = item.date || new Date().toISOString().split('T')[0];
        txMerchantInput.value = item.merchant || '';

        setTransactionType(item.type || 'expense');
        populateCategoryDropdown(item.type || 'expense', item.category);

        clearValidationErrors();
        txModal.classList.add('show');
        document.body.style.overflow = 'hidden';
        if (txTitleInput) txTitleInput.focus();
    }

    function closeTransactionModal() {
        if (txModal) {
            txModal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    if (closeTxModalBtn) closeTxModalBtn.addEventListener('click', closeTransactionModal);

    const btnOpenTxModal = document.getElementById('btnOpenTxModal');
    if (btnOpenTxModal) btnOpenTxModal.addEventListener('click', openAddTransactionModal);

    function clearValidationErrors() {
        if (txTitleError) { txTitleError.textContent = ''; txTitleError.classList.remove('show'); }
        if (txAmountError) { txAmountError.textContent = ''; txAmountError.classList.remove('show'); }
        if (txDateError) { txDateError.textContent = ''; txDateError.classList.remove('show'); }
    }

    // Form Submission: Add or Edit
    if (txForm) {
        txForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearValidationErrors();

            const title = txTitleInput.value.trim();
            const amount = parseFloat(txAmountInput.value);
            const date = txDateInput.value;
            const category = txCategoryInput.value;
            const merchant = txMerchantInput.value.trim();
            const isEdit = Boolean(txEditId.value);

            let hasError = false;

            // 1. Title validation
            if (!title) {
                if (txTitleError) {
                    txTitleError.textContent = 'Transaction title is required.';
                    txTitleError.classList.add('show');
                }
                hasError = true;
            }

            // 2. Amount validation
            if (isNaN(amount) || amount <= 0) {
                if (txAmountError) {
                    txAmountError.textContent = 'Please enter a valid amount greater than 0.';
                    txAmountError.classList.add('show');
                }
                hasError = true;
            }

            // 3. Date validation
            if (!date) {
                if (txDateError) {
                    txDateError.textContent = 'Please select a valid date.';
                    txDateError.classList.add('show');
                }
                hasError = true;
            }

            if (hasError) return;

            if (isEdit) {
                // Update Existing Transaction
                const index = transactions.findIndex(t => String(t.id) === String(txEditId.value));
                if (index !== -1) {
                    transactions[index] = {
                        ...transactions[index],
                        title,
                        amount,
                        type: currentSelectedType,
                        category,
                        date,
                        merchant
                    };
                    saveTransactions(transactions);
                    calculateTotals();
                    updateCharts();
                    renderAllTables();
                    closeTransactionModal();
                    showToast(`Transaction "${title}" updated successfully!`, 'success');
                    addNotification(`Updated transaction: ${title} (${currentSelectedType === 'income' ? '+' : '-'}$${amount.toFixed(2)})`, '✏️');
                }
            } else {
                // Add New Transaction
                const newTx = {
                    id: 'tx_' + Date.now(),
                    title,
                    amount,
                    type: currentSelectedType,
                    category,
                    date,
                    merchant,
                    timestamp: new Date().toISOString()
                };

                transactions.unshift(newTx);
                saveTransactions(transactions);
                calculateTotals();
                updateCharts();
                renderAllTables();
                closeTransactionModal();

                showToast(`Transaction "${title}" added successfully!`, 'success');
                const icon = currentSelectedType === 'income' ? '💵' : '💳';
                addNotification(`Added ${currentSelectedType}: ${title} (${currentSelectedType === 'income' ? '+' : '-'}$${amount.toFixed(2)})`, icon);
            }
        });
    }

    // =========================================================================
    // 11. Delete Confirmation Modal (Bonus Challenge)
    // =========================================================================
    const deleteModal = document.getElementById('deleteConfirmModal');
    const deleteConfirmText = document.getElementById('deleteConfirmText');
    const btnCancelDelete = document.getElementById('btnCancelDelete');
    const btnConfirmDelete = document.getElementById('btnConfirmDelete');
    let pendingDeleteId = null;

    function openDeleteConfirmModal(id) {
        const item = transactions.find(t => String(t.id) === String(id));
        if (!item || !deleteModal) return;

        pendingDeleteId = id;
        deleteConfirmText.innerHTML = `Are you sure you want to delete <strong>"${escapeHTML(item.title)}"</strong> (${item.type === 'income' ? '+' : '-'}$${parseFloat(item.amount).toFixed(2)})? This action will update your balance.`;
        deleteModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function closeDeleteModal() {
        if (deleteModal) {
            deleteModal.classList.remove('show');
            document.body.style.overflow = '';
        }
        pendingDeleteId = null;
    }

    if (btnCancelDelete) btnCancelDelete.addEventListener('click', closeDeleteModal);

    if (btnConfirmDelete) {
        btnConfirmDelete.addEventListener('click', () => {
            if (!pendingDeleteId) return;

            const deletedItem = transactions.find(t => String(t.id) === String(pendingDeleteId));
            transactions = transactions.filter(t => String(t.id) !== String(pendingDeleteId));
            saveTransactions(transactions);

            calculateTotals();
            updateCharts();
            renderAllTables();
            closeDeleteModal();

            if (deletedItem) {
                showToast(`Deleted transaction "${deletedItem.title}".`, 'info');
                addNotification(`Deleted transaction: ${deletedItem.title} ($${parseFloat(deletedItem.amount).toFixed(2)})`, '🗑️');
            }
        });
    }

    // =========================================================================
    // 12. Deposit Funds Modal & Quick Add Deposit
    // =========================================================================
    const addMoneyModal = document.getElementById('addMoneyModal');
    const closeAddMoneyBtn = document.getElementById('closeAddMoneyBtn');
    const addMoneyForm = document.getElementById('addMoneyForm');
    const customDepositInput = document.getElementById('customDepositAmount');
    const presetChips = document.querySelectorAll('.preset-chip');
    const payMethodItems = document.querySelectorAll('.payment-method-item');

    function openDepositModal() {
        if (addMoneyModal) {
            addMoneyModal.classList.add('show');
            document.body.style.overflow = 'hidden';
            if (customDepositInput) customDepositInput.focus();
        }
    }

    function closeDepositModal() {
        if (addMoneyModal) {
            addMoneyModal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    const btnOpenDepositModal = document.getElementById('btnOpenDepositModal');
    const btnQuickAddDeposit = document.getElementById('btnQuickAddDeposit');
    const addMoneyBtn = document.getElementById('addMoneyBtn');
    if (btnOpenDepositModal) btnOpenDepositModal.addEventListener('click', openDepositModal);
    if (btnQuickAddDeposit) btnQuickAddDeposit.addEventListener('click', openDepositModal);
    if (addMoneyBtn) addMoneyBtn.addEventListener('click', openDepositModal);
    if (closeAddMoneyBtn) closeAddMoneyBtn.addEventListener('click', closeDepositModal);

    presetChips.forEach(chip => {
        chip.addEventListener('click', () => {
            presetChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            if (customDepositInput) {
                customDepositInput.value = parseFloat(chip.dataset.amount).toFixed(2);
            }
        });
    });

    payMethodItems.forEach(item => {
        item.addEventListener('click', () => {
            payMethodItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            const radio = item.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
        });
    });

    if (addMoneyForm) {
        addMoneyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const amount = parseFloat(customDepositInput ? customDepositInput.value : 0);
            if (isNaN(amount) || amount <= 0) {
                showToast('Please enter a valid deposit amount.', 'warning');
                return;
            }

            const selectedMethod = document.querySelector('input[name="payMethod"]:checked');
            const methodName = selectedMethod ? selectedMethod.value : 'Visa •• 8429';

            // Creates an Income transaction with category 'Deposit'
            const depositTx = {
                id: 'tx_dep_' + Date.now(),
                title: 'Wallet Deposit',
                merchant: methodName,
                category: 'Deposit',
                type: 'income',
                amount: amount,
                date: new Date().toISOString().split('T')[0],
                timestamp: new Date().toISOString()
            };

            transactions.unshift(depositTx);
            saveTransactions(transactions);

            calculateTotals();
            updateCharts();
            renderAllTables();
            closeDepositModal();

            showToast(`+$${amount.toFixed(2)} deposited into your balance via ${methodName}!`, 'success');
            addNotification(`💰 Deposited $${amount.toFixed(2)} via ${methodName}`, '💰');
        });
    }

    // =========================================================================
    // 13. Withdraw Funds Modal
    // =========================================================================
    const withdrawModal = document.getElementById('withdrawMoneyModal');
    const closeWithdrawBtn = document.getElementById('closeWithdrawBtn');
    const withdrawForm = document.getElementById('withdrawMoneyForm');
    const withdrawAmountInput = document.getElementById('withdrawAmountInput');
    const withdrawDestSelect = document.getElementById('withdrawDestinationSelect');
    const btnQuickWithdraw = document.getElementById('btnQuickWithdraw');

    function openWithdrawModal() {
        if (withdrawModal) {
            withdrawModal.classList.add('show');
            document.body.style.overflow = 'hidden';
            if (withdrawAmountInput) withdrawAmountInput.focus();
        }
    }

    function closeWithdrawModal() {
        if (withdrawModal) {
            withdrawModal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    if (btnQuickWithdraw) btnQuickWithdraw.addEventListener('click', openWithdrawModal);
    if (closeWithdrawBtn) closeWithdrawBtn.addEventListener('click', closeWithdrawModal);

    if (withdrawForm) {
        withdrawForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const amount = parseFloat(withdrawAmountInput ? withdrawAmountInput.value : 0);
            if (isNaN(amount) || amount <= 0) {
                showToast('Please enter a valid withdrawal amount.', 'warning');
                return;
            }

            const { currentBalance } = calculateTotals();
            if (amount > currentBalance) {
                showToast(`Insufficient balance! Your current balance is ${formatMoney(currentBalance)}.`, 'warning');
                return;
            }

            const destination = withdrawDestSelect ? withdrawDestSelect.value : 'Bank Account';

            // Creates an Expense transaction with category 'Withdrawal'
            const withdrawTx = {
                id: 'tx_wdr_' + Date.now(),
                title: 'Funds Withdrawal',
                merchant: destination,
                category: 'Withdrawal',
                type: 'expense',
                amount: amount,
                date: new Date().toISOString().split('T')[0],
                timestamp: new Date().toISOString()
            };

            transactions.unshift(withdrawTx);
            saveTransactions(transactions);

            calculateTotals();
            updateCharts();
            renderAllTables();
            closeWithdrawModal();

            showToast(`-$${amount.toFixed(2)} withdrawn to ${destination}!`, 'success');
            addNotification(`🏧 Withdrew $${amount.toFixed(2)} to ${destination}`, '🏧');
        });
    }

    // =========================================================================
    // 14. Quick Transfer Simulation Form
    // =========================================================================
    const quickTransferForm = document.getElementById('quickTransferForm');
    if (quickTransferForm) {
        quickTransferForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const recipient = document.getElementById('transferRecipient').value.trim();
            const amount = parseFloat(document.getElementById('transferAmount').value);
            const note = document.getElementById('transferNote').value.trim();

            if (!recipient || isNaN(amount) || amount <= 0) {
                showToast('Please enter a valid recipient and transfer amount.', 'warning');
                return;
            }

            const { currentBalance } = calculateTotals();
            if (amount > currentBalance) {
                showToast(`Insufficient balance for transfer! (Available: ${formatMoney(currentBalance)})`, 'warning');
                return;
            }

            const transferTx = {
                id: 'tx_xfer_' + Date.now(),
                title: `Transfer to ${recipient}`,
                merchant: note || 'Peer Transfer',
                category: 'Other',
                type: 'expense',
                amount: amount,
                date: new Date().toISOString().split('T')[0],
                timestamp: new Date().toISOString()
            };

            transactions.unshift(transferTx);
            saveTransactions(transactions);

            calculateTotals();
            updateCharts();
            renderAllTables();

            quickTransferForm.reset();
            showToast(`Successfully transferred $${amount.toFixed(2)} to ${recipient}!`, 'success');
            addNotification(`💸 Transferred $${amount.toFixed(2)} to ${recipient}`, '💸');
        });
    }

    // =========================================================================
    // 15. Invoices & Recurring Bills Manager (Pay Bill Action & 5-Min Vanish)
    // =========================================================================
    const billsContainer = document.getElementById('billsListContainer');
    const addBillModal = document.getElementById('addBillModal');
    const closeAddBillBtn = document.getElementById('closeAddBillBtn');
    const btnOpenAddBillModal = document.getElementById('btnOpenAddBillModal');
    const addBillForm = document.getElementById('addBillForm');
    const activeBillVanishTimers = {};

    function scheduleBillVanish(billId, delayMs) {
        if (activeBillVanishTimers[billId]) {
            clearTimeout(activeBillVanishTimers[billId]);
        }
        activeBillVanishTimers[billId] = setTimeout(() => {
            removeBillWithAnimation(billId);
            delete activeBillVanishTimers[billId];
        }, Math.max(100, delayMs));
    }

    function removeBillWithAnimation(billId) {
        const card = document.querySelector(`.bill-card[data-id="${billId}"]`);
        const billObj = bills.find(b => b.id === billId);
        const billName = billObj ? billObj.name : 'Bill';

        if (card) {
            card.classList.add('vanish');
            setTimeout(() => {
                bills = bills.filter(b => b.id !== billId);
                saveBills(bills);
                renderBills();
                showToast(`Paid bill "${billName}" has vanished from active invoices.`, 'info');
            }, 550);
        } else {
            bills = bills.filter(b => b.id !== billId);
            saveBills(bills);
            renderBills();
        }
    }

    function renderBills() {
        if (!billsContainer) return;

        // Auto-purge bills that exceeded 5 minutes
        const now = Date.now();
        bills = bills.filter(b => {
            if (b.status === 'Paid' && b.paidAt && (now - b.paidAt >= BILL_VANISH_MS)) {
                return false;
            }
            return true;
        });
        saveBills(bills);

        if (bills.length === 0) {
            billsContainer.innerHTML = `
                <div class="empty-state-card show" style="grid-column: 1/-1;">
                    <div class="empty-icon">🧾</div>
                    <h4 class="empty-title">No upcoming bills</h4>
                    <p class="empty-sub">All bills are settled! Add new recurring bills anytime.</p>
                </div>
            `;
            return;
        }

        billsContainer.innerHTML = bills.map(bill => {
            const isPaid = bill.status === 'Paid';
            const btnClass = isPaid ? 'btn-pay-bill paid' : 'btn-pay-bill';
            let btnText = isPaid ? '✓ Paid' : `Pay ${formatMoney(bill.amount)}`;
            let statusText = bill.status;
            let statusClass = isPaid ? 'safe' : 'danger';

            if (isPaid && bill.paidAt) {
                const remainingSec = Math.max(0, Math.round((BILL_VANISH_MS - (Date.now() - bill.paidAt)) / 1000));
                const remainingMin = Math.ceil(remainingSec / 60);
                statusText = `Paid (Vanishes in ${remainingMin}m)`;
                btnText = '✓ Paid (Settled)';
            }

            return `
                <div class="bill-card ${isPaid ? 'paid' : ''}" data-id="${bill.id}">
                    <div class="bill-card-top">
                        <div class="bill-icon-title">
                            <span class="bill-icon">${bill.icon || '🧾'}</span>
                            <div>
                                <div class="bill-name">${escapeHTML(bill.name)}</div>
                                <div class="bill-cat">${escapeHTML(bill.category)}</div>
                            </div>
                        </div>
                        <span class="budget-status-pill ${statusClass}">${statusText}</span>
                    </div>

                    <div class="bill-amount-due">
                        <div class="bill-amount">${formatMoney(bill.amount)}</div>
                        <div class="bill-due">${isPaid ? 'Settled' : `Due: ${bill.dueDate}`}</div>
                    </div>

                    <button class="${btnClass}" data-id="${bill.id}" ${isPaid ? 'disabled' : ''}>
                        <span>${btnText}</span>
                    </button>
                </div>
            `;
        }).join('');

        // Schedule vanish timers for any currently paid bills
        bills.forEach(bill => {
            if (bill.status === 'Paid' && bill.paidAt) {
                const elapsed = Date.now() - bill.paidAt;
                const remaining = BILL_VANISH_MS - elapsed;
                if (remaining > 0) {
                    scheduleBillVanish(bill.id, remaining);
                } else {
                    removeBillWithAnimation(bill.id);
                }
            }
        });

        // Bind Pay Bill button
        const payBtns = billsContainer.querySelectorAll('.btn-pay-bill:not(.paid)');
        payBtns.forEach(btn => {
            btn.onclick = function () {
                const id = this.getAttribute('data-id');
                payBill(id);
            };
        });
    }

    function payBill(id) {
        const bill = bills.find(b => b.id === id);
        if (!bill || bill.status === 'Paid') return;

        // 1. Mark bill as paid with timestamp
        bill.status = 'Paid';
        bill.paidAt = Date.now();
        saveBills(bills);

        // Schedule auto-vanish in 5 minutes (300,000 ms)
        scheduleBillVanish(bill.id, BILL_VANISH_MS);

        // 2. Automatically record as Expense in transactions!
        const billTx = {
            id: 'tx_bill_' + Date.now(),
            title: bill.name,
            merchant: 'Recurring Bill',
            category: bill.category || 'Housing & Utilities',
            type: 'expense',
            amount: parseFloat(bill.amount) || 0,
            date: new Date().toISOString().split('T')[0],
            timestamp: new Date().toISOString()
        };

        transactions.unshift(billTx);
        saveTransactions(transactions);

        calculateTotals();
        updateCharts();
        renderAllTables();
        renderBills();

        showToast(`Bill "${bill.name}" paid successfully! Will vanish in 5 minutes.`, 'success');
        addNotification(`🧾 Paid bill: ${bill.name} (${formatMoney(bill.amount)}) - Archiving in 5m`, '🧾');
    }

    if (btnOpenAddBillModal) {
        btnOpenAddBillModal.addEventListener('click', () => {
            if (addBillModal) {
                addBillModal.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
        });
    }

    if (closeAddBillBtn && addBillModal) {
        closeAddBillBtn.addEventListener('click', () => {
            addBillModal.classList.remove('show');
            document.body.style.overflow = '';
        });
    }

    if (addBillForm) {
        addBillForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('billNameInput').value.trim();
            const amount = parseFloat(document.getElementById('billAmountInput').value);
            const dueDate = document.getElementById('billDueDateInput').value;
            const category = document.getElementById('billCategorySelect').value;

            if (!name || isNaN(amount) || amount <= 0 || !dueDate) {
                showToast('Please fill all bill fields with valid data.', 'warning');
                return;
            }

            const newBill = {
                id: 'bill_' + Date.now(),
                name,
                amount,
                dueDate,
                category,
                status: 'Unpaid',
                icon: category.includes('Entertainment') ? '🎬' : '⚡'
            };

            bills.unshift(newBill);
            saveBills(bills);
            renderBills();

            addBillForm.reset();
            addBillModal.classList.remove('show');
            document.body.style.overflow = '';

            showToast(`Recurring bill "${name}" added!`, 'success');
            addNotification(`Added recurring bill: ${name} (${formatMoney(amount)})`, '📋');
        });
    }

    // =========================================================================
    // 16. Category Budget Planner Module
    // =========================================================================
    const budgetGrid = document.getElementById('budgetCardsGrid');
    const setBudgetModal = document.getElementById('setBudgetModal');
    const closeBudgetModalBtn = document.getElementById('closeBudgetModalBtn');
    const btnOpenSetBudgetModal = document.getElementById('btnOpenSetBudgetModal');
    const setBudgetForm = document.getElementById('setBudgetForm');

    function renderBudgetPlanner() {
        if (!budgetGrid) return;

        // Calculate actual spend per category this month
        const categorySpend = {};
        transactions.forEach(t => {
            if (t.type === 'expense') {
                const cat = t.category || 'Other';
                categorySpend[cat] = (categorySpend[cat] || 0) + (parseFloat(t.amount) || 0);
            }
        });

        const catNames = Object.keys(budgets);

        budgetGrid.innerHTML = catNames.map(cat => {
            const limit = budgets[cat] || 100;
            const spent = categorySpend[cat] || 0;
            const remaining = limit - spent;
            const pct = Math.min(100, Math.round((spent / limit) * 100));

            let statusPillClass = 'safe';
            let statusText = 'On Track';
            let barFillClass = 'safe';

            if (pct >= 100) {
                statusPillClass = 'danger';
                statusText = 'Over Budget';
                barFillClass = 'danger';
            } else if (pct >= 75) {
                statusPillClass = 'warn';
                statusText = `${100 - pct}% Left`;
                barFillClass = 'warn';
            }

            const meta = getCategoryMeta(cat, 'expense');

            return `
                <div class="budget-card">
                    <div class="budget-card-header">
                        <div class="budget-cat-left">
                            <span class="budget-cat-icon">${meta.icon}</span>
                            <span class="budget-cat-title">${escapeHTML(cat)}</span>
                        </div>
                        <span class="budget-status-pill ${statusPillClass}">${statusText}</span>
                    </div>

                    <div class="budget-amounts-row">
                        <div class="budget-spent-txt">${formatMoney(spent)}</div>
                        <div class="budget-limit-txt">Limit: ${formatMoney(limit)}</div>
                    </div>

                    <div class="budget-bar-wrap">
                        <div class="budget-bar-fill ${barFillClass}" style="width: ${pct}%;"></div>
                    </div>

                    <div class="budget-remaining-txt">
                        ${remaining >= 0 ? `${formatMoney(remaining)} remaining` : `Exceeded by ${formatMoney(Math.abs(remaining))}`}
                    </div>
                </div>
            `;
        }).join('');
    }

    if (btnOpenSetBudgetModal) {
        btnOpenSetBudgetModal.addEventListener('click', () => {
            if (setBudgetModal) {
                setBudgetModal.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
        });
    }

    if (closeBudgetModalBtn && setBudgetModal) {
        closeBudgetModalBtn.addEventListener('click', () => {
            setBudgetModal.classList.remove('show');
            document.body.style.overflow = '';
        });
    }

    if (setBudgetForm) {
        setBudgetForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const cat = document.getElementById('budgetCategorySelect').value;
            const limit = parseFloat(document.getElementById('budgetLimitInput').value);

            if (isNaN(limit) || limit <= 0) {
                showToast('Please enter a valid monthly budget limit.', 'warning');
                return;
            }

            budgets[cat] = limit;
            saveBudgets(budgets);
            renderBudgetPlanner();

            setBudgetModal.classList.remove('show');
            document.body.style.overflow = '';

            showToast(`Budget for ${cat} set to $${limit.toFixed(2)}!`, 'success');
            addNotification(`Set budget for ${cat}: $${limit.toFixed(2)}/mo`, '🎯');
        });
    }

    // =========================================================================
    // 17. Analytics View Details & Statistical Insights
    // =========================================================================
    function renderAnalyticsView() {
        const elHighest = document.getElementById('statHighestExpense');
        const elHighestName = document.getElementById('statHighestExpenseName');
        const elAvg = document.getElementById('statAvgSpend');
        const elTopCat = document.getElementById('statTopCategory');
        const elTopCatAmt = document.getElementById('statTopCategoryAmt');
        const elNetSavings = document.getElementById('statNetSavings');
        const categoryTableBody = document.getElementById('analyticsCategoryBody');

        const expenses = transactions.filter(t => t.type === 'expense');
        const { currentBalance, totalExpense } = calculateTotals();

        // 1. Highest Expense
        if (expenses.length > 0) {
            const sorted = [...expenses].sort((a, b) => (parseFloat(b.amount) || 0) - (parseFloat(a.amount) || 0));
            const top = sorted[0];
            if (elHighest) elHighest.textContent = formatMoney(top.amount);
            if (elHighestName) elHighestName.textContent = top.title || 'Expense';
        } else {
            if (elHighest) elHighest.textContent = '$0.00';
            if (elHighestName) elHighestName.textContent = 'No expenses recorded';
        }

        // 2. Average Transaction Amount
        if (transactions.length > 0) {
            const totalSum = transactions.reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);
            const avg = totalSum / transactions.length;
            if (elAvg) elAvg.textContent = formatMoney(avg);
        } else {
            if (elAvg) elAvg.textContent = '$0.00';
        }

        // 3. Top Spending Category
        const catMap = {};
        const catCount = {};
        expenses.forEach(t => {
            const c = t.category || 'Other';
            catMap[c] = (catMap[c] || 0) + (parseFloat(t.amount) || 0);
            catCount[c] = (catCount[c] || 0) + 1;
        });

        const sortedCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
        if (sortedCats.length > 0) {
            if (elTopCat) elTopCat.textContent = sortedCats[0][0];
            if (elTopCatAmt) elTopCatAmt.textContent = `${formatMoney(sortedCats[0][1])} spent`;
        } else {
            if (elTopCat) elTopCat.textContent = '-';
            if (elTopCatAmt) elTopCatAmt.textContent = '$0.00 spent';
        }

        if (elNetSavings) elNetSavings.textContent = formatMoney(currentBalance);

        // 4. Category Breakdown Table
        if (categoryTableBody) {
            if (sortedCats.length === 0) {
                categoryTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #94A3B8; padding: 20px;">No expense categories recorded yet.</td></tr>`;
            } else {
                categoryTableBody.innerHTML = sortedCats.map(([catName, spent]) => {
                    const pct = totalExpense > 0 ? Math.round((spent / totalExpense) * 100) : 0;
                    const meta = getCategoryMeta(catName, 'expense');
                    const count = catCount[catName] || 1;

                    return `
                        <tr>
                            <td>
                                <div class="tx-cell-title">
                                    <span class="tx-cell-icon">${meta.icon}</span>
                                    <span class="tx-name">${escapeHTML(catName)}</span>
                                </div>
                            </td>
                            <td>${count} transaction${count !== 1 ? 's' : ''}</td>
                            <td class="tx-amt amt-expense">${formatMoney(spent)}</td>
                            <td><strong>${pct}%</strong> of total</td>
                        </tr>
                    `;
                }).join('');
            }
        }
    }

    // =========================================================================
    // 18. Gamified Rewards & Financial Badges Module
    // =========================================================================
    function renderRewardsView() {
        const rewardsContainer = document.getElementById('rewardsBadgesGrid');
        if (!rewardsContainer) return;

        const { currentBalance, savingsRate } = calculateTotals();
        const txCount = transactions.length;

        const BADGES = [
            {
                id: 'badge_starter',
                icon: '🌟',
                name: 'First Step',
                desc: 'Record your very first financial transaction in the tracker.',
                unlocked: txCount >= 1
            },
            {
                id: 'badge_tracker',
                icon: '📈',
                name: 'Active Tracker',
                desc: 'Log at least 5 different income or expense transactions.',
                unlocked: txCount >= 5
            },
            {
                id: 'badge_century',
                icon: '💰',
                name: 'Century Club',
                desc: 'Maintain a net wallet balance of $1,000 or greater.',
                unlocked: currentBalance >= 1000
            },
            {
                id: 'badge_saver',
                icon: '💎',
                name: 'Super Saver',
                desc: 'Achieve a savings rate of 50% or higher this month.',
                unlocked: savingsRate >= 50 && txCount > 0
            },
            {
                id: 'badge_guardian',
                icon: '🛡️',
                name: 'Budget Guardian',
                desc: 'Set custom spending limits for your monthly categories.',
                unlocked: Object.keys(budgets).length > 0
            }
        ];

        rewardsContainer.innerHTML = BADGES.map(b => {
            const cardClass = b.unlocked ? 'reward-badge-card unlocked' : 'reward-badge-card';
            const pillClass = b.unlocked ? 'reward-status-pill unlocked' : 'reward-status-pill locked';
            const pillText = b.unlocked ? '🏆 Unlocked' : '🔒 Locked';

            return `
                <div class="${cardClass}">
                    <div class="reward-icon-wrap">${b.icon}</div>
                    <div class="reward-name">${b.name}</div>
                    <div class="reward-desc">${b.desc}</div>
                    <span class="${pillClass}">${pillText}</span>
                </div>
            `;
        }).join('');
    }

    // =========================================================================
    // 19. Multi-View Tab Navigation (Sidebar Navigation)
    // =========================================================================
    const viewContainers = document.querySelectorAll('.app-view');
    const navLinksWithView = document.querySelectorAll('.nav-link[data-view]');

    function switchView(targetViewId) {
        viewContainers.forEach(view => {
            if (view.id === `view${capitalize(targetViewId)}`) {
                view.classList.add('active');
            } else {
                view.classList.remove('active');
            }
        });

        navLinksWithView.forEach(link => {
            if (link.getAttribute('data-view') === targetViewId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Trigger chart resize & redraw if charts view activated
        if (targetViewId === 'dashboard' || targetViewId === 'analytics') {
            setTimeout(updateCharts, 50);
        }

        if (targetViewId === 'budget') renderBudgetPlanner();
        if (targetViewId === 'invoices') renderBills();
        if (targetViewId === 'rewards') renderRewardsView();

        if (isMobile()) {
            closeMobileSidebar();
        }
    }

    function capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    navLinksWithView.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewName = link.getAttribute('data-view');
            if (viewName) switchView(viewName);
        });
    });

    const btnViewAllTxLink = document.getElementById('btnViewAllTxLink');
    if (btnViewAllTxLink) {
        btnViewAllTxLink.addEventListener('click', () => switchView('transactions'));
    }

    // =========================================================================
    // 20. Filters & Search Handlers
    // =========================================================================
    // 1. Recent table filter tabs
    const recentFilterTabs = document.querySelectorAll('#recentFilterTabs .filter-tab');
    recentFilterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            recentFilterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            recentActiveFilter = tab.dataset.filter || 'all';
            renderRecentTable();
        });
    });

    // 2. Full table type filter tabs
    const fullFilterTabs = document.querySelectorAll('#fullTxFilterTabs .filter-tab');
    fullFilterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            fullFilterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            fullActiveFilter = tab.dataset.filter || 'all';
            renderFullTransactionsTable();
        });
    });

    // 3. Full table search
    const txFullSearchInput = document.getElementById('txFullSearchInput');
    if (txFullSearchInput) {
        txFullSearchInput.addEventListener('input', function () {
            fullSearchQuery = this.value;
            renderFullTransactionsTable();
        });
    }

    // 4. Header top global search bar
    const topSearchInput = document.querySelector('.search-input');
    if (topSearchInput) {
        topSearchInput.addEventListener('input', function () {
            fullSearchQuery = this.value;
            switchView('transactions');
            if (txFullSearchInput) txFullSearchInput.value = this.value;
            renderFullTransactionsTable();
        });
    }

    // 5. Category select filter
    const txCategorySelectFilter = document.getElementById('txCategorySelectFilter');
    if (txCategorySelectFilter) {
        txCategorySelectFilter.addEventListener('change', function () {
            fullCategoryFilter = this.value;
            renderFullTransactionsTable();
        });
    }

    // 6. Sort select
    const txSortSelect = document.getElementById('txSortSelect');
    if (txSortSelect) {
        txSortSelect.addEventListener('change', function () {
            fullSortOrder = this.value;
            renderFullTransactionsTable();
        });
    }

    // =========================================================================
    // 21. Notifications Dropdown & Mark Read
    // =========================================================================
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');
    const notificationDot = document.getElementById('notificationDot');
    const notifCountBadge = document.getElementById('notifCountBadge');
    const notifListEl = document.getElementById('notifList');
    const btnMarkAllRead = document.getElementById('btnMarkAllRead');

    function renderNotifications() {
        if (!notifListEl) return;
        const notifs = loadNotifications();
        const unreadCount = notifs.filter(n => n.unread).length;

        if (notifCountBadge) notifCountBadge.textContent = `${unreadCount} New`;
        if (notificationDot) notificationDot.style.display = unreadCount > 0 ? 'block' : 'none';

        if (notifs.length === 0) {
            notifListEl.innerHTML = `<div style="text-align: center; color: #94A3B8; font-size: 12px; padding: 16px;">No notifications.</div>`;
            return;
        }

        notifListEl.innerHTML = notifs.map(n => `
            <div class="notif-item ${n.unread ? 'unread' : 'read'}" data-id="${n.id}">
                <div class="notif-icon">${n.icon}</div>
                <div class="notif-body">
                    <div class="notif-text">${escapeHTML(n.text)}</div>
                    <div class="notif-time">${n.time}</div>
                </div>
            </div>
        `).join('');

        // Clicking individual item marks read
        const items = notifListEl.querySelectorAll('.notif-item.unread');
        items.forEach(el => {
            el.onclick = function () {
                const id = this.dataset.id;
                const notifs = loadNotifications();
                const target = notifs.find(n => n.id === id);
                if (target) {
                    target.unread = false;
                    saveNotifications(notifs);
                    renderNotifications();
                }
            };
        });
    }

    function closeNotificationDropdown() {
        if (notificationDropdown) notificationDropdown.classList.remove('show');
    }

    if (notificationBtn && notificationDropdown) {
        notificationBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationDropdown.classList.toggle('show');
            closeColorPopover();
            if (userDropdownMenu) userDropdownMenu.classList.remove('show');
        });

        document.addEventListener('click', (e) => {
            if (!notificationDropdown.contains(e.target) && !notificationBtn.contains(e.target)) {
                closeNotificationDropdown();
            }
        });
    }

    if (btnMarkAllRead) {
        btnMarkAllRead.addEventListener('click', () => {
            const notifs = loadNotifications();
            notifs.forEach(n => n.unread = false);
            saveNotifications(notifs);
            renderNotifications();
            showToast('All notifications marked as read.', 'success');
        });
    }

    // =========================================================================
    // 22. CSV Report Statement Export
    // =========================================================================
    const btnExportReport = document.getElementById('btnExportReport');
    if (btnExportReport) {
        btnExportReport.addEventListener('click', () => {
            if (transactions.length === 0) {
                showToast('No transactions to export.', 'warning');
                return;
            }

            let csv = "ID,Title,Merchant,Category,Type,Date,Amount\n";
            transactions.forEach(t => {
                csv += `"${t.id}","${(t.title || '').replace(/"/g, '""')}","${(t.merchant || '').replace(/"/g, '""')}","${t.category}","${t.type}","${t.date}","${t.amount}"\n`;
            });

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ExpenseTracker_${CURRENT_USER}_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showToast('Statement exported as CSV successfully!', 'success');
        });
    }

    // =========================================================================
    // 23. Pro Plan Modal
    // =========================================================================
    const proUpgradeBtn = document.getElementById('proUpgradeBtn');
    const proUpgradeModal = document.getElementById('proUpgradeModal');
    const closeProModalBtn = document.getElementById('closeProModalBtn');
    const btnStartTrial = document.getElementById('btnStartTrial');

    if (proUpgradeBtn && proUpgradeModal) {
        proUpgradeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            proUpgradeModal.classList.add('show');
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeProModalBtn && proUpgradeModal) {
        closeProModalBtn.addEventListener('click', () => {
            proUpgradeModal.classList.remove('show');
            document.body.style.overflow = '';
        });
    }

    if (btnStartTrial && proUpgradeModal) {
        btnStartTrial.addEventListener('click', () => {
            proUpgradeModal.classList.remove('show');
            document.body.style.overflow = '';
            showToast('👑 Congratulations! Your 14-day Pro Free Trial has been activated!', 'success');
            addNotification('👑 Activated 14-day Pro Free Trial membership', '👑');
        });
    }

    // =========================================================================
    // 24. Sidebar Desktop Toggle & Mobile Drawer
    // =========================================================================
    const sidebar = document.getElementById('sidebar');
    const mainWrapper = document.getElementById('mainWrapper');
    const collapseBtn = document.getElementById('collapseBtn');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebarBackdrop = document.getElementById('sidebarBackdrop');
    const closeSidebarMobileBtn = document.getElementById('closeSidebarMobileBtn');

    function isMobile() {
        return window.innerWidth <= 768;
    }

    function resizeAllCharts() {
        try {
            if (chartIncomeExpenseInstance) chartIncomeExpenseInstance.resize();
            if (chartCategoryDonutInstance) chartCategoryDonutInstance.resize();
            if (chartAnalyticsTrendInstance) chartAnalyticsTrendInstance.resize();
            if (chartAnalyticsDonutInstance) chartAnalyticsDonutInstance.resize();
        } catch (err) {
            console.debug("Chart resize error:", err);
        }
    }

    function toggleDesktopSidebar() {
        if (isMobile()) {
            closeMobileSidebar();
            return;
        }
        const isExpanded = sidebar.classList.toggle('expanded');
        mainWrapper.classList.toggle('sidebar-expanded', isExpanded);
        localStorage.setItem('sidebar_expanded', isExpanded ? 'true' : 'false');
        closeColorPopover();

        // Smoothly resize charts during and after CSS transition
        resizeAllCharts();
        setTimeout(resizeAllCharts, 160);
        setTimeout(() => {
            resizeAllCharts();
            window.dispatchEvent(new Event('resize'));
        }, 320);
    }

    function openMobileSidebar() {
        if (!sidebar) return;
        sidebar.classList.add('mobile-open');
        if (sidebarBackdrop) sidebarBackdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileSidebar() {
        if (!sidebar) return;
        sidebar.classList.remove('mobile-open');
        if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
        document.body.style.overflow = '';
        closeColorPopover();
    }

    if (collapseBtn) {
        collapseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isMobile()) closeMobileSidebar();
            else toggleDesktopSidebar();
        });
    }

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (sidebar.classList.contains('mobile-open')) closeMobileSidebar();
            else openMobileSidebar();
        });
    }

    if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeMobileSidebar);
    if (closeSidebarMobileBtn) closeSidebarMobileBtn.addEventListener('click', closeMobileSidebar);

    if (!isMobile() && localStorage.getItem('sidebar_expanded') === 'true') {
        if (sidebar) sidebar.classList.add('expanded');
        if (mainWrapper) mainWrapper.classList.add('sidebar-expanded');
    }

    if (mainWrapper) {
        mainWrapper.addEventListener('transitionend', (e) => {
            if (e.propertyName === 'margin-left') {
                resizeAllCharts();
            }
        });
    }

    window.addEventListener('resize', () => {
        if (!isMobile()) {
            if (sidebar) sidebar.classList.remove('mobile-open');
            if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
            document.body.style.overflow = '';
            const wasExpanded = localStorage.getItem('sidebar_expanded') === 'true';
            if (sidebar) sidebar.classList.toggle('expanded', wasExpanded);
            if (mainWrapper) mainWrapper.classList.toggle('sidebar-expanded', wasExpanded);
        }
        resizeAllCharts();
        closeColorPopover();
    });

    // =========================================================================
    // 25. 5-Color Theme Selector (Dark Red, Blue, Green, Purple, Orange)
    // =========================================================================
    const colorPaletteBtn = document.getElementById('colorPaletteBtn');
    const colorPalettePopover = document.getElementById('colorPalettePopover');
    const allColorSwatches = document.querySelectorAll('.color-swatch-btn');
    const colorStatusDot = document.querySelector('.color-status-dot');

    function openColorPopover() {
        if (!colorPaletteBtn || !colorPalettePopover) return;

        if (isMobile() || (sidebar && sidebar.classList.contains('mobile-open'))) {
            colorPalettePopover.style.top = '';
            colorPalettePopover.style.left = '';
            colorPalettePopover.classList.add('show');
            return;
        }

        const rect = colorPaletteBtn.getBoundingClientRect();
        const popoverWidth = 220;
        const popoverHeight = 70;

        let top = rect.top + (rect.height / 2) - (popoverHeight / 2);
        let left = rect.right + 12;

        if (top + popoverHeight > window.innerHeight) top = window.innerHeight - popoverHeight - 16;
        if (top < 10) top = 10;

        colorPalettePopover.style.top = `${top}px`;
        colorPalettePopover.style.left = `${left}px`;
        colorPalettePopover.classList.add('show');
    }

    function closeColorPopover() {
        if (colorPalettePopover) colorPalettePopover.classList.remove('show');
    }

    if (colorPaletteBtn) {
        colorPaletteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (colorPalettePopover && colorPalettePopover.classList.contains('show')) {
                closeColorPopover();
            } else {
                openColorPopover();
            }
        });
    }

    function setColorTheme(colorName) {
        document.documentElement.setAttribute('data-color', colorName);
        localStorage.setItem('expense_theme_color', colorName);

        allColorSwatches.forEach(btn => {
            if (btn.getAttribute('data-color') === colorName) btn.classList.add('active');
            else btn.classList.remove('active');
        });

        if (colorStatusDot) {
            const colorMap = {
                'dark-red': '#B91C1C',
                'blue': '#2563EB',
                'green': '#059669',
                'purple': '#7C3AED',
                'orange': '#EA580C'
            };
            colorStatusDot.style.backgroundColor = colorMap[colorName] || '#2563EB';
        }

        setTimeout(closeColorPopover, 160);
    }

    allColorSwatches.forEach(swatch => {
        swatch.addEventListener('click', (e) => {
            e.stopPropagation();
            setColorTheme(swatch.getAttribute('data-color'));
        });
    });

    const savedColor = localStorage.getItem('expense_theme_color') || 'blue';
    setColorTheme(savedColor);

    // =========================================================================
    // 26. Light / Dark Mode Switcher
    // =========================================================================
    const btnLight = document.getElementById('btnLightMode');
    const btnDark = document.getElementById('btnDarkMode');

    function setTheme(mode) {
        if (mode === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            if (btnDark) btnDark.classList.add('active');
            if (btnLight) btnLight.classList.remove('active');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            if (btnLight) btnLight.classList.add('active');
            if (btnDark) btnDark.classList.remove('active');
            localStorage.setItem('theme', 'light');
        }
        // Update charts with dark/light themes
        setTimeout(updateCharts, 50);
    }

    if (btnLight) btnLight.addEventListener('click', () => setTheme('light'));
    if (btnDark) btnDark.addEventListener('click', () => setTheme('dark'));

    if (localStorage.getItem('theme') === 'dark') setTheme('dark');

    // =========================================================================
    // 27. User Account Dropdown in Top Header
    // =========================================================================
    const headerAvatarBtn = document.getElementById('headerAvatarBtn');
    const userDropdownMenu = document.getElementById('userDropdownMenu');

    if (headerAvatarBtn && userDropdownMenu) {
        headerAvatarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdownMenu.classList.toggle('show');
            closeColorPopover();
            closeNotificationDropdown();
        });

        document.addEventListener('click', (e) => {
            if (!userDropdownMenu.contains(e.target) && !headerAvatarBtn.contains(e.target)) {
                userDropdownMenu.classList.remove('show');
            }
        });
    }

    // =========================================================================
    // 28. Escape Key Global Listener (Closes Any Open Modal / Popover)
    // =========================================================================
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeTransactionModal();
            closeDeleteModal();
            closeDepositModal();
            closeWithdrawModal();
            if (setBudgetModal) { setBudgetModal.classList.remove('show'); document.body.style.overflow = ''; }
            if (addBillModal) { addBillModal.classList.remove('show'); document.body.style.overflow = ''; }
            if (proUpgradeModal) { proUpgradeModal.classList.remove('show'); document.body.style.overflow = ''; }
            closeColorPopover();
            closeNotificationDropdown();
            if (userDropdownMenu) userDropdownMenu.classList.remove('show');
            if (isMobile()) closeMobileSidebar();
        }
    });

    // Close popovers on outside click
    document.addEventListener('click', (e) => {
        if (colorPalettePopover &&
            !colorPalettePopover.contains(e.target) &&
            colorPaletteBtn &&
            !colorPaletteBtn.contains(e.target)) {
            closeColorPopover();
        }
    });

    // =========================================================================
    // 29. Boot & Initial App Render
    // =========================================================================
    initCharts();
    calculateTotals();
    updateCharts();
    renderAllTables();
    renderBills();
    renderBudgetPlanner();
    renderRewardsView();
    renderNotifications();
});
