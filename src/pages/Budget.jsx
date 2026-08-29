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

  /*
    --------------------------------------------------
    LOAD SAVED BUDGET
    --------------------------------------------------
  */

  const [budgetData, setBudgetData] = useState(() => {
    try {
      const saved =
        localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        /*
          Older budget data may not have
          a startDate. In that case,
          start a new cycle today.
        */

        if (!parsed.startDate) {
          return {
            period: parsed.period || 4,
            amount: parsed.amount || "",
            startDate: new Date()
              .toISOString()
              .split("T")[0],
          };
        }

        return parsed;
      }

      return {
        period: 4,
        amount: "",
        startDate: new Date()
          .toISOString()
          .split("T")[0],
      };
    } catch {
      return {
        period: 4,
        amount: "",
        startDate: new Date()
          .toISOString()
          .split("T")[0],
      };
    }
  });

  const [budgetInput, setBudgetInput] =
    useState(budgetData.amount);

  const [savedMessage, setSavedMessage] =
    useState("");

  /*
    --------------------------------------------------
    SELECTED PERIOD
    --------------------------------------------------
  */

  const selectedPeriod =
    PERIODS.find(
      (period) =>
        period.value === budgetData.period
    ) || PERIODS[2];

  /*
    --------------------------------------------------
    START DATE
    --------------------------------------------------
  */

  const startDate = useMemo(() => {
    const date = new Date(
      `${budgetData.startDate}T00:00:00`
    );

    date.setHours(0, 0, 0, 0);

    return date;
  }, [budgetData.startDate]);

  /*
    --------------------------------------------------
    END DATE
    --------------------------------------------------
  */

  const endDate = useMemo(() => {
    const date = new Date(startDate);

    date.setDate(
      date.getDate() +
        selectedPeriod.days -
        1
    );

    date.setHours(23, 59, 59, 999);

    return date;
  }, [
    startDate,
    selectedPeriod.days,
  ]);

  /*
    --------------------------------------------------
    CURRENT DATE
    --------------------------------------------------
  */

  const today = useMemo(() => {
    const date = new Date();

    date.setHours(23, 59, 59, 999);

    return date;
  }, []);

  /*
    --------------------------------------------------
    TRANSACTIONS IN CURRENT BUDGET CYCLE
    --------------------------------------------------
  */

  const periodTransactions = useMemo(() => {
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
          transactionDate <= endDate &&
          transactionDate <= today
        );
      }
    );
  }, [
    transactions,
    startDate,
    endDate,
    today,
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
    BUDGET
    --------------------------------------------------
  */

  const allocatedBudget =
    Number(budgetData.amount) || 0;

  /*
    --------------------------------------------------
    REMAINING BUDGET
    --------------------------------------------------
  */

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
    CHECK IF CYCLE IS ACTIVE
    --------------------------------------------------
  */

  const cycleActive =
    today >= startDate &&
    today <= endDate;

  const cycleFinished =
    today > endDate;

  /*
    --------------------------------------------------
    SAVE BUDGET
    --------------------------------------------------
  */

  const saveBudget = () => {
    const amount = Number(budgetInput);

    if (!amount || amount <= 0) {
      setSavedMessage(
        "Please enter a budget greater than zero."
      );

      return;
    }

    /*
      Saving the budget starts
      a completely new cycle.
    */

    const newStartDate =
      new Date()
        .toISOString()
        .split("T")[0];

    const newBudgetData = {
      period: budgetData.period,
      amount,
      startDate: newStartDate,
    };

    setBudgetData(newBudgetData);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(newBudgetData)
    );

    setSavedMessage(
      "Budget saved. A new budget cycle has started."
    );

    setTimeout(() => {
      setSavedMessage("");
    }, 3000);
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
    };

    setBudgetData(newBudgetData);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(newBudgetData)
    );
  };

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

  /*
    --------------------------------------------------
    RENDER
    --------------------------------------------------
  */

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

          Budget cycle:
          {" "}

          <strong>
            {formatDate(startDate)}
            {" → "}
            {formatDate(endDate)}
          </strong>

        </p>

      </section>


      {/* CYCLE STATUS */}

      <section className="budget-card">

        <div className="budget-section-header">

          <div>

            <h2>
              Cycle Status
            </h2>

            <p>
              Your current budget cycle.
            </p>

          </div>

        </div>


        {cycleActive && (

          <p className="budget-status active-status">
            ● Budget cycle is currently active.
          </p>

        )}


        {cycleFinished && (

          <p className="budget-status finished-status">
            ● This budget cycle has ended.
            Save a new budget to start another cycle.
          </p>

        )}

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
              during this budget period.
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