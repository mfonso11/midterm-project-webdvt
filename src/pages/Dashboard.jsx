import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import useTransactions from "../hooks/useTransactions";

const BUDGET_STORAGE_KEY = "daily-budget";

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

function Dashboard() {
  const {
    transactions,
  } = useTransactions();

  /*
    --------------------------------------------------
    BUDGET
    --------------------------------------------------
  */

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
        // Ignore invalid saved data
      }

      return {
        amount: "",
        period: "week",
        startDate: getLocalDate(),
        appliedTransactionIds: [],
      };
    });

  const [budgetInput, setBudgetInput] =
    useState(
      budgetData.amount || ""
    );

  const [message, setMessage] =
    useState("");

  /*
    --------------------------------------------------
    FILTERS
    --------------------------------------------------
  */

  const [categoryFilter, setCategoryFilter] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState("");

  /*
    --------------------------------------------------
    CURRENT PERIOD
    --------------------------------------------------
  */

  const selectedPeriod =
    PERIODS.find(
      (period) =>
        period.value ===
        budgetData.period
    ) || PERIODS[0];

  const allocatedBudget =
    Number(budgetData.amount) || 0;

  const dailyBudget =
    selectedPeriod.days > 0
      ? allocatedBudget /
        selectedPeriod.days
      : 0;

  /*
    --------------------------------------------------
    TODAY
    --------------------------------------------------
  */

  const today = getLocalDate();

  const todayTransactions =
    useMemo(() => {
      return transactions.filter(
        (transaction) =>
          transaction.date === today
      );
    }, [
      transactions,
      today,
    ]);

  /*
    --------------------------------------------------
    APPLIED TRANSACTIONS
    --------------------------------------------------
  */

  const appliedIds =
    budgetData.appliedTransactionIds ||
    [];

  const appliedTransactions =
    useMemo(() => {
      return transactions.filter(
        (transaction) =>
          appliedIds.includes(
            String(transaction.id)
          )
      );
    }, [
      transactions,
      appliedIds,
    ]);

  /*
    --------------------------------------------------
    TOTAL SAVINGS
    --------------------------------------------------
  */

  const totalIncome =
    appliedTransactions
      .filter(
        (transaction) =>
          transaction.type ===
          "Income"
      )
      .reduce(
        (total, transaction) =>
          total +
          Number(transaction.amount || 0),
        0
      );

  const totalExpenses =
    appliedTransactions
      .filter(
        (transaction) =>
          transaction.type ===
          "Expense"
      )
      .reduce(
        (total, transaction) =>
          total +
          Number(transaction.amount || 0),
        0
      );

  const totalSavings =
    totalIncome -
    totalExpenses;

  /*
    --------------------------------------------------
    TODAY'S ACTIVITY
    --------------------------------------------------
  */

  const todayIncome =
    todayTransactions
      .filter(
        (transaction) =>
          transaction.type ===
          "Income"
      )
      .reduce(
        (total, transaction) =>
          total +
          Number(transaction.amount || 0),
        0
      );

  const todayExpenses =
    todayTransactions
      .filter(
        (transaction) =>
          transaction.type ===
          "Expense"
      )
      .reduce(
        (total, transaction) =>
          total +
          Number(transaction.amount || 0),
        0
      );

  const remainingToday =
    dailyBudget -
    todayExpenses;

  const todayExpensePercentage =
    dailyBudget > 0
      ? (todayExpenses /
          dailyBudget) *
        100
      : 0;

  const progressPercentage =
    Math.min(
      Math.max(
        todayExpensePercentage,
        0
      ),
      100
    );

  /*
    --------------------------------------------------
    SAVE BUDGET
    --------------------------------------------------
  */

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
      ...budgetData,
      amount,
      startDate:
        budgetData.startDate ||
        today,
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

  /*
    --------------------------------------------------
    CHANGE PERIOD
    --------------------------------------------------
  */

  const changePeriod = (period) => {
    const newBudgetData = {
      ...budgetData,
      period,
      startDate: today,
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

  /*
    --------------------------------------------------
    RESET BUDGET
    --------------------------------------------------
  */

  const resetBudget = () => {
    const confirmed =
      window.confirm(
        "Reset your current budget? Your transactions will not be deleted."
      );

    if (!confirmed) {
      return;
    }

    const resetData = {
      amount: "",
      period: "week",
      startDate: today,
      appliedTransactionIds: [],
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
      "Budget has been reset."
    );

    setTimeout(() => {
      setMessage("");
    }, 2500);
  };

  /*
    --------------------------------------------------
    APPLY TODAY'S ACTIVITY
    --------------------------------------------------
  */

  const applyToday = () => {
    const unappliedToday =
      todayTransactions.filter(
        (transaction) =>
          !appliedIds.includes(
            String(transaction.id)
          )
      );

    if (
      unappliedToday.length === 0
    ) {
      setMessage(
        "There is no new activity to apply."
      );

      return;
    }

    const newAppliedIds = [
      ...appliedIds,
      ...unappliedToday.map(
        (transaction) =>
          String(transaction.id)
      ),
    ];

    const newBudgetData = {
      ...budgetData,
      appliedTransactionIds:
        newAppliedIds,
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
      "Today's activity has been added to your totals."
    );

    setTimeout(() => {
      setMessage("");
    }, 2500);
  };

  /*
    --------------------------------------------------
    UNAPPLIED TODAY
    --------------------------------------------------
  */

  const unappliedToday =
    todayTransactions.filter(
      (transaction) =>
        !appliedIds.includes(
          String(transaction.id)
        )
    );

  /*
    --------------------------------------------------
    ALL TRANSACTIONS
    --------------------------------------------------
  */

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

  /*
    --------------------------------------------------
    CURRENCY
    --------------------------------------------------
  */

  const formatCurrency = (
    value
  ) => {
    return `₱${Number(
      value || 0
    ).toLocaleString(
      "en-PH",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  return (
    <div className="page-container">

      {/* PAGE HEADER */}

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
            daily spending, and stay within
            your budget.
          </p>

        </div>

      </div>


      {/* =================================================
          OVERALL FINANCIAL SUMMARY
      ================================================= */}

      <section className="financial-section">

        <div className="stat-card">

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
            Applied income minus applied expenses
          </p>

        </div>


        <div className="stat-card">

          <span className="stat-label">
            Total Expenses
          </span>

          <h2 className="expense-value">
            {formatCurrency(
              totalExpenses
            )}
          </h2>

          <p className="privacy-hint">
            Expenses already added to your totals
          </p>

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
              Set a budget for a week, two weeks,
              or a month. Your daily allowance is
              calculated automatically.
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
            onClick={
              saveBudget
            }
          >
            Save Budget
          </button>

        </div>


        {message && (
          <p className="budget-message">
            {message}
          </p>
        )}


        {/* BUDGET NUMBERS */}

        <div className="budget-dashboard-stats">

          <div>

            <span>
              Total Budget
            </span>

            <strong>
              {formatCurrency(
                allocatedBudget
              )}
            </strong>

          </div>


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


        {/* TODAY PROGRESS */}

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


          {remainingToday <
            0 && (

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


        {/* APPLY BUTTON */}

        <div className="budget-apply-section">

          <div>

            <strong>
              Today's Activity
            </strong>

            <p>
              {unappliedToday.length ===
              0
                ? "Everything has already been applied to your totals."
                : `${unappliedToday.length} transaction${
                    unappliedToday.length ===
                    1
                      ? ""
                      : "s"
                  } waiting to be applied.`}
            </p>

          </div>


          <button
            type="button"
            className="primary-button"
            onClick={
              applyToday
            }
            disabled={
              unappliedToday.length ===
              0
            }
          >
            Apply Today's Activity
          </button>

        </div>

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


          <div className="transaction-actions">

            <Link
              to="/add"
              className="primary-button"
            >
              + Add Transaction
            </Link>

          </div>

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


        {/* TRANSACTION LIST */}

        {filteredTransactions.length ===
        0 ? (

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
                (
                  transaction
                ) => (

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