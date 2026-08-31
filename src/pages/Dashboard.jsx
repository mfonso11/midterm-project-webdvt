import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import useTransactions from "../hooks/useTransactions";

const BUDGET_STORAGE_KEY =
  "daily-budget";

const DAILY_RECORDS_STORAGE_KEY =
  "budget-daily-records";

const ACTIVE_DATE_STORAGE_KEY =
  "budget-active-date";

const PRIVACY_STORAGE_KEY =
  "budget-privacy";

const TOTAL_SAVED_MONEY_STORAGE_KEY =
  "budget-total-saved-money";

const WORK_DAYS_STORAGE_KEY =
  "budget-work-days";

const WORK_DAY_PROGRESS_STORAGE_KEY =
  "budget-work-day-progress";

const WEEK_START_STORAGE_KEY =
  "budget-week-start";

const DASHBOARD_SCROLL_STORAGE_KEY =
  "budget-dashboard-scroll-position";

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

  const year =
    date.getFullYear();

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

    return saved
      ? JSON.parse(saved)
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

  return Math.max(
    saved,
    1
  );
}


/* =====================================================
   DASHBOARD
===================================================== */

function Dashboard() {

  const {
    transactions,
  } = useTransactions();


  /* ===================================================
     CURRENT SYSTEM DATE
  =================================================== */

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
        ) ||
        getLocalDate()
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
    useState(loadDailyRecords);


  /* ===================================================
     TOTAL SAVED MONEY

     This is the amount the user already has saved.

     It is separate from:
     - current budget
     - today's savings
     - completed-day savings
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

    return saved > 0
      ? String(saved)
      : "";

  });


  /* ===================================================
     WORK / SCHOOL DAYS

     Default = 5 days per week.
  =================================================== */

  const [
    workDays,
    setWorkDays,
  ] = useState(
    loadWorkDays
  );


  /* ===================================================
     WORK / SCHOOL DAY PROGRESS
  =================================================== */

  const [
    currentWorkDay,
    setCurrentWorkDay,
  ] = useState(
    loadWorkDayProgress
  );


  /* ===================================================
     WEEK START

     Used to persist the user's current work/school
     week even after refreshing.
  =================================================== */

  const [
    weekStartDate,
    setWeekStartDate,
  ] = useState(() => {

    return (
      localStorage.getItem(
        WEEK_START_STORAGE_KEY
      ) ||
      getLocalDate()
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
          return JSON.parse(saved);
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

     Work/school days are based on the selected number
     of days per week.

     Examples:

     ₱2,000 / 4 days = ₱500 per day

     For 2 weeks:
     4 work days × 2 weeks = 8 days

     For 30 days:
     4 work days × (30 / 7) weeks
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
     ACTIVE DATE TRANSACTIONS
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
     TODAY'S EXPENSES
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
     TODAY'S INCOME
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
     TODAY'S SAVINGS
  =================================================== */

  const todaySavings =
    dailyBudget -
    todayExpenses;


  /* ===================================================
     TODAY REMAINING
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
     COMPLETED-DAY SAVINGS
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

     This keeps the existing "Total Savings" meaning,
     based on completed days.
  =================================================== */

  const totalSavings =
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
     CURRENCY
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
     RESTORE DASHBOARD SCROLL POSITION
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

    const position =
      Number(savedPosition);

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
     SAVE SCROLL POSITION WHILE ON DASHBOARD
  =================================================== */

  useEffect(() => {

    const saveScrollPosition =
      () => {

        sessionStorage.setItem(
          DASHBOARD_SCROLL_STORAGE_KEY,
          String(window.scrollY)
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
     PRIVACY TOGGLE
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
      !amount ||
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
     SAVE TOTAL SAVED MONEY
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
     CHANGE WORK / SCHOOL DAYS
  =================================================== */

  const changeWorkDays = (
    days
  ) => {

    const newDays =
      Number(days);


    setWorkDays(
      newDays
    );


    localStorage.setItem(
      WORK_DAYS_STORAGE_KEY,
      String(newDays)
    );


    /*
      If the current progress is greater than the new
      number of selected days, restart at Day 1.
    */

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


    const record = {
      date,
      budget: dailyBudget,
      income,
      expenses,
      savings:
        dailyBudget -
        expenses,
    };


    return record;

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


    const existingRecord =
      dailyRecords.find(
        (record) =>
          record.date ===
          date
      );


    let updatedRecords;


    if (existingRecord) {

      updatedRecords =
        dailyRecords.map(
          (record) =>
            record.date ===
            date
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


    return updatedRecords;

  };


  /* ===================================================
     AUTOMATIC NEW-DAY CHECK

     If the browser is opened/refreshed on a new
     calendar day, the previous active day is saved
     into history and the active date becomes today.

     Transactions themselves are NOT deleted.
  =================================================== */

  useEffect(() => {

    if (
      activeDate >=
      systemToday
    ) {
      return;
    }


    const previousRecord =
      dailyRecords.find(
        (record) =>
          record.date ===
          activeDate
      );


    if (!previousRecord) {

      const automaticRecord =
        createDailyRecord(
          activeDate
        );


      const updatedRecords = [
        ...dailyRecords,
        automaticRecord,
      ];


      setDailyRecords(
        updatedRecords
      );


      localStorage.setItem(
        DAILY_RECORDS_STORAGE_KEY,
        JSON.stringify(
          updatedRecords
        )
      );

    }


    setActiveDate(
      systemToday
    );


    localStorage.setItem(
      ACTIVE_DATE_STORAGE_KEY,
      systemToday
    );


  }, [
    systemToday,
    activeDate,
  ]);


  /* ===================================================
     APPLY TODAY'S ACTIVITY

     Creates or updates the record for the active date.
  =================================================== */

  const applyToday = () => {

    saveDailyRecord(
      activeDate
    );


    setMessage(
      "Today's activity has been applied to your totals."
    );


    setTimeout(() => {
      setMessage("");
    }, 2500);

  };


  /* ===================================================
     DAY OVER / NEXT DAY
  =================================================== */

  const finishDay = () => {

    const confirmed =
      window.confirm(
        `Finish ${formatDate(activeDate)} and move to ${formatDate(systemToday)}?`
      );


    if (!confirmed) {
      return;
    }


    /* -----------------------------------------------
       Save current day's record
    ------------------------------------------------ */

    saveDailyRecord(
      activeDate
    );


    /* -----------------------------------------------
       Advance work/school day
    ------------------------------------------------ */

    let nextWorkDay;


    if (
      currentWorkDay >=
      workDays
    ) {

      /*
        All selected work/school days have been
        completed.

        Start a new week at Day 1.
      */

      nextWorkDay = 1;

      const newWeekStart =
        systemToday;

      setWeekStartDate(
        newWeekStart
      );

      localStorage.setItem(
        WEEK_START_STORAGE_KEY,
        newWeekStart
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
       Move active date to today
    ------------------------------------------------ */

    setActiveDate(
      systemToday
    );


    localStorage.setItem(
      ACTIVE_DATE_STORAGE_KEY,
      systemToday
    );


    setMessage(
      `Day completed. Now tracking ${formatDate(
        systemToday
      )}.`
    );


    setTimeout(() => {
      setMessage("");
    }, 3000);

  };


  /* ===================================================
     PREVIOUS DAY
  =================================================== */

  const isPreviousDay =
    activeDate <
    systemToday;


  /* ===================================================
     SORT HISTORY
  =================================================== */

  const sortedDailyRecords =
    [...dailyRecords]
      .sort(
        (a, b) =>
          b.date.localeCompare(
            a.date
          )
      );


  return (
    <div className="page-container">

      {/* =================================================
          PAGE HEADER
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


        {/* PRIVACY */}

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

        {/* TOTAL SAVINGS */}

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
            Savings accumulated from
            completed days.
          </p>

        </div>


        {/* TOTAL EXPENSES */}

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
          MANAGE BUDGET
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

          </div>


          <button
            type="button"
            className="budget-reset-button"
            onClick={resetBudget}
          >
            Reset Budget
          </button>

        </div>


        {/* PREVIOUS DAY WARNING */}

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
              . Finish that day before
              starting today.
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


        {/* PERIOD */}

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


        {/* BUDGET INPUT */}

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
            TOTAL SAVED MONEY
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
                placeholder="0.00"
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

          </div>


          <button
            type="button"
            className="submit-button submit-income"
            onClick={
              saveTotalSavedMoney
            }
          >
            Save Savings
          </button>

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
              {Math.min(
                currentWorkDay,
                workDays
              )}{" "}
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
                ? "Today's activity has already been applied to your totals."
                : "Apply today's results to your overall savings and expense totals."}
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
                  key={record.date}
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


        {/* FILTERS */}

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


        {/* TRANSACTION CARDS */}

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