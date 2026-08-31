import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import useTransactions from "../hooks/useTransactions";

const BUDGET_STORAGE_KEY = "daily-budget";
const DAILY_RECORDS_STORAGE_KEY = "budget-daily-records";
const ACTIVE_DATE_STORAGE_KEY = "budget-active-date";
const PRIVACY_STORAGE_KEY = "budget-privacy";
const TOTAL_SAVED_MONEY_STORAGE_KEY =
  "budget-total-saved-money";
const WORK_DAYS_STORAGE_KEY = "budget-work-days";
const WORK_DAY_PROGRESS_STORAGE_KEY =
  "budget-work-day-progress";
const WEEK_START_STORAGE_KEY = "budget-week-start";
const DASHBOARD_SCROLL_STORAGE_KEY =
  "budget-dashboard-scroll-position";

const TRANSACTIONS_STORAGE_KEY =
  "budget-transactions";

const PERIODS = [
  {
    value: "week",
    label: "1 Week",
    days: 7,
  },
  {
    value: "two-weeks",
    label: "2 Weeks",
    days: 14,
  },
  {
    value: "month",
    label: "1 Month",
    days: 30,
  },
];

const CATEGORIES = [
  "Food",
  "Transportation",
  "School",
  "Bills",
  "Shopping",
  "Entertainment",
  "Health",
  "Salary",
  "Allowance",
  "Other",
];

/* =====================================================
   DATE HELPERS
===================================================== */

function getLocalDate() {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(dateString, amount) {
  const date = new Date(
    `${dateString}T00:00:00`
  );

  date.setDate(
    date.getDate() + amount
  );

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(dateString) {
  if (!dateString) {
    return "";
  }

  const date = new Date(
    `${dateString}T00:00:00`
  );

  return date.toLocaleDateString(
    "en-PH",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );
}

/* =====================================================
   STORAGE HELPERS
===================================================== */

function loadDailyRecords() {
  try {
    const saved =
      localStorage.getItem(
        DAILY_RECORDS_STORAGE_KEY
      );

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}

function loadNumber(
  key,
  defaultValue = 0
) {
  try {
    const saved =
      localStorage.getItem(key);

    if (
      saved === null ||
      saved === ""
    ) {
      return defaultValue;
    }

    const number =
      Number(saved);

    return Number.isFinite(number)
      ? number
      : defaultValue;
  } catch {
    return defaultValue;
  }
}

function loadWorkDays() {
  const saved =
    loadNumber(
      WORK_DAYS_STORAGE_KEY,
      5
    );

  return Math.min(
    Math.max(
      saved,
      1
    ),
    7
  );
}

function loadWorkDayProgress() {
  const saved =
    loadNumber(
      WORK_DAY_PROGRESS_STORAGE_KEY,
      1
    );

  return Math.min(
    Math.max(
      saved,
      1
    ),
    7
  );
}

/* =====================================================
   TRANSACTION STORAGE
===================================================== */

function removeTransactionsForDate(
  date
) {
  try {
    const saved =
      localStorage.getItem(
        TRANSACTIONS_STORAGE_KEY
      );

    if (!saved) {
      return;
    }

    const transactions =
      JSON.parse(saved);

    if (!Array.isArray(transactions)) {
      return;
    }

    const remaining =
      transactions.filter(
        (transaction) =>
          transaction.date !== date
      );

    localStorage.setItem(
      TRANSACTIONS_STORAGE_KEY,
      JSON.stringify(remaining)
    );
  } catch (error) {
    console.error(
      "Failed to remove daily transactions:",
      error
    );
  }
}

/* =====================================================
   DASHBOARD
===================================================== */

function Dashboard() {
  const {
    transactions,
    deleteTransaction,
  } = useTransactions();

  /* ===================================================
     SYSTEM DATE
  =================================================== */

  const systemToday =
    getLocalDate();

  /* ===================================================
     ACTIVE DATE
  =================================================== */

  const [activeDate, setActiveDate] =
    useState(() => {
      const saved =
        localStorage.getItem(
          ACTIVE_DATE_STORAGE_KEY
        );

      return saved || getLocalDate();
    });

  /* ===================================================
     PRIVACY
  =================================================== */

  const [privacyMode, setPrivacyMode] =
    useState(() => {
      return (
        localStorage.getItem(
          PRIVACY_STORAGE_KEY
        ) === "true"
      );
    });

  /* ===================================================
     DAILY RECORDS
  =================================================== */

  const [dailyRecords, setDailyRecords] =
    useState(
      loadDailyRecords
    );

  /* ===================================================
     MANUAL SAVED MONEY
  =================================================== */

  const [
    totalSavedMoney,
    setTotalSavedMoney,
  ] = useState(() =>
    loadNumber(
      TOTAL_SAVED_MONEY_STORAGE_KEY,
      0
    )
  );

  const [
    savedMoneyInput,
    setSavedMoneyInput,
  ] = useState(() => {
    const saved =
      loadNumber(
        TOTAL_SAVED_MONEY_STORAGE_KEY,
        0
      );

    return String(saved);
  });

  /* ===================================================
     WORK / SCHOOL DAYS
  =================================================== */

  const [
    workDays,
    setWorkDays,
  ] = useState(
    loadWorkDays
  );

  /* ===================================================
     CURRENT WORK / SCHOOL DAY
  =================================================== */

  const [
    currentWorkDay,
    setCurrentWorkDay,
  ] = useState(
    loadWorkDayProgress
  );

  /* ===================================================
     WEEK START
  =================================================== */

  const [
    weekStartDate,
    setWeekStartDate,
  ] = useState(() => {
    return (
      localStorage.getItem(
        WEEK_START_STORAGE_KEY
      ) ||
      systemToday
    );
  });

  /* ===================================================
     BUDGET
  =================================================== */

  const [budgetData, setBudgetData] =
    useState(() => {
      try {
        const saved =
          localStorage.getItem(
            BUDGET_STORAGE_KEY
          );

        if (saved) {
          const parsed =
            JSON.parse(saved);

          return {
            amount:
              parsed.amount || "",
            period:
              parsed.period || "week",
          };
        }
      } catch {
        // Ignore invalid data
      }

      return {
        amount: "",
        period: "week",
      };
    });

  const [budgetInput, setBudgetInput] =
    useState(
      budgetData.amount || ""
    );

  const [message, setMessage] =
    useState("");

  /* ===================================================
     FILTERS
  =================================================== */

  const [categoryFilter, setCategoryFilter] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState("");

  /* ===================================================
     PERIOD
  =================================================== */

  const selectedPeriod =
    PERIODS.find(
      (period) =>
        period.value ===
        budgetData.period
    ) || PERIODS[0];

  const allocatedBudget =
    Number(
      budgetData.amount
    ) || 0;

  /* ===================================================
     DAILY BUDGET
  =================================================== */

  const periodWeeks =
    selectedPeriod.days / 7;

  const workDaysInPeriod =
    workDays *
    periodWeeks;

  const dailyBudget =
    workDaysInPeriod > 0
      ? allocatedBudget /
        workDaysInPeriod
      : 0;

  /* ===================================================
     ACTIVE DAY TRANSACTIONS
  =================================================== */

  const activeDayTransactions =
    useMemo(() => {
      return transactions.filter(
        (transaction) =>
          transaction.date ===
          activeDate
      );
    }, [
      transactions,
      activeDate,
    ]);

  /* ===================================================
     TODAY EXPENSES
  =================================================== */

  const todayExpenses =
    useMemo(() => {
      return activeDayTransactions
        .filter(
          (transaction) =>
            transaction.type ===
            "Expense"
        )
        .reduce(
          (total, transaction) =>
            total +
            Number(
              transaction.amount || 0
            ),
          0
        );
    }, [
      activeDayTransactions,
    ]);

  /* ===================================================
     TODAY INCOME
  =================================================== */

  const todayIncome =
    useMemo(() => {
      return activeDayTransactions
        .filter(
          (transaction) =>
            transaction.type ===
            "Income"
        )
        .reduce(
          (total, transaction) =>
            total +
            Number(
              transaction.amount || 0
            ),
          0
        );
    }, [
      activeDayTransactions,
    ]);

  /* ===================================================
     TODAY SAVINGS
  =================================================== */

  const todaySavings =
    dailyBudget -
    todayExpenses;

  /* ===================================================
     REMAINING TODAY
  =================================================== */

  const remainingToday =
    dailyBudget -
    todayExpenses;

  /* ===================================================
     BUDGET USAGE
  =================================================== */

  const todayExpensePercentage =
    dailyBudget > 0
      ? (
          todayExpenses /
          dailyBudget
        ) * 100
      : 0;

  const progressPercentage =
    Math.min(
      Math.max(
        todayExpensePercentage,
        0
      ),
      100
    );

  /* ===================================================
     CURRENT DAILY RECORD
  =================================================== */

  const currentDailyRecord =
    dailyRecords.find(
      (record) =>
        record.date ===
        activeDate
    );

  const dayHasBeenApplied =
    Boolean(
      currentDailyRecord
    );

  /* ===================================================
     COMPLETED DAILY SAVINGS
  =================================================== */

  const completedDaySavings =
    dailyRecords.reduce(
      (total, record) =>
        total +
        Number(
          record.savings || 0
        ),
      0
    );

  /* ===================================================
     TOTAL SAVINGS
  =================================================== */

  const totalSavings =
    totalSavedMoney +
    completedDaySavings;

  /* ===================================================
     TOTAL EXPENSES
  =================================================== */

  const totalExpenses =
    dailyRecords.reduce(
      (total, record) =>
        total +
        Number(
          record.expenses || 0
        ),
      0
    );

  /* ===================================================
     FILTERED TRANSACTIONS
  =================================================== */

  const filteredTransactions =
    useMemo(() => {
      return transactions.filter(
        (transaction) => {
          const matchesCategory =
            !categoryFilter ||
            transaction.category ===
              categoryFilter;

          const matchesType =
            !typeFilter ||
            transaction.type ===
              typeFilter;

          return (
            matchesCategory &&
            matchesType
          );
        }
      );
    }, [
      transactions,
      categoryFilter,
      typeFilter,
    ]);

  /* ===================================================
     FORMAT CURRENCY
  =================================================== */

  const formatCurrency = (
    value
  ) => {
    const number =
      Number(value || 0);

    const formatted =
      Math.abs(number).toLocaleString(
        "en-PH",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      );

    if (privacyMode) {
      return "••••••";
    }

    return number < 0
      ? `-₱${formatted}`
      : `₱${formatted}`;
  };

  /* ===================================================
     CURRENT WEEK DAY
  =================================================== */

  const displayedWorkDay =
    Math.min(
      Math.max(
        currentWorkDay,
        1
      ),
      workDays
    );

  /* ===================================================
     NEXT CALENDAR DATE
  =================================================== */

  const nextDate =
    addDays(
      activeDate,
      1
    );

  /* ===================================================
     RESTORE DASHBOARD SCROLL
  =================================================== */

  useEffect(() => {
    const savedPosition =
      sessionStorage.getItem(
        DASHBOARD_SCROLL_STORAGE_KEY
      );

    if (
      savedPosition === null
    ) {
      return;
    }

    let position;

    try {
      const parsed =
        JSON.parse(savedPosition);

      position =
        Number(
          parsed?.y ?? 0
        );
    } catch {
      position =
        Number(
          savedPosition
        );
    }

    if (
      !Number.isFinite(position)
    ) {
      return;
    }

    requestAnimationFrame(() => {
      window.scrollTo({
        top: position,
        behavior: "auto",
      });

      sessionStorage.removeItem(
        DASHBOARD_SCROLL_STORAGE_KEY
      );
    });
  }, []);

  /* ===================================================
     SAVE SCROLL
  =================================================== */

  useEffect(() => {
    const saveScrollPosition =
      () => {
        sessionStorage.setItem(
          DASHBOARD_SCROLL_STORAGE_KEY,
          JSON.stringify({
            x: window.scrollX,
            y: window.scrollY,
          })
        );
      };

    window.addEventListener(
      "scroll",
      saveScrollPosition,
      {
        passive: true,
      }
    );

    return () => {
      saveScrollPosition();

      window.removeEventListener(
        "scroll",
        saveScrollPosition
      );
    };
  }, []);

  /* ===================================================
     KEEP ACTIVE DATE IN STORAGE
  =================================================== */

  useEffect(() => {
    localStorage.setItem(
      ACTIVE_DATE_STORAGE_KEY,
      activeDate
    );
  }, [
    activeDate,
  ]);

  /* ===================================================
     PRIVACY
  =================================================== */

  const togglePrivacy = () => {
    setPrivacyMode(
      (current) => {
        const next =
          !current;

        localStorage.setItem(
          PRIVACY_STORAGE_KEY,
          String(next)
        );

        return next;
      }
    );
  };

  /* ===================================================
     SAVE BUDGET
  =================================================== */

  const saveBudget = () => {
    const amount =
      Number(budgetInput);

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setMessage(
        "Please enter a budget greater than zero."
      );

      return;
    }

    const newBudgetData = {
      amount,
      period:
        budgetData.period ||
        "week",
    };

    setBudgetData(
      newBudgetData
    );

    localStorage.setItem(
      BUDGET_STORAGE_KEY,
      JSON.stringify(
        newBudgetData
      )
    );

    setMessage(
      "Budget saved successfully."
    );

    setTimeout(() => {
      setMessage("");
    }, 2500);
  };

  /* ===================================================
     CHANGE PERIOD
  =================================================== */

  const changePeriod = (
    period
  ) => {
    const newBudgetData = {
      ...budgetData,
      period,
    };

    setBudgetData(
      newBudgetData
    );

    localStorage.setItem(
      BUDGET_STORAGE_KEY,
      JSON.stringify(
        newBudgetData
      )
    );
  };

  /* ===================================================
     SAVE MANUAL TOTAL SAVINGS
  =================================================== */

  const saveTotalSavedMoney = () => {
    const amount =
      Number(savedMoneyInput);

    if (
      savedMoneyInput === "" ||
      !Number.isFinite(amount) ||
      amount < 0
    ) {
      setMessage(
        "Please enter a valid saved amount."
      );

      return;
    }

    setTotalSavedMoney(
      amount
    );

    localStorage.setItem(
      TOTAL_SAVED_MONEY_STORAGE_KEY,
      String(amount)
    );

    setMessage(
      "Total saved money updated successfully."
    );

    setTimeout(() => {
      setMessage("");
    }, 2500);
  };

  /* ===================================================
     RESET MANUAL SAVINGS
  =================================================== */

  const resetTotalSavedMoney = () => {
    const confirmed =
      window.confirm(
        "Reset your manually entered total saved money to ₱0.00?"
      );

    if (!confirmed) {
      return;
    }

    setTotalSavedMoney(
      0
    );

    setSavedMoneyInput(
      "0"
    );

    localStorage.setItem(
      TOTAL_SAVED_MONEY_STORAGE_KEY,
      "0"
    );

    setMessage(
      "Manual saved money has been reset."
    );

    setTimeout(() => {
      setMessage("");
    }, 2500);
  };

  /* ===================================================
     CHANGE WORK DAYS
  =================================================== */

  const changeWorkDays = (
    days
  ) => {
    const newDays =
      Number(days);

    if (
      newDays < 1 ||
      newDays > 7
    ) {
      return;
    }

    setWorkDays(
      newDays
    );

    localStorage.setItem(
      WORK_DAYS_STORAGE_KEY,
      String(newDays)
    );

    if (
      currentWorkDay >
      newDays
    ) {
      setCurrentWorkDay(
        1
      );

      localStorage.setItem(
        WORK_DAY_PROGRESS_STORAGE_KEY,
        "1"
      );
    }
  };

  /* ===================================================
     RESET BUDGET
  =================================================== */

  const resetBudget = () => {
    const confirmed =
      window.confirm(
        "Reset the current budget? Your transactions and history will not be deleted."
      );

    if (!confirmed) {
      return;
    }

    const resetData = {
      amount: "",
      period: "week",
    };

    setBudgetData(
      resetData
    );

    setBudgetInput(
      ""
    );

    localStorage.setItem(
      BUDGET_STORAGE_KEY,
      JSON.stringify(
        resetData
      )
    );

    setMessage(
      "Current budget has been reset."
    );

    setTimeout(() => {
      setMessage("");
    }, 2500);
  };

  /* ===================================================
     RESET ALL DATA
  =================================================== */

  const resetAllData = () => {
    const confirmed =
      window.confirm(
        "Are you sure you want to reset ALL data?\n\n" +
        "This will permanently delete your budget, " +
        "savings, expenses, daily history, transactions, " +
        "and all other Budget Tracker data.\n\n" +
        "This action cannot be undone."
      );

    if (!confirmed) {
      return;
    }

    /* -----------------------------------------------
       Remove every Budget Tracker localStorage item
    ------------------------------------------------ */

    localStorage.removeItem(
      BUDGET_STORAGE_KEY
    );

    localStorage.removeItem(
      DAILY_RECORDS_STORAGE_KEY
    );

    localStorage.removeItem(
      ACTIVE_DATE_STORAGE_KEY
    );

    localStorage.removeItem(
      PRIVACY_STORAGE_KEY
    );

    localStorage.removeItem(
      TOTAL_SAVED_MONEY_STORAGE_KEY
    );

    localStorage.removeItem(
      WORK_DAYS_STORAGE_KEY
    );

    localStorage.removeItem(
      WORK_DAY_PROGRESS_STORAGE_KEY
    );

    localStorage.removeItem(
      WEEK_START_STORAGE_KEY
    );

    localStorage.removeItem(
      DASHBOARD_SCROLL_STORAGE_KEY
    );

    localStorage.removeItem(
      TRANSACTIONS_STORAGE_KEY
    );

    /* -----------------------------------------------
       Reset React state
    ------------------------------------------------ */

    setBudgetData({
      amount: "",
      period: "week",
    });

    setBudgetInput("");

    setDailyRecords([]);

    setTotalSavedMoney(0);

    setSavedMoneyInput("0");

    setWorkDays(5);

    setCurrentWorkDay(1);

    setWeekStartDate(
      getLocalDate()
    );

    setActiveDate(
      getLocalDate()
    );

    setPrivacyMode(false);

    setCategoryFilter("");

    setTypeFilter("");

    setMessage(
      "All Budget Tracker data has been reset."
    );

    /*
       Reload the page so useTransactions
       also initializes with an empty array.
    */

    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  /* ===================================================
     CREATE DAILY RECORD
  =================================================== */

  const createDailyRecord = (
    date
  ) => {
    const dayTransactions =
      transactions.filter(
        (transaction) =>
          transaction.date ===
          date
      );

    const expenses =
      dayTransactions
        .filter(
          (transaction) =>
            transaction.type ===
            "Expense"
        )
        .reduce(
          (total, transaction) =>
            total +
            Number(
              transaction.amount || 0
            ),
          0
        );

    const income =
      dayTransactions
        .filter(
          (transaction) =>
            transaction.type ===
            "Income"
        )
        .reduce(
          (total, transaction) =>
            total +
            Number(
              transaction.amount || 0
            ),
          0
        );

    return {
      date,
      budget: dailyBudget,
      income,
      expenses,
      savings:
        dailyBudget -
        expenses,
    };
  };

  /* ===================================================
     SAVE DAILY RECORD
  =================================================== */

  const saveDailyRecord = (
    date
  ) => {
    const newRecord =
      createDailyRecord(
        date
      );

    const existingIndex =
      dailyRecords.findIndex(
        (record) =>
          record.date ===
          date
      );

    let updatedRecords;

    if (
      existingIndex !== -1
    ) {
      updatedRecords =
        dailyRecords.map(
          (record, index) =>
            index ===
            existingIndex
              ? newRecord
              : record
        );
    } else {
      updatedRecords = [
        ...dailyRecords,
        newRecord,
      ];
    }

    setDailyRecords(
      updatedRecords
    );

    localStorage.setItem(
      DAILY_RECORDS_STORAGE_KEY,
      JSON.stringify(
        updatedRecords
      )
    );

    return newRecord;
  };

  /* ===================================================
     APPLY TODAY'S ACTIVITY
  =================================================== */

  const applyToday = () => {
    saveDailyRecord(
      activeDate
    );

    setMessage(
      "Today's activity has been saved to your daily totals."
    );

    setTimeout(() => {
      setMessage("");
    }, 2500);
  };

  /* ===================================================
     DELETE DAY TRANSACTIONS
  =================================================== */

  const deleteDayTransactions = (
    date
  ) => {
    const dayTransactions =
      transactions.filter(
        (transaction) =>
          transaction.date ===
          date
      );

    dayTransactions.forEach(
      (transaction) => {
        deleteTransaction(
          transaction.id
        );
      }
    );

    removeTransactionsForDate(
      date
    );
  };

  /* ===================================================
     DAY OVER / NEXT DAY
  =================================================== */

  const finishDay = () => {
    const confirmed =
      window.confirm(
        `Finish ${formatDate(
          activeDate
        )} and move to ${formatDate(
          nextDate
        )}? Your transactions for ${formatDate(
          activeDate
        )} will be cleared.`
      );

    if (!confirmed) {
      return;
    }

    /* Save completed day */

    saveDailyRecord(
      activeDate
    );

    /* Delete today's transactions */

    deleteDayTransactions(
      activeDate
    );

    /* Move to next calendar date */

    setActiveDate(
      nextDate
    );

    localStorage.setItem(
      ACTIVE_DATE_STORAGE_KEY,
      nextDate
    );

    /* Move work/school day forward */

    let nextWorkDay;
    let nextWeekStart =
      weekStartDate;

    if (
      currentWorkDay >=
      workDays
    ) {
      nextWorkDay = 1;

      nextWeekStart =
        nextDate;

      setWeekStartDate(
        nextWeekStart
      );

      localStorage.setItem(
        WEEK_START_STORAGE_KEY,
        nextWeekStart
      );
    } else {
      nextWorkDay =
        currentWorkDay + 1;
    }

    setCurrentWorkDay(
      nextWorkDay
    );

    localStorage.setItem(
      WORK_DAY_PROGRESS_STORAGE_KEY,
      String(nextWorkDay)
    );

    setMessage(
      `Day completed. Now tracking ${formatDate(
        nextDate
      )} as Day ${nextWorkDay} / ${workDays}.`
    );

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  /* ===================================================
     PREVIOUS DAY CHECK
  =================================================== */

  const isPreviousDay =
    activeDate <
    systemToday;

  /* ===================================================
     SORT HISTORY
  =================================================== */

  const sortedDailyRecords =
    [...dailyRecords].sort(
      (a, b) =>
        b.date.localeCompare(
          a.date
        )
    );

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <div className="page-container">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="page-header">

        <div>

          <p className="page-label">
            DASHBOARD
          </p>

          <h1>
            Personal Budget Tracker
          </h1>

          <p>
            Manage your money, track your
            daily spending, and build your
            savings over time.
          </p>

        </div>

        <button
          type="button"
          className="privacy-button"
          onClick={togglePrivacy}
        >
          {privacyMode
            ? "👁 Show Amounts"
            : "🔒 Hide Amounts"}
        </button>

      </div>


      {/* =================================================
          TOTALS
      ================================================= */}

      <section className="financial-section">

        <div className="stat-card savings-stat-card">

          <span className="stat-label">
            Total Savings
          </span>

          <h2
            className={
              totalSavings >= 0
                ? "positive-value"
                : "negative-value"
            }
          >
            {formatCurrency(
              totalSavings
            )}
          </h2>

          <p className="privacy-hint">
            Manual savings + completed
            daily savings.
          </p>

        </div>


        <div className="stat-card expenses-stat-card">

          <span className="stat-label">
            Total Expenses
          </span>

          <h2
            className={
              totalExpenses >= 0
                ? "expense-value"
                : "negative-value"
            }
          >
            {formatCurrency(
              totalExpenses
            )}
          </h2>

          <p className="privacy-hint">
            Expenses from completed days.
          </p>

        </div>

      </section>


      {/* =================================================
          TODAY'S MONEY
      ================================================= */}

      <section className="today-summary-grid">

        <div className="today-summary-card">

          <span>
            Today's Budget
          </span>

          <strong>
            {formatCurrency(
              dailyBudget
            )}
          </strong>

          <small>
            Available spending amount
          </small>

        </div>


        <div className="today-summary-card">

          <span>
            Today's Expenses
          </span>

          <strong
            className={
              todayExpenses > 0
                ? "negative"
                : ""
            }
          >
            {formatCurrency(
              todayExpenses
            )}
          </strong>

          <small>
            Money spent today
          </small>

        </div>


        <div className="today-summary-card">

          <span>
            Today's Savings
          </span>

          <strong
            className={
              todaySavings >= 0
                ? "positive"
                : "negative"
            }
          >
            {formatCurrency(
              todaySavings
            )}
          </strong>

          <small>
            Today's budget minus expenses
          </small>

        </div>


        <div className="today-summary-card">

          <span>
            Remaining Today
          </span>

          <strong
            className={
              remainingToday >= 0
                ? "positive"
                : "negative"
            }
          >
            {formatCurrency(
              remainingToday
            )}
          </strong>

          <small>
            Amount remaining to spend
          </small>

        </div>

      </section>


      {/* =================================================
          BUDGET
      ================================================= */}

      <section className="budget-dashboard-card">

        <div className="budget-dashboard-header">

          <div>

            <p className="page-label">
              DAILY BUDGET
            </p>

            <h2>
              Manage Your Budget
            </h2>

            <p>
              Set a budget for a week,
              two weeks, or a month.
              Your daily allowance is
              calculated automatically.
            </p>

            <p className="active-date-label">
              Currently tracking:{" "}
              <strong>
                {formatDate(
                  activeDate
                )}
              </strong>
            </p>

            <p className="active-date-label">
              Week Start:{" "}
              <strong>
                {formatDate(
                  weekStartDate
                )}
              </strong>
            </p>

            <p className="active-date-label">
              Current Work/School Day:{" "}
              <strong>
                Day {displayedWorkDay} /{" "}
                {workDays}
              </strong>
            </p>

          </div>


          <button
            type="button"
            className="budget-reset-button"
            onClick={resetBudget}
          >
            Reset Budget
          </button>

        </div>


        {/* =================================================
            PREVIOUS DAY WARNING
        ================================================= */}

        {isPreviousDay && (
          <div className="day-warning">

            <strong>
              A new calendar day has started.
            </strong>

            <p>
              You are still viewing{" "}
              {formatDate(
                activeDate
              )}
              .
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={finishDay}
            >
              Day Over / Start Today
            </button>

          </div>
        )}


        {/* =================================================
            PERIOD
        ================================================= */}

        <div className="budget-period-buttons">

          {PERIODS.map(
            (period) => (
              <button
                key={
                  period.value
                }
                type="button"
                className={
                  budgetData.period ===
                  period.value
                    ? "budget-period-button active"
                    : "budget-period-button"
                }
                onClick={() =>
                  changePeriod(
                    period.value
                  )
                }
              >
                {period.label}
              </button>
            )
          )}

        </div>


        {/* =================================================
            BUDGET INPUT
        ================================================= */}

        <div className="budget-input-row">

          <div className="budget-input-group">

            <label>
              Total Budget
            </label>

            <div className="budget-input-wrapper">

              <span>
                ₱
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={
                  budgetInput
                }
                onChange={(event) =>
                  setBudgetInput(
                    event.target.value
                  )
                }
              />

            </div>

          </div>


          <button
            type="button"
            className="submit-button submit-income"
            onClick={saveBudget}
          >
            Save Budget
          </button>

        </div>


        {/* =================================================
            MANUAL TOTAL SAVINGS
        ================================================= */}

        <div className="budget-input-row">

          <div className="budget-input-group">

            <label>
              Total Saved Money
            </label>

            <div className="budget-input-wrapper">

              <span>
                ₱
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={
                  savedMoneyInput
                }
                onChange={(event) =>
                  setSavedMoneyInput(
                    event.target.value
                  )
                }
              />

            </div>

            <p className="input-description">
              Manual savings amount.
              Completed daily savings are
              added automatically.
            </p>

          </div>


          <div className="day-action-buttons">

            <button
              type="button"
              className="submit-button submit-income"
              onClick={
                saveTotalSavedMoney
              }
            >
              Save Savings
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={
                resetTotalSavedMoney
              }
            >
              Reset Saved Money
            </button>

          </div>

        </div>


        {/* =================================================
            WORK / SCHOOL DAYS
        ================================================= */}

        <div className="work-days-section">

          <div className="budget-input-group">

            <label>
              Work/School Days Per Week
            </label>

            <p className="input-description">
              Choose how many days you normally
              work or attend school each week.
            </p>

          </div>


          <div className="budget-period-buttons">

            {[1, 2, 3, 4, 5, 6, 7].map(
              (days) => (
                <button
                  key={days}
                  type="button"
                  className={
                    workDays === days
                      ? "budget-period-button active"
                      : "budget-period-button"
                  }
                  onClick={() =>
                    changeWorkDays(
                      days
                    )
                  }
                >
                  {days}{" "}
                  {days === 1
                    ? "Day"
                    : "Days"}
                </button>
              )
            )}

          </div>


          <div className="work-days-summary">

            <span>
              Daily Budget
            </span>

            <strong>
              {formatCurrency(
                dailyBudget
              )}
            </strong>

          </div>


          <div className="work-days-progress">

            <span>
              Current Work/School Day
            </span>

            <strong>
              Day{" "}
              {displayedWorkDay}{" "}
              /{" "}
              {workDays}
            </strong>

          </div>

        </div>


        {message && (
          <p className="budget-message">
            {message}
          </p>
        )}


        {/* =================================================
            BUDGET STATISTICS
        ================================================= */}

        <div className="budget-dashboard-stats">

          <div>

            <span>
              Daily Budget
            </span>

            <strong>
              {formatCurrency(
                dailyBudget
              )}
            </strong>

          </div>


          <div>

            <span>
              Today's Expenses
            </span>

            <strong className="negative">
              {formatCurrency(
                todayExpenses
              )}
            </strong>

          </div>


          <div>

            <span>
              Today's Savings
            </span>

            <strong
              className={
                todaySavings >= 0
                  ? "positive"
                  : "negative"
              }
            >
              {formatCurrency(
                todaySavings
              )}
            </strong>

          </div>


          <div>

            <span>
              Remaining Today
            </span>

            <strong
              className={
                remainingToday >= 0
                  ? "positive"
                  : "negative"
              }
            >
              {formatCurrency(
                remainingToday
              )}
            </strong>

          </div>

        </div>


        {/* =================================================
            USAGE
        ================================================= */}

        <div className="budget-usage">

          <div className="budget-usage-header">

            <div>

              <strong>
                Today's Budget Usage
              </strong>

              <span>
                {todayExpensePercentage.toFixed(
                  1
                )}
                % used
              </span>

            </div>

            <strong>
              {formatCurrency(
                todayExpenses
              )}
              {" / "}
              {formatCurrency(
                dailyBudget
              )}
            </strong>

          </div>


          <div className="budget-progress-track">

            <div
              className={
                todayExpensePercentage >
                100
                  ? "budget-progress-bar over-budget"
                  : "budget-progress-bar"
              }
              style={{
                width: `${progressPercentage}%`,
              }}
            />

          </div>


          {remainingToday < 0 && (
            <p className="budget-warning">
              You have exceeded today's
              budget by{" "}
              {formatCurrency(
                Math.abs(
                  remainingToday
                )
              )}
              .
            </p>
          )}

        </div>


        {/* =================================================
            DAY ACTIONS
        ================================================= */}

        <div className="budget-apply-section">

          <div>

            <strong>
              Today's Activity
            </strong>

            <p>
              {dayHasBeenApplied
                ? "Today's activity has already been saved. You can update it without creating a duplicate."
                : "Save today's activity to your daily history before ending the day."}
            </p>

          </div>


          <div className="day-action-buttons">

            <button
              type="button"
              className="primary-button"
              onClick={applyToday}
            >
              {dayHasBeenApplied
                ? "Update Today's Totals"
                : "Apply Today's Activity"}
            </button>


            <button
              type="button"
              className="secondary-button"
              onClick={finishDay}
            >
              Day Over / Next Day
            </button>

          </div>

        </div>


        {/* =================================================
            RESET ALL DATA
        ================================================= */}

        <div className="danger-zone">

          <div>

            <strong>
              Reset Everything
            </strong>

            <p>
              Permanently delete all budgets,
              savings, expenses, transactions,
              daily history, and tracker settings.
            </p>

          </div>

          <button
            type="button"
            className="reset-all-button"
            onClick={resetAllData}
          >
            Reset All Data
          </button>

        </div>

      </section>


      {/* =================================================
          DAILY HISTORY
      ================================================= */}

      <section className="history-section">

        <div className="section-header">

          <div>

            <h2>
              Daily History
            </h2>

            <p>
              Review your budget, expenses,
              and savings from previous days.
            </p>

          </div>

        </div>


        {sortedDailyRecords.length === 0 ? (

          <div className="empty-state">

            <h3>
              No completed days yet
            </h3>

            <p>
              Apply today's activity or
              finish the day to create
              your first history record.
            </p>

          </div>

        ) : (

          <div className="history-grid">

            {sortedDailyRecords.map(
              (record) => (
                <div
                  className="history-card"
                  key={
                    record.date
                  }
                >

                  <div className="history-card-header">

                    <h3>
                      {formatDate(
                        record.date
                      )}
                    </h3>

                    <span>
                      Completed
                    </span>

                  </div>


                  <div className="history-values">

                    <div>

                      <span>
                        Budget
                      </span>

                      <strong>
                        {formatCurrency(
                          record.budget
                        )}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Expenses
                      </span>

                      <strong className="negative">
                        {formatCurrency(
                          record.expenses
                        )}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Savings
                      </span>

                      <strong
                        className={
                          Number(
                            record.savings
                          ) >= 0
                            ? "positive"
                            : "negative"
                        }
                      >
                        {formatCurrency(
                          record.savings
                        )}
                      </strong>

                    </div>

                  </div>

                </div>
              )
            )}

          </div>

        )}

      </section>


      {/* =================================================
          TRANSACTIONS
      ================================================= */}

      <section className="transactions-section">

        <div className="section-header">

          <div>

            <h2>
              Transactions
            </h2>

            <p>
              View and manage all your
              recorded transactions.
            </p>

          </div>


          <Link
            to="/add"
            className="primary-button"
          >
            + Add Transaction
          </Link>

        </div>


        {/* =================================================
            FILTERS
        ================================================= */}

        <div className="filters">

          <div className="filter-group">

            <label>
              Category
            </label>

            <select
              value={
                categoryFilter
              }
              onChange={(event) =>
                setCategoryFilter(
                  event.target.value
                )
              }
            >

              <option value="">
                All Categories
              </option>

              {CATEGORIES.map(
                (category) => (
                  <option
                    key={
                      category
                    }
                    value={
                      category
                    }
                  >
                    {category}
                  </option>
                )
              )}

            </select>

          </div>


          <div className="filter-group">

            <label>
              Type
            </label>

            <select
              value={
                typeFilter
              }
              onChange={(event) =>
                setTypeFilter(
                  event.target.value
                )
              }
            >

              <option value="">
                All Types
              </option>

              <option value="Income">
                Income
              </option>

              <option value="Expense">
                Expense
              </option>

            </select>

          </div>

        </div>


        {/* =================================================
            TRANSACTION CARDS
        ================================================= */}

        {filteredTransactions.length === 0 ? (

          <div className="empty-state">

            <h3>
              No transactions found
            </h3>

            <p>
              Add your first income or
              expense to start tracking
              your finances.
            </p>

            <Link
              to="/add"
              className="primary-button"
            >
              Add Transaction
            </Link>

          </div>

        ) : (

          <div className="transaction-grid">

            {filteredTransactions
              .slice()
              .reverse()
              .map(
                (transaction) => (
                  <Link
                    key={
                      transaction.id
                    }
                    to={`/transaction/${transaction.id}`}
                    className="transaction-card"
                  >

                    <div className="transaction-card-top">

                      <h3>
                        {transaction.title ||
                          transaction.description ||
                          "Untitled Transaction"}
                      </h3>

                      <span
                        className={
                          transaction.type ===
                          "Income"
                            ? "income-badge"
                            : "expense-badge"
                        }
                      >
                        {
                          transaction.type
                        }
                      </span>

                    </div>


                    <div className="transaction-amount">

                      <span
                        className={
                          transaction.type ===
                          "Income"
                            ? "positive"
                            : "negative"
                        }
                      >
                        {transaction.type ===
                        "Income"
                          ? "+"
                          : "-"}
                        {formatCurrency(
                          transaction.amount
                        )}
                      </span>

                    </div>


                    <div className="transaction-details">

                      <span>
                        {
                          transaction.category
                        }
                      </span>

                      <span>
                        {
                          transaction.date
                        }
                      </span>

                    </div>

                  </Link>
                )
              )}

          </div>

        )}

      </section>

    </div>
  );
}

export default Dashboard;