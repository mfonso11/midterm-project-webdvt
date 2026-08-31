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

    const number = Number(saved);

    return Number.isFinite(number)
      ? number
      : defaultValue;
  } catch {
    return defaultValue;
  }
}

function loadWorkDays() {
  const saved = loadNumber(
    WORK_DAYS_STORAGE_KEY,
    5
  );

  return Math.min(
    Math.max(saved, 1),
    7
  );
}

function loadWorkDayProgress() {
  const saved = loadNumber(
    WORK_DAY_PROGRESS_STORAGE_KEY,
    1
  );

  return Math.min(
    Math.max(saved, 1),
    7
  );
}

/* =====================================================
   DASHBOARD
===================================================== */

function Dashboard() {
  const {
    transactions,
    deleteTransaction,
  } = useTransactions();

  const systemToday =
    getLocalDate();

  /* ===================================================
     ACTIVE DATE
  =================================================== */

  const [activeDate, setActiveDate] =
    useState(() => {
      return (
        localStorage.getItem(
          ACTIVE_DATE_STORAGE_KEY
        ) || systemToday
      );
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
     TOTAL SAVINGS

     IMPORTANT:

     This is now the ACTUAL running total.

     Example:

     Starting = 9000

     Day 1:
       +330
       = 9330

     Day 2:
       +230
       = 9560

     Updating the same day again will NOT
     add the same savings twice.
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
    return String(
      loadNumber(
        TOTAL_SAVED_MONEY_STORAGE_KEY,
        0
      )
    );
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
      ) || systemToday
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

     Savings is the amount of the daily budget
     that remains after expenses.

     Example:

     Budget = 500
     Expenses = 170

     Savings = 330
  =================================================== */

  const todaySavings =
    dailyBudget -
    todayExpenses;

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
     TOTAL EXPENSES

     Only completed days are included.
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
     NEXT DATE
  =================================================== */

  const nextDate =
    addDays(
      activeDate,
      1
    );

  /* ===================================================
     SAVE SCROLL
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
        Number(savedPosition);
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
     ACTIVE DATE STORAGE
  =================================================== */

  useEffect(() => {
    localStorage.setItem(
      ACTIVE_DATE_STORAGE_KEY,
      activeDate
    );
  }, [activeDate]);

  /* ===================================================
     PRIVACY
  =================================================== */

  const togglePrivacy = () => {
    setPrivacyMode(
      (current) => {
        const next = !current;

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
     SAVE TOTAL SAVINGS

     This replaces the actual running total.

     It can be changed as many times as needed.

     Example:

     Current total = 9560

     User enters 10000

     New total = 10000
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
      "Total savings updated successfully."
    );

    setTimeout(() => {
      setMessage("");
    }, 2500);
  };

  /* ===================================================
     RESET TOTAL SAVINGS
  =================================================== */

  const resetTotalSavedMoney = () => {
    const confirmed =
      window.confirm(
        "Reset your total savings to ₱0.00?"
      );

    if (!confirmed) {
      return;
    }

    setTotalSavedMoney(0);
    setSavedMoneyInput("0");

    localStorage.setItem(
      TOTAL_SAVED_MONEY_STORAGE_KEY,
      "0"
    );

    setMessage(
      "Total savings has been reset."
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
      setCurrentWorkDay(1);

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

    setBudgetInput("");

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

    const savings =
      dailyBudget -
      expenses;

    return {
      date,
      budget: dailyBudget,
      income,
      expenses,
      savings,
    };
  };

  /* ===================================================
     SAVE DAILY RECORD

     This is where the major savings bug is fixed.

     If the day has NEVER been saved:

       Add today's savings.

     If the day WAS already saved:

       Calculate the difference between the
       old savings and new savings.

     Example:

       Old = 330
       New = 230

       Difference = -100

       Total savings is reduced by 100.

     This means the button can be clicked
     unlimited times without duplicate additions.
  =================================================== */

  const saveDailyRecord = (
    date
  ) => {
    const newRecord =
      createDailyRecord(
        date
      );

    const existingRecord =
      dailyRecords.find(
        (record) =>
          record.date ===
          date
      );

    const oldSavings =
      existingRecord
        ? Number(
            existingRecord.savings || 0
          )
        : 0;

    const newSavings =
      Number(
        newRecord.savings || 0
      );

    const difference =
      newSavings -
      oldSavings;

    /* -----------------------------------------------
       Update actual total savings.
    ------------------------------------------------ */

    if (difference !== 0) {
      setTotalSavedMoney(
        (currentTotal) => {
          const updatedTotal =
            currentTotal +
            difference;

          localStorage.setItem(
            TOTAL_SAVED_MONEY_STORAGE_KEY,
            String(updatedTotal)
          );

          return updatedTotal;
        }
      );
    }

    /* -----------------------------------------------
       Replace existing daily record,
       or add a new one.
    ------------------------------------------------ */

    setDailyRecords(
      (currentRecords) => {
        const index =
          currentRecords.findIndex(
            (record) =>
              record.date ===
              date
          );

        let updatedRecords;

        if (index !== -1) {
          updatedRecords =
            currentRecords.map(
              (record, recordIndex) =>
                recordIndex === index
                  ? newRecord
                  : record
            );
        } else {
          updatedRecords = [
            ...currentRecords,
            newRecord,
          ];
        }

        localStorage.setItem(
          DAILY_RECORDS_STORAGE_KEY,
          JSON.stringify(
            updatedRecords
          )
        );

        return updatedRecords;
      }
    );

    return {
      newRecord,
      difference,
    };
  };

  /* ===================================================
     APPLY / UPDATE TODAY
  =================================================== */

  const applyToday = () => {
    const result =
      saveDailyRecord(
        activeDate
      );

    setMessage(
      result.difference === 0
        ? "Today's totals are already up to date."
        : "Today's totals have been updated successfully."
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

    try {
      const saved =
        localStorage.getItem(
          TRANSACTIONS_STORAGE_KEY
        );

      if (saved) {
        const parsed =
          JSON.parse(saved);

        if (
          Array.isArray(parsed)
        ) {
          const remaining =
            parsed.filter(
              (transaction) =>
                transaction.date !==
                date
            );

          localStorage.setItem(
            TRANSACTIONS_STORAGE_KEY,
            JSON.stringify(
              remaining
            )
          );
        }
      }
    } catch (error) {
      console.error(
        "Failed to clear daily transactions:",
        error
      );
    }
  };

  /* ===================================================
     DAY OVER

     IMPORTANT:

     The daily record is saved FIRST.

     The savings is added only once through
     saveDailyRecord().

     Then transactions are deleted.

     The new day gets zero transactions,
     zero expenses, and its own fresh budget.
  =================================================== */

  const finishDay = () => {
    const confirmed =
      window.confirm(
        `Finish ${formatDate(
          activeDate
        )} and move to ${formatDate(
          nextDate
        )}?

Your transactions for ${formatDate(
          activeDate
        )} will be cleared, but your daily history and total savings will be kept.`
      );

    if (!confirmed) {
      return;
    }

    /* -----------------------------------------------
       STEP 1
       Save/update today's totals.

       This adds ONLY the difference from the
       previously saved version of this day.
    ------------------------------------------------ */

    saveDailyRecord(
      activeDate
    );

    /* -----------------------------------------------
       STEP 2
       Delete completed day's transactions.
    ------------------------------------------------ */

    deleteDayTransactions(
      activeDate
    );

    /* -----------------------------------------------
       STEP 3
       Move to next calendar day.
    ------------------------------------------------ */

    setActiveDate(
      nextDate
    );

    localStorage.setItem(
      ACTIVE_DATE_STORAGE_KEY,
      nextDate
    );

    /* -----------------------------------------------
       STEP 4
       Advance work/school day.
    ------------------------------------------------ */

    let nextWorkDay;

    if (
      currentWorkDay >=
      workDays
    ) {
      nextWorkDay = 1;

      setWeekStartDate(
        nextDate
      );

      localStorage.setItem(
        WEEK_START_STORAGE_KEY,
        nextDate
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

    /* -----------------------------------------------
       STEP 5
       New day starts clean.
    ------------------------------------------------ */

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
     HISTORY
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
              totalSavedMoney >= 0
                ? "positive-value"
                : "negative-value"
            }
          >
            {formatCurrency(
              totalSavedMoney
            )}
          </h2>

          <p className="privacy-hint">
            Your running total savings.
          </p>

        </div>

        <div className="stat-card expenses-stat-card">

          <span className="stat-label">
            Total Expenses
          </span>

          <h2 className="expense-value">
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
                placeholder="2,000"
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
            TOTAL SAVINGS INPUT
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
                placeholder="9,000"
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
              Set your current total savings.
              Daily savings will automatically
              be added when you update today's
              totals.
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
              Reset Total Savings
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
                ? "Today's activity has already been saved. You can update it as many times as needed."
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
