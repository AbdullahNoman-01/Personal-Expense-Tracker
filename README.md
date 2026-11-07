# 💸 Personal Expense Tracker

<div align="center">

  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=10,14,20&height=180&section=header&text=Personal%20Expense%20Tracker&fontSize=42&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Smart%20Financial%20Management%20%E2%80%A2%20Real-time%20Analytics%20%E2%80%A2%20Interactive%20Budgeting&descFontSize=16&descAlignY=62&descColor=94A3B8" alt="Personal Expense Tracker Banner" width="100%" />

  <br />

  [![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-Visit%20Website-0070F3?style=for-the-badge&logo=vercel&logoColor=white)](https://personal-expense-tracker-t16j-roan.vercel.app/)
  [![Django](https://img.shields.io/badge/Django-5.x-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
  [![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
  [![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/)
  [![Chart.js](https://img.shields.io/badge/Chart.js-4.x-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)
  [![Responsive](https://img.shields.io/badge/Responsive-100%25-10B981?style=for-the-badge&logo=googlechrome&logoColor=white)](https://personal-expense-tracker-t16j-roan.vercel.app/)

  <br />
  <br />

  **🌐 Live Production URL:**  
  👉 **[https://personal-expense-tracker-t16j-roan.vercel.app/](https://personal-expense-tracker-t16j-roan.vercel.app/)** 👈

</div>

---

## 📖 Overview

**Personal Expense Tracker** is a state-of-the-art, feature-rich web application built to empower users with complete control over their personal finances. Developed with **Django** on the backend and modern **Vanilla JavaScript (ES6+)** with **Chart.js** on the frontend, the application offers an intuitive, responsive, and secure experience for tracking daily income, expenditures, recurring bills, and category budgets.

Data persistence is handled through user-isolated client-side **LocalStorage** coupled with secure **Django ORM** user authentication, ensuring complete privacy, zero-latency updates, and persistent state across page reloads.

---

## 🌟 Key Features & Capabilities

### 1. 📊 Interactive Dashboard & Financial KPIs
- **Dynamic Totals**: **Total Income**, **Total Expenses**, and **Current Balance** calculate automatically in real time whenever any transaction is added, updated, or removed.
- **Visual KPI Cards**: Total Savings percentage meter with animated progress indicator.
- **Chart.js Visualizations**:
  - **Monthly Cash Flow Trend**: Side-by-side bar chart visualizing Income vs Expenses across months.
  - **Category Breakdown Doughnut**: Color-coded distribution of spending habits.
- **Quick Action Triggers**:
  - `+ Add Transaction` modal
  - `+ Add Money` wallet deposit modal
  - `Withdraw Funds` modal
  - `Export CSV` instant statement download

### 2. 💳 Complete Transaction Management (Full CRUD)
- **Add Transaction**: Validated modal form with Title, Amount, Type (Income / Expense), Category, Date, and Merchant/Notes.
- **Strict Validation**: Prevents empty inputs, zero amounts, or negative numbers with inline error messages.
- **Edit Transaction (Bonus Feature)**: In-place edit modal with pre-populated data and live total recalculations.
- **Delete with Safety Confirmation**: Unified confirmation dialog preventing accidental deletion of records.
- **Toast Notifications**: Interactive feedback toasts for all user interactions.

### 3. 🔍 Multi-Criteria Filtering & Real-Time Search
- **Type Filter**: Filter instantly by `All`, `Income`, and `Expense`.
- **Category Filter**: Filter records by Food & Dining, Shopping, Housing & Utilities, Transportation, Entertainment, Salary, Freelance, Investment, and more.
- **Real-Time Live Search (Bonus Feature)**: Instant substring matching across Title, Merchant, and Category.
- **Sorting Options**: Sort by `Newest First`, `Oldest First`, `Highest Amount`, or `Lowest Amount`.
- **Empty State Illustration**: Elegant placeholder illustration and guidance message when no records match.

### 4. 🎯 Monthly Category Budget Planner
- **Spending Limits**: Set monthly spending targets for specific categories.
- **Health Indicators**: Dynamic progress bars:
  - 🟢 **On Track** (< 75% utilized)
  - 🟡 **Warning** (75% – 99% utilized)
  - 🔴 **Over Budget** (≥ 100% utilized with amount exceeded)
- **Edit & Delete Action Buttons**: Edit budget limits or remove category plans directly from each budget card.

### 5. 🧾 Recurring Invoices & Bills (with 5-Minute Auto-Vanish)
- **Bill Tracking**: Manage subscriptions, utility bills, and rent with due dates and category tags.
- **Edit & Delete Options**: Edit recurring bill details or remove bills with confirmation.
- **One-Click Pay Action**: Clicking **Pay Bill** marks the bill as settled, records an automated expense transaction, and starts an automatic **5-minute countdown**.
- **Automated Vanish Animation**: Paid bills smoothly fade out and archive from the active list after 5 minutes.

### 6. 🏧 Virtual Card & Wallet Simulation
- **3D Card Display**: Realistic virtual Visa Platinum card showcasing the live wallet balance, cardholder name, and masked number.
- **Deposit Funds**: Multiple deposit channels (Visa Card, Bank Wire, PayPal Express, Crypto USDC) with preset amount chips (`+$50`, `+$100`, `+$250`, `+$500`).
- **Withdraw Funds**: Transfer funds to checking bank accounts, PayPal, or ATM cash with balance verification.

### 7. 🔐 User Authentication & Password Recovery
- **Per-User LocalStorage Isolation**: Each user's financial ledger is stored under a unique key (`pet_tx_<username>`), ensuring privacy on shared devices.
- **Zero-Balance Start**: Newly created accounts start clean with **$0.00** balance.
- **Guest Mode Preview**: Unauthenticated visitors can preview the dashboard with realistic sample data.
- **Profile & Avatar Support**: Base64 data URI avatar storage designed to work seamlessly in serverless environments (Vercel).
- **Password Reset via Gmail SMTP**:
  - Cryptographically secure one-time token generation (`default_token_generator`).
  - **Branded HTML Email**: Delivered with the website logo, name, user greeting, CTA reset button, and 24-hour expiration notice.
  - Responsive fallback text version and dedicated reset confirmation page.

### 8. 🎨 Personalization & 100% Mobile Responsiveness
- **5 Theme Colors**: Dark Red, Blue, Emerald Green, Purple, and Orange via a floating quick-switch palette.
- **Dark / Light Mode**: Seamless theme toggle with persistent user preference in `localStorage`.
- **Collapsible Sidebar**: Desktop sidebar shrinks to icon-only mode while smoothly resizing charts and layout grids.
- **100% Mobile Friendly**:
  - Slide-over drawer navigation for mobile screens.
  - Safe mobile dialogs and iOS Safari zoom prevention (`16px` font size on inputs).
  - Horizontally swipeable tables with sticky headers.

---

## 🛠️ Technology Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Backend Framework** | [Django 5.x / 6.x](https://www.djangoproject.com/) | High-level Python web framework |
| **Language** | [Python 3.10+](https://www.python.org/) | Core backend programming language |
| **Frontend Engine** | Vanilla JavaScript (ES6+) | Modern asynchronous DOM manipulation |
| **Styling & Design** | CSS3 & HTML5 | Custom CSS Variables, Flexbox, CSS Grid, Glassmorphism |
| **Visualizations** | [Chart.js 4.x](https://www.chartjs.org/) | Responsive canvas charts (Bar, Doughnut, Line) |
| **Data Persistence** | Browser `localStorage` & SQLite | Per-user client storage + Django ORM database |
| **Mailing System** | Python `smtplib` / Gmail SMTP | Multi-alternative HTML password reset dispatch |
| **Cloud Deployment** | [Vercel Serverless](https://vercel.com/) | Production hosting with serverless WSGI |

---

## 🚀 Local Installation & Setup

### Prerequisites
- Python 3.10 or higher installed.
- Git installed on your system.

### Step-by-Step Guide

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-username/personal-expense-tracker.git
   cd "Personal Expense Tracker"
   ```

2. **Create and Activate a Virtual Environment:**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install Dependencies:**
   ```bash
   pip install django python-dotenv
   ```

4. **Configure Environment Variables (`.env`):**
   Create a `.env` file in the root folder (or edit the existing one):
   ```env
   SECRET_KEY=django-insecure-your-secret-key-here
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1,.vercel.app
   CSRF_TRUSTED_ORIGINS=https://*.vercel.app,http://127.0.0.1:8000,http://localhost:8000

   # Optional: Gmail SMTP configuration for live password reset emails
   EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USE_TLS=True
   EMAIL_HOST_USER=your-email@gmail.com
   EMAIL_HOST_PASSWORD=your-16-char-google-app-password
   ```

5. **Apply Database Migrations:**
   ```bash
   python manage.py migrate
   ```

6. **Start the Development Server:**
   ```bash
   python manage.py runserver
   ```

7. **Open Application in Browser:**
   Visit: `http://127.0.0.1:8000/`

---

## 📂 Project Structure

```text
Personal Expense Tracker/
├── accounts/                         # Authentication & Profile app
│   ├── migrations/                   # Database migrations
│   ├── static/accounts/              # Auth stylesheets & scripts
│   │   ├── css/login.css             # Glassmorphic auth styles
│   │   └── js/auth.js                # Auth modals, slides & AJAX handlers
│   ├── templates/accounts/           # Auth templates
│   │   ├── emails/
│   │   │   ├── password_reset_email.html   # Branded HTML reset email with logo
│   │   │   └── password_reset_email.txt    # Fallback plain text email
│   │   ├── login.html                # Login screen with showcase panel
│   │   ├── register.html             # User registration
│   │   ├── profile.html              # Profile & avatar management
│   │   ├── password_reset_confirm.html     # Set new password page
│   │   └── password_reset_complete.html    # Password reset complete page
│   ├── forms.py                      # Django authentication forms
│   ├── models.py                     # Profile model (Base64 avatar support)
│   ├── urls.py                       # Auth routing
│   └── views.py                      # Auth controllers & password reset logic
├── core/                             # Django root configuration
│   ├── settings.py                   # Master settings (DB, Static, Email, Vercel)
│   ├── urls.py                       # Top-level URL dispatcher
│   ├── views.py                      # Root dashboard view
│   └── wsgi.py                       # WSGI entrypoint for Vercel
├── static/                           # Global static files
│   ├── css/
│   │   └── home.css                  # 3600+ lines of responsive styles & themes
│   └── js/
│       └── home.js                   # Tracker engine, LocalStorage, Chart.js
├── templates/
│   └── home.html                     # Multi-view dashboard, cards, modals
├── manage.py                         # Django administrative utility
├── .env                              # Environment variables
├── vercel.json                       # Vercel deployment configuration
└── README.md                         # Project documentation
```

---

## 📋 Assignment Requirements & Compliance Matrix

| Requirement | Description | Status |
| :--- | :--- | :---: |
| **1. Dashboard** | Real-time Total Income, Total Expenses, and Current Balance calculations | ✅ Completed |
| **2. Add Transaction** | Full form: Title, Amount, Type (Income/Expense), Category, Date | ✅ Completed |
| **3. Transaction History** | Table/card layout with Title, Amount, Category, Type, and Date | ✅ Completed |
| **4. Delete Transaction** | Ability to delete records with automatic total recalculation | ✅ Completed |
| **5. Filter Transactions** | Filter by All Transactions, Income, and Expenses | ✅ Completed |
| **6. Data Persistence** | JavaScript `localStorage` saves transactions across refreshes | ✅ Completed |
| **7. Responsive Design** | 100% responsive across Desktop, Tablet, and Mobile screens | ✅ Completed |
| **Validation** | Prevents empty fields or invalid amounts | ✅ Completed |
| **Empty State** | Helpful illustration and text when no transactions exist | ✅ Completed |
| **Success Feedback** | Color-coded toast alerts on add, edit, or delete | ✅ Completed |
| **Bonus 1** | **Edit Transaction**: Full in-place modal edit feature | ✅ Completed |
| **Bonus 2** | **Live Search**: Real-time filtering by title, merchant, or category | ✅ Completed |
| **Bonus 3** | **Delete Confirmation Dialog**: Modal popup before record deletion | ✅ Completed |
| **Bonus 4** | **Monthly Summaries & Charts**: Chart.js Cash Flow & Category breakdown | ✅ Completed |
| **Extra Feature** | **Budget Planner**: Monthly category spending limits with status pills | ✅ Completed |
| **Extra Feature** | **Invoices & Bills**: 5-minute auto-vanish countdown after payment | ✅ Completed |
| **Extra Feature** | **Password Recovery**: Branded HTML reset email via Gmail SMTP | ✅ Completed |
| **Extra Feature** | **Themes & Dark Mode**: 5 accent themes + Light/Dark mode switcher | ✅ Completed |

---

## 🌐 Live Deployment

The application is deployed and live on **Vercel**:  
🔗 **[https://personal-expense-tracker-t16j-roan.vercel.app/](https://personal-expense-tracker-t16j-roan.vercel.app/)**

---

<div align="center">
  <sub>Developed with ❤️ for <strong>Ostad MERN / Django Batch 12 - Assignment 16</strong>.</sub>
</div>
