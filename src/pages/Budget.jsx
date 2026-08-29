import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import useTransactions from "../hooks/useTransactions";

const STORAGE_KEY = "budget-allocation";

const PERIODS = [
  {
    value: 1,
    label: "1 Week",
    days: 7,
  },
  {
    value: 2,
    label: "2 Weeks",
    days: 14,
  },
  {
    value: 4,
    label: "1 Month",
    days: 30,
  },
];

function Budget() {
  const { transactions } = useTransactions();

  const [budgetData, setBudgetData] = useState(() => {
    try {
      const saved =
        localStorage.getItem(STORAGE_KEY);

      return saved
        ? JSON.parse(saved)
        : {
            period: 4,
            amount: "",
          };
    } catch {
      return {
        period: 4,
        amount: "",
      };
    }
  });

  const [budgetInput, setBudgetInput] =
    useState(budgetData.amount);

  const [savedMessage, setSavedMessage] =
    useState("");

  const selectedPeriod =
    PERIODS.find(
      (period) =>
        period.value === budgetData.period
    ) || PERIODS[2];

  const saveBudget = () => {
    const amount = Number(budgetInput);

    if (!amount || amount <= 0) {
      setSavedMessage(
        "Please enter a budget greater than zero."
      );

      return;
    }

    const newBudgetData = {
      period: budgetData.period,
      amount,
    };

    setBudgetData(newBudgetData);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(newBudgetData)
    );

    setSavedMessage(
      "Budget saved successfully."
    );

    setTimeout(() => {
      setSavedMessage("");
    }, 2500);
  };

  const changePeriod = (period) => {
    const newBudgetData = {
      ...budgetData,
      period,
    };

    setBudgetData(newBudgetData);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(newBudgetData)
    );
  };

  /*
    --------------------------------------------------
    DATE RANGE
    --------------------------------------------------
  */

  const startDate = useMemo(() => {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const start = new Date(today);

    start.setDate(
      start.getDate() -
        (selectedPeriod.days - 1)
    );

    return start;
  }, [selectedPeriod.days]);

  /*
    --------------------------------------------------
    TRANSACTIONS IN BUDGET PERIOD
    --------------------------------------------------
  */

  const periodTransactions = useMemo(() => {
    const today = new Date();

    today.setHours(23, 59, 59, 999);

    return transactions.filter(
      (transaction) => {
        if (!transaction.date) {
          return false;
        }

        const transactionDate =
          new Date(
            `${transaction.date}T00:00:00`
          );

        return (
          transactionDate >= startDate &&
          transactionDate <= today
        );
      }
    );
  }, [
    transactions,
    startDate,
  ]);

  /*
    --------------------------------------------------
    INCOME
    --------------------------------------------------
  */

  const totalIncome = useMemo(() => {
    return periodTransactions
      .filter(
        (transaction) =>
          transaction.type === "Income"
      )
      .reduce(
        (total, transaction) =>
          total +
          Number(transaction.amount),
        0
      );
  }, [periodTransactions]);

  /*
    --------------------------------------------------
    EXPENSES
    --------------------------------------------------
  */

  const totalExpenses = useMemo(() => {
    return periodTransactions
      .filter(
        (transaction) =>
          transaction.type === "Expense"
      )
      .reduce(
        (total, transaction) =>
          total +
          Number(transaction.amount),
        0
      );
  }, [periodTransactions]);

  /*
    --------------------------------------------------
    REMAINING BUDGET
    --------------------------------------------------
  */

  const allocatedBudget =
    Number(budgetData.amount) || 0;

  const remainingBudget =
    allocatedBudget -
    totalExpenses +
    totalIncome;

  /*
    --------------------------------------------------
    BUDGET USAGE
    --------------------------------------------------
  */

  const expensePercentage =
    allocatedBudget > 0
      ? (totalExpenses /
          allocatedBudget) *
        100
      : 0;

  const progressPercentage =
    Math.min(
      Math.max(expensePercentage, 0),
      100
    );

  /*
    --------------------------------------------------
    CURRENCY
    --------------------------------------------------
  */

  const formatCurrency = (value) => {
    return `₱${Number(value).toLocaleString(
      "en-PH",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  /*
    --------------------------------------------------
    DATE DISPLAY
    --------------------------------------------------
  */

  const formatDate = (date) => {
    return date.toLocaleDateString(
      "en-PH",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  return (
    <div className="page-container budget-page">

      {/* HEADER */}

      <div className="page-header">

        <div>

          <p className="page-label">
            BUDGET
          </p>

          <h1>
            Budget Allocation
          </h1>

          <p>
            Set your spending budget and track
            how much remains.
          </p>

        </div>

      </div>


      {/* PERIOD */}

      <section className="budget-card">

        <div className="budget-section-header">

          <div>

            <h2>
              Budget Period
            </h2>

            <p>
              Choose how long this budget should cover.
            </p>

          </div>

        </div>


        <div className="budget-period-buttons">

          {PERIODS.map((period) => (

            <button
              key={period.value}
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

          ))}

        </div>

        <p className="budget-date-range">

          Current period:
          {" "}
          <strong>
            {formatDate(startDate)}
            {" → "}
            {formatDate(new Date())}
          </strong>

        </p>

      </section>


      {/* SET BUDGET */}

      <section className="budget-card">

        <div className="budget-section-header">

          <div>

            <h2>
              Set Your Budget
            </h2>

            <p>
              Enter the amount you plan to spend
              during this period.
            </p>

          </div>

        </div>


        <div className="budget-input-row">

          <div className="budget-input-group">

            <label>
              Allocated Budget
            </label>

            <div className="budget-input-wrapper">

              <span>
                ₱
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="35,000"
                value={budgetInput}
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
            className="submit-button submit-income budget-save-button"
            onClick={saveBudget}
          >
            Save Budget
          </button>

        </div>


        {savedMessage && (
          <p className="budget-message">
            {savedMessage}
          </p>
        )}

      </section>


      {/* BUDGET SUMMARY */}

      <section className="budget-summary-grid">

        <div className="budget-stat-card">

          <span>
            Allocated Budget
          </span>

          <strong>
            {formatCurrency(
              allocatedBudget
            )}
          </strong>

        </div>


        <div className="budget-stat-card">

          <span>
            Expenses
          </span>

          <strong className="negative">
            {formatCurrency(
              totalExpenses
            )}
          </strong>

        </div>


        <div className="budget-stat-card">

          <span>
            Income Added
          </span>

          <strong className="positive">
            {formatCurrency(
              totalIncome
            )}
          </strong>

        </div>


        <div className="budget-stat-card remaining-budget-card">

          <span>
            Remaining Budget
          </span>

          <strong
            className={
              remainingBudget >= 0
                ? "positive"
                : "negative"
            }
          >
            {formatCurrency(
              remainingBudget
            )}
          </strong>

        </div>

      </section>


      {/* PROGRESS */}

      <section className="budget-card">

        <div className="budget-section-header">

          <div>

            <h2>
              Budget Usage
            </h2>

            <p>
              {expensePercentage.toFixed(1)}%
              {" "}
              of your allocated budget has been spent.
            </p>

          </div>

          <strong className="budget-percentage">
            {expensePercentage.toFixed(1)}%
          </strong>

        </div>


        <div className="budget-progress-track">

          <div
            className={
              expensePercentage > 100
                ? "budget-progress-bar over-budget"
                : "budget-progress-bar"
            }
            style={{
              width: `${progressPercentage}%`,
            }}
          />

        </div>


        {remainingBudget < 0 && (
          <p className="budget-warning">
            You have exceeded your allocated budget
            by{" "}
            {formatCurrency(
              Math.abs(remainingBudget)
            )}
            .
          </p>
        )}

      </section>


      {/* ACTIVITY */}

      <section className="budget-card">

        <div className="budget-section-header">

          <div>

            <h2>
              Budget Activity
            </h2>

            <p>
              Income and expenses recorded during
              this budget period.
            </p>

          </div>

        </div>


        {periodTransactions.length === 0 ? (

          <div className="budget-empty">

            <h3>
              No activity yet
            </h3>

            <p>
              Add an income or expense to start
              tracking this budget.
            </p>

            <div className="budget-actions">

              <Link
                to="/add?type=Income"
                className="secondary-button income-button"
              >
                + Add Income
              </Link>

              <Link
                to="/add?type=Expense"
                className="secondary-button expense-button"
              >
                − Add Expense
              </Link>

            </div>

          </div>

        ) : (

          <div className="budget-activity-list">

            {periodTransactions
              .slice()
              .reverse()
              .map(
                (transaction) => (

                  <Link
                    key={transaction.id}
                    to={`/transaction/${transaction.id}`}
                    className="budget-activity-item"
                  >

                    <div>

                      <strong>
                        {transaction.title ||
                          transaction.description}
                      </strong>

                      <span>
                        {transaction.category}
                        {" • "}
                        {transaction.date}
                      </span>

                    </div>


                    <strong
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
                    </strong>

                  </Link>

                )
              )}

          </div>

        )}

      </section>


      {/* QUICK ACTIONS */}

      <section className="budget-quick-actions">

        <Link
          to="/add?type=Income"
          className="primary-button income-button"
        >
          + Add Income
        </Link>

        <Link
          to="/add?type=Expense"
          className="primary-button expense-button"
        >
          − Add Expense
        </Link>

      </section>

    </div>
  );
}

export default Budget;