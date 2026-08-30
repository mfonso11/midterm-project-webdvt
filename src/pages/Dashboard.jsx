import { useMemo, useState } from "react";
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

     This allows the user to finish one day and
     explicitly move to the next one.
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


  const dailyBudget =
    selectedPeriod.days > 0
      ? allocatedBudget /
        selectedPeriod.days
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

     IMPORTANT:

     Savings = Budget - Expenses

     It is NOT equal to expenses.
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
     TOTAL SAVINGS

     ONLY completed/applied days count here.

     This prevents today's temporary budget from
     automatically changing the user's total savings.
  =================================================== */

  const totalSavings =
    dailyRecords.reduce(
      (total, record) =>
        total +
        Number(
          record.savings || 0
        ),
      0
    );


  /* ===================================================
     TOTAL EXPENSES

     ONLY completed/applied days count here.
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
     APPLY TODAY'S ACTIVITY

     Creates or updates the record for this date.
  =================================================== */

  const applyToday = () => {

    const newRecord = {
      date: activeDate,
      budget: dailyBudget,
      income: todayIncome,
      expenses: todayExpenses,
      savings: todaySavings,
    };


    const existingRecord =
      dailyRecords.find(
        (record) =>
          record.date ===
          activeDate
      );


    let updatedRecords;


    if (existingRecord) {

      updatedRecords =
        dailyRecords.map(
          (record) =>
            record.date ===
            activeDate
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


    setMessage(
      "Today's activity has been applied to your totals."
    );


    setTimeout(() => {
      setMessage("");
    }, 2500);

  };


  /* ===================================================
     DAY OVER / NEXT DAY

     Saves the current day first, then moves to the
     actual current date.
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
       Save today's record automatically
    ------------------------------------------------ */

    const newRecord = {
      date: activeDate,
      budget: dailyBudget,
      income: todayIncome,
      expenses: todayExpenses,
      savings: todaySavings,
    };


    const existingRecord =
      dailyRecords.find(
        (record) =>
          record.date ===
          activeDate
      );


    let updatedRecords;


    if (existingRecord) {

      updatedRecords =
        dailyRecords.map(
          (record) =>
            record.date ===
            activeDate
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


    /* -----------------------------------------------
       Move to today
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
     IF USER HAS NOT FINISHED PREVIOUS DAY
  =================================================== */

  const isPreviousDay =
    activeDate < systemToday;


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


        {message && (
          <p className="budget-message">
            {message}
          </p>
        )}


        {/* BUDGET STATISTICS */}

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


        {/* USAGE */}

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


        {/* DAY ACTIONS */}

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