# Personal Expense Tracker 💰📊

A modern, responsive, and full-featured **Personal Expense Tracker** web application developed with **Django** and **Vanilla JavaScript (ES6+)**. The system includes dynamic **Chart.js** financial visualizations, **LocalStorage** data persistence with per-user isolation, real-time balance calculations, a multi-view sidebar dashboard, interactive modals, recurring bill management with an automated 5-minute vanish timer, and an in-app notification center.

---

## 🌟 Key Features & Highlights

### 1. Dynamic Financial Dashboard
- **Real-Time Totals**: **Total Income**, **Total Expenses**, and **Current Balance** recalculate and update immediately whenever transactions are added, edited, or deleted.
- **Savings Rate KPI**: Live savings percentage meter with an animated progress bar.
- **Chart.js Interactive Visualizations**:
  - **Monthly Cash Flow Bar Chart**: Side-by-side comparison of monthly Income vs Expenses.
  - **Category Spending Doughnut Chart**: Visual breakdown of expenditures by category.
- **Quick Action Buttons**:
  - `+ Add Transaction` modal trigger
  - `+ Add Money` instant deposit modal trigger (in top header & cards view)
  - `Withdraw Funds` modal trigger
  - `Export CSV` one-click statement download

### 2. Complete Transaction Management (CRUD)
- **Add Transaction**: Clean, validated modal form covering Title, Amount, Type (Income / Expense), Category, Date, and Merchant/Notes.
- **Form Input Validation**: Strict validation preventing empty fields or invalid/negative amounts (`> 0`).
- **Edit Transaction (Bonus Feature)**: Click the ✏️ edit icon to modify any transaction in a prefilled modal.
- **Delete with Confirmation (Bonus Feature)**: Safety confirmation dialog before deleting records to prevent accidental loss.
- **Success Feedback**: Color-coded toast notifications on every add, edit, or delete action.

### 3. Multi-Criteria Filtering & Real-Time Search
- **Type Filter**: Filter by `All`, `Income`, and `Expense`.
- **Category Filter**: Filter by `Food & Dining`, `Shopping`, `Housing & Utilities`, `Transportation`, `Entertainment`, `Salary`, `Freelance`, `Investment`, etc.
- **Real-Time Live Search (Bonus Feature)**: Instant search by Title, Merchant, or Category as you type.
- **Sorting Options**: Sort by `Newest First`, `Oldest First`, `Highest Amount`, or `Lowest Amount`.
- **Empty State**: Friendly illustration and message displayed when no transactions are found.

### 4. Per-User LocalStorage Isolation & Guest Mode
- **Isolated Per-User Storage**: Data is saved to browser `localStorage` keyed by user account (`pet_tx_<username>`), ensuring complete privacy between multiple accounts on the same computer.
- **New Account Zero-Balance**: Newly created accounts start clean with **$0.00** balance and empty state.
- **Guest Mode Preview**: Unauthenticated visitors can preview the dashboard with realistic sample data before signing up.
- **Full Data Persistence**: All transactions, budgets, bills, and notifications survive browser refreshes and restarts.

### 5. Multi-View Sidebar Navigation
- **Dashboard**: Complete KPI overview, Chart.js charts, recent transactions table, and quick cards.
- **Transactions**: Dedicated full-page transactions management with toolbar filters, search, and CSV export.
- **Analytics & Reports (Bonus Feature)**: Deep financial insights including Highest Single Expense, Average Daily Spend, Top Spending Category, and cumulative cash flow trends.
- **Budget Planner**: Custom spending limits per category with dynamic progress bars (Green < 75%, Amber 75-99%, Red ≥ 100% Over-Budget indicator).
- **Cards & Transfers**: 3D virtual debit card with interactive **Deposit** and **Withdraw** funds modals.
- **Invoices & Bills (with 5-Min Auto-Vanish)**: Track upcoming recurring bills. Clicking **Pay Bill** marks the bill as settled, records an automatic expense in transactions, and smoothly **vanishes** from the active list after 5 minutes!
- **Rewards & Badges**: Gamified financial achievements (e.g., *First Step*, *Active Tracker*, *Century Club*, *Super Saver*, *Budget Guardian*).

### 6. Interactive Notification Center
- In-app notification bell with an unread badge counter and alert dot.
- Automatically records all financial activities: deposits, withdrawals, bill payments, and transaction changes.
- Includes **Mark all read** action.

### 7. Customization & 100% Mobile Responsiveness
- **5 Theme Accent Colors**: Dark Red, Blue, Green, Purple, and Orange (selected via floating palette).
- **Dark / Light Mode**: Seamless theme switching with persistent user preference.
- **Collapsible Desktop Sidebar**: Smoothly expands and collapses while automatically scaling dashboard elements and recalculating Chart.js dimensions.
- **100% Responsive Design**:
  - Slide-out drawer navigation for smartphones and tablets.
  - Horizontally scrollable tables with smooth touch physics.
  - Safe mobile dialogs and iOS Safari zoom prevention (`16px` inputs).
  - Floating bottom-center color palette for one-thumb mobile interaction.

---

## 🛠️ Tech Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Backend** | Python 3.10+, Django 5.x |
| **Frontend** | HTML5, CSS3 (Modern Flexbox & CSS Grid), JavaScript (ES6+) |
| **Data Visualizations** | [Chart.js 4.x](https://www.chartjs.org/) |
| **Data Persistence** | Browser `localStorage` (Client-side) & SQLite / Django ORM (Auth & User Profiles) |
| **Icons & Typography** | SVG Vector Icons, Plus Jakarta Sans |

---

## 🚀 Installation & Setup Guide

### Prerequisites
- Python 3.10 or higher installed on your computer.
- Git installed.

### Step-by-Step Instructions

1. **Clone the repository:**
   ```bash
   git clone <YOUR_PUBLIC_GITHUB_REPO_URL>
   cd "Personal Expense Tracker"
   ```

2. **Create and activate a virtual environment (Recommended):**
   ```bash
   # Create virtual environment
   python -m venv venv

   # On Windows:
   venv\Scripts\activate

   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install Dependencies:**
   ```bash
   pip install django
   ```

4. **Apply Database Migrations:**
   ```bash
   python manage.py migrate
   ```

5. **Start the Development Server:**
   ```bash
   python manage.py runserver
   ```

6. **Access the Application:**
   Open your browser and visit: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

---

## 👤 User Accounts & Testing Guide

- **Guest Mode**: Visit `http://127.0.0.1:8000/` directly without logging in to explore the dashboard in demo preview mode.
- **Create a New Account**: Click **Sign Up** from the header or login page to create your personal account. New accounts start with **$0.00** balance and empty state.
- **Sample Pre-Configured User**:
  - **Username**: `demouser`
  - **Password**: `Demo@1234`
- **Top Header `+ Add money` Button**: Click to deposit funds into your wallet balance instantly.
- **Pay Recurring Bill**: Go to **Invoices & Bills**, click **Pay Bill** to test the automatic expense creation and 5-minute vanish animation.

---

## 📂 Project Architecture

```text
Personal Expense Tracker/
├── accounts/                     # User authentication & profile management app
│   ├── forms.py                  # Custom auth forms (Login, Register, Profile, Avatar)
│   ├── models.py                 # Profile model with avatar upload support
│   ├── views.py                  # Login, Register, Profile, Forgot Password views
│   ├── urls.py                   # Accounts routing
│   ├── static/accounts/          # Auth styles and interactive 3-scene showcase slider
│   └── templates/accounts/       # Auth templates (login.html, register.html, profile.html)
├── core/                         # Django project core configuration
│   ├── settings.py               # Settings, installed apps, static/media config
│   ├── urls.py                   # Master URL dispatcher
│   ├── views.py                  # Home view controller
│   └── wsgi.py                   # WSGI server gateway
├── static/                       # Global static assets
│   ├── css/
│   │   └── home.css              # 100% responsive styling, themes, modals, animations
│   └── js/
│       └── home.js               # Main tracker engine (LocalStorage, Chart.js, CRUD, filters)
├── templates/
│   └── home.html                 # Multi-view dashboard, Chart.js canvases, and modals
├── manage.py                     # Django CLI command runner
└── README.md                     # Comprehensive project documentation
```

---

## 📝 Assignment Requirements Checklist

### Core Requirements
- [x] **1. Dashboard**: Displays Total Income, Total Expenses, and Current Balance (auto-updating on any transaction change).
- [x] **2. Add Transaction**: Complete form with Title, Amount, Type (Income / Expense), Category, and Date with an Add button.
- [x] **3. Transaction History**: Table/card layout displaying Title, Amount, Category, Type, and Date.
- [x] **4. Delete Transaction**: Ability to delete transactions with automatic recalculation of dashboard totals.
- [x] **5. Filter Transactions**: Filter records by All Transactions, Income, and Expenses.
- [x] **6. Data Persistence**: Uses JavaScript `localStorage` per user; data persists upon browser refresh and restart.
- [x] **7. Responsive Design**: Fully responsive across Desktop, Tablet, and Mobile devices.

### Additional Requirements
- [x] Form input validation (prevents empty fields and negative/invalid amounts).
- [x] Empty state illustration and message when no transactions exist.
- [x] Toast notification messages upon transaction addition, edit, or deletion.
- [x] Clean, modern, and user-friendly interface.

### Bonus Challenges Completed
- [x] **Edit Transaction Feature**: In-place edit modal with prefilled data and live recalculation.
- [x] **Real-Time Search Option**: Live search to find transactions by title, merchant, or category.
- [x] **Delete Confirmation Dialog**: Modal popup confirming deletion before action takes place.
- [x] **Monthly Expense Summaries**: Interactive Chart.js Cash Flow & Category breakdown charts.
- [x] **CSV Statement Export**: Download full transaction statements as `.csv` files.
- [x] **Recurring Bills with 5-Minute Vanish Timer**: Settled bills automatically archive from active list after 5 minutes.
- [x] **5 Selectable Theme Colors & Dark/Light Mode**: Full visual personalization.

---

## 👨‍💻 Submission Information

- **Project Name**: Personal Expense Tracker
- **Assignment**: Assignment 16
- **Status**: Completed & Verified
