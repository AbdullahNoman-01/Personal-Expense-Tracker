# Personal Expense Tracker 💰📊

A modern, responsive, and full-featured **Personal Expense Tracker** web application built with **Django** and **Vanilla JavaScript** featuring dynamic **Chart.js** financial visualizations, **LocalStorage** data persistence with per-user isolation, real-time balance calculations, a multi-view sidebar dashboard, interactive modals, and an in-app notification center.

---

## 🌟 Key Features

### 1. Dynamic Financial Dashboard
- **Total Income**, **Total Expenses**, and **Current Balance** calculate and update automatically in real-time.
- **Savings Rate KPI**: Shows savings percentage and visual progress bar.
- **Chart.js Visualizations**:
  - **Monthly Cash Flow Bar Chart**: Side-by-side comparison of monthly Income vs Expenses.
  - **Category Spending Doughnut Chart**: Interactive breakdown of expenditures by category.
- **Quick Action Buttons**: `+ Add Transaction`, `Deposit Funds`, `Withdraw Funds`, and `Export CSV`.

### 2. Transaction Management (Add, Edit, Delete)
- **Add Transaction**: Clean form with Title, Amount, Type (Income / Expense), Category, Date, and Merchant/Notes.
- **Input Validation**: Strict client-side validation ensuring non-empty titles, valid positive amounts (> 0), and selected dates.
- **Edit Transaction (Bonus Feature)**: Click the ✏️ icon on any transaction to edit details in a prefilled modal.
- **Delete with Confirmation Dialog (Bonus Feature)**: A safety modal prompts user confirmation before deleting any record.

### 3. Multi-Criteria Filter & Real-Time Search
- **Type Filter**: Filter transactions by `All`, `Income`, or `Expense`.
- **Category Filter**: Filter by `Food & Dining`, `Shopping`, `Housing & Utilities`, `Transportation`, `Entertainment`, `Salary`, `Freelance`, etc.
- **Real-Time Search**: Instant search filtering as you type by Title, Merchant, or Category.
- **Sorting Options**: Sort by `Newest First`, `Oldest First`, `Highest Amount`, or `Lowest Amount`.
- **Empty State**: Friendly illustration and message displayed when no records match.

### 4. Per-User LocalStorage Persistence & Guest Mode
- **Isolated Storage**: Data is saved to `localStorage` keyed by user account (`pet_tx_<username>`).
- **New User Zero Balance**: Newly registered users start fresh with `$0.00` balance and zero transactions.
- **Guest Mode Preview**: Unauthenticated visitors can explore the dashboard with realistic sample data.
- **Data survives browser refresh and reopening**.

### 5. Multi-View Sidebar Navigation
- **Dashboard**: Complete overview with KPI cards, charts, and recent activity.
- **Transactions**: Dedicated full table with toolbar filters, search, and actions.
- **Analytics & Reports**: Deep insights including Highest Expense, Daily Average, Top Category, and cumulative cash flow trends.
- **Budget Planner**: Set monthly budget limits per category with dynamic progress bars (Green < 70%, Amber 70-90%, Red > 90% or Over Budget).
- **Cards & Transfers**: 3D virtual debit card with instant **Deposit** and **Withdraw** funds modals.
- **Invoices & Bills**: Track upcoming bills with a 1-click **Pay Bill** action that converts bills directly into expense transactions.
- **Rewards & Badges**: Gamified financial achievements (e.g. *First Step*, *Active Tracker*, *Century Club*, *Super Saver*).

### 6. In-App Notification Center
- Every financial event (Deposits, Withdrawals, Income added, Expenses added, Edits, Deletions, and Bill payments) automatically generates an in-app notification.
- Unread badge counter, alert dot, and **Mark all read** functionality.

### 7. Customization & Responsive Design
- **5 Selectable Accent Colors**: Dark Red, Blue, Green, Purple, and Orange.
- **Day / Night Mode**: Seamless light and dark mode toggling.
- **Mobile Responsive**: Slide-out navigation drawer with backdrop overlay for phones and tablets.
- **CSV Export**: One-click export to download transactions statement as a `.csv` file.

---

## 🛠️ Tech Stack

- **Backend**: Python 3, Django 5.x
- **Frontend**: HTML5, CSS3 (Modern Flexbox & CSS Grid), Vanilla JavaScript (ES6+)
- **Charting**: [Chart.js 4.x](https://www.chartjs.org/)
- **Storage**: Browser `localStorage` (client-side) & SQLite / Django ORM (auth & profiles)
- **Icons**: Custom SVG vector icons

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+ installed on your system.

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone <YOUR_GITHUB_REPOSITORY_URL>
   cd "Personal Expense Tracker"
   ```

2. **Create and activate a virtual environment (optional but recommended):**
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install Django:**
   ```bash
   pip install django
   ```

4. **Apply database migrations:**
   ```bash
   python manage.py migrate
   ```

5. **Start the development server:**
   ```bash
   python manage.py runserver
   ```

6. **Open in browser:**
   Navigate to [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

---

## 👤 User Accounts & Demo Credentials

- **Guest Mode**: Visit `http://127.0.0.1:8000/` directly to test with demo data.
- **New Account**: Click **Sign Up** to create a fresh account (starts with $0.00 balance).
- **Quick 1-Click Social Demo**: Click **Google** or **Facebook** on the login page to sign in immediately with a demo account.
- **Sample Demo User**:
  - **Username**: `demouser`
  - **Password**: `Demo@1234`

---

## 📂 Project Structure

```text
Personal Expense Tracker/
├── accounts/                   # Authentication app (login, register, profile)
│   ├── models.py               # Profile model with avatar support
│   ├── views.py                # Auth views (login, register, social login demo)
│   ├── urls.py                 # Account routing
│   └── templates/accounts/     # Auth templates (login.html, register.html, profile.html)
├── core/                       # Django project root settings
│   ├── settings.py             # Settings, static dirs, installed apps
│   ├── urls.py                 # Core URL router
│   └── views.py                # Home view
├── static/                     # Global static assets
│   ├── css/
│   │   └── home.css            # Responsive dashboard styles, dark mode, animations
│   └── js/
│       └── home.js             # Core tracker engine (LocalStorage, Chart.js, CRUD)
├── templates/
│   └── home.html               # Multi-view dashboard, Chart.js canvases, modals
├── manage.py                   # Django management script
└── README.md                   # Project documentation
```

---

## 📝 Assignment Requirements Checklist

- [x] **Dashboard**: Total Income, Total Expenses, Current Balance (auto-updating).
- [x] **Add Transaction**: Title, Amount, Type, Category, Date, Add button with validation.
- [x] **Transaction History**: Displays all transactions with Title, Amount, Category, Type, Date.
- [x] **Delete Transaction**: Deletes transaction and updates dashboard totals automatically.
- [x] **Filter Transactions**: Filter by All, Income, and Expenses.
- [x] **Data Persistence**: Uses JavaScript `localStorage` per user; data survives browser reload.
- [x] **Responsive Design**: Works on Desktop, Tablet, and Mobile.
- [x] **Form Validation**: Strict validation preventing empty fields or invalid amounts.
- [x] **Empty State Message**: Friendly illustration and message when transactions are 0.
- [x] **Success Messages**: Toast notifications on actions.
- [x] **Bonus: Edit Transaction**: In-place editing via prefilled modal.
- [x] **Bonus: Real-Time Search**: Search transactions by title, merchant, or category.
- [x] **Bonus: Delete Confirmation Dialog**: Safety confirmation prompt before deletion.
- [x] **Bonus: Monthly Expense Summaries**: Visual monthly breakdown using Chart.js.
- [x] **Bonus: CSV Export**: Export statement to CSV format.

