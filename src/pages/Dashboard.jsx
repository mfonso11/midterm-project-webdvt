import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import useTransactions from "../hooks/useTransactions";

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

const BUDGET_STORAGE_KEY = "dashboard-budget";

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

function Dashboard() {
  const { transactions } = useTransactions();

  const [categoryFilter, setCategoryFilter] =
    useState("All");

  const [typeFilter, setTypeFilter] =
    useState("All");

  const [hiddenCards, setHiddenCards] =
    useState({
      savings: false,
      expenses: false,
    });

  /*
    --------------------------------------------------
    BUDGET STATE
    --------------------------------------------------
  */

  const [budgetData, setBudgetData] = useState(() => {
    try {
      const saved =
        localStorage.getItem(
          BUDGET_STORAGE_KEY
        );

      return saved
        ? JSON.parse(saved)
        : null;
    } catch {
      return null;
    }
  });

  const [budgetAmount, setBudgetAmount] =
    useState(
      budgetData?.amount
        ? String(budgetData.amount)
        : ""
    );

  const [budgetPeriod, setBudgetPeriod] =
    useState(
      budgetData?.period || 1
    );

  const [budgetMessage, setBudgetMessage] =
    useState("");

  /*
    --------------------------------------------------
    PRIVACY
    --------------------------------------------------
  */

  const togglePrivacy = (card) => {
    setHiddenCards((current) => ({
      ...current,
      [card]: !current[card],
    }));
  };

  /*
    --------------------------------------------------
    TOTAL INCOME
    --------------------------------------------------
  */

  const totalIncome = useMemo(() => {
    return transactions
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
  }, [transactions]);

  /*
    --------------------------------------------------
    TOTAL EXPENSES
    --------------------------------------------------
  */

  const totalExpenses = useMemo(() => {
    return transactions
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
  }, [transactions]);

  /*
    --------------------------------------------------
    TOTAL SAVINGS
    --------------------------------------------------
  */

  const totalSavings =
    totalIncome - totalExpenses;

  /*
    --------------------------------------------------
    BUDGET CYCLE
    --------------------------------------------------
  */

  const budgetCycle = useMemo(() => {
    if (!budgetData) {
      return null;
    }

    const startDate = new Date(
      budgetData.startDate
    );

    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);

    endDate.setDate(
      endDate.getDate() +
        budgetData.days -
        1
    );

    endDate.setHours(
      23,
      59,
      59,
      999
    );

    const now = new Date();

    return {
      startDate,
      endDate,
      isActive:
        now >= startDate &&
        now <= endDate,
      isExpired:
        now > endDate,
    };
  }, [budgetData]);

  /*
    --------------------------------------------------
    TRANSACTIONS INSIDE CURRENT BUDGET CYCLE
    --------------------------------------------------
  */

  const budgetTransactions = useMemo(() => {
    if (
      !budgetData ||
      !budgetCycle
    ) {
      return [];
    }

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
          transactionDate >=
            budgetCycle.startDate &&
          transactionDate <=
            budgetCycle.endDate
        );
      }
    );
  }, [
    transactions,
    budgetData,
    budgetCycle,
  ]);

  /*
    --------------------------------------------------
    BUDGET EXPENSES
    --------------------------------------------------
  */

  const budgetExpenses = useMemo(() => {
    return budgetTransactions
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
  }, [budgetTransactions]);

  /*
    --------------------------------------------------
    BUDGET INCOME
    --------------------------------------------------
  */

  const budgetIncome = useMemo(() => {
    return budgetTransactions
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
  }, [budgetTransactions]);

  /*
    --------------------------------------------------
    REMAINING BUDGET
    --------------------------------------------------
  */

  const allocatedBudget =
    Number(budgetData?.amount) || 0;

  const remainingBudget =
    allocatedBudget -
    budgetExpenses +
    budgetIncome;

  /*
    --------------------------------------------------
    BUDGET PERCENTAGE
    --------------------------------------------------
    
    Percentage is based on actual expenses
    against the original allocated budget.
  */

  const budgetPercentage =
    allocatedBudget > 0
      ? (budgetExpenses /
          allocatedBudget) *
        100
      : 0;

  const progressPercentage =
    Math.min(
      Math.max(
        budgetPercentage,
        0
      ),
      100
    );

  /*
    --------------------------------------------------
    SAVE NEW BUDGET CYCLE
    --------------------------------------------------
  */

  const saveBudget = () => {
    const amount =
      Number(budgetAmount);

    if (!amount || amount <= 0) {
      setBudgetMessage(
        "Please enter a budget greater than zero."
      );

      return;
    }

    const selectedPeriod =
      PERIODS.find(
        (period) =>
          period.value ===
          Number(budgetPeriod)
      );

    if (!selectedPeriod) {
      return;
    }

    /*
      The cycle starts NOW.
      This is important because the budget
      period now has an actual meaning.
    */

    const startDate =
      new Date();

    startDate.setHours(
      0,
      0,
      0,
      0
    );

    const newBudget = {
      amount,
      period:
        selectedPeriod.value,
      days:
        selectedPeriod.days,
      startDate:
        startDate.toISOString(),
    };

    setBudgetData(
      newBudget
    );

    localStorage.setItem(
      BUDGET_STORAGE_KEY,
      JSON.stringify(
        newBudget
      )
    );

    setBudgetMessage(
      "Budget cycle saved successfully."
    );

    setTimeout(() => {
      setBudgetMessage("");
    }, 2500);
  };

  /*
    --------------------------------------------------
    CHANGE BUDGET PERIOD
    --------------------------------------------------
  */

  const handlePeriodChange = (
    value
  ) => {
    setBudgetPeriod(
      Number(value)
    );
  };

  /*
    --------------------------------------------------
    CURRENCY
    --------------------------------------------------
  */

  const formatCurrency = (
    value
  ) => {
    return `₱${Number(
      value
    ).toLocaleString(
      "en-PH",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  /*
    --------------------------------------------------
    DATE FORMAT
    --------------------------------------------------
  */

  const formatDate = (
    date
  ) => {
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
    FILTERED TRANSACTIONS
    --------------------------------------------------
  */

  const filteredTransactions =
    useMemo(() => {
      return transactions.filter(
        (transaction) => {
          const categoryMatch =
            categoryFilter ===
              "All" ||
            transaction.category ===
              categoryFilter;

          const typeMatch =
            typeFilter === "All" ||
            transaction.type ===
              typeFilter;

          return (
            categoryMatch &&
            typeMatch
          );
        }
      );
    }, [
      transactions,
      categoryFilter,
      typeFilter,
    ]);

  return (
    <div className="page-container dashboard-page">

      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <div className="page-header">

        <div>

          <h1>
            Dashboard
          </h1>

          <p>
            Keep track of your savings,
            expenses, and budget.
          </p>

        </div>

      </div>


      {/* ==================================================
          FINANCIAL SUMMARY
      ================================================== */}

      <section className="financial-section">

        <div
          className="stat-card private-card"
          onClick={() =>
            togglePrivacy(
              "savings"
            )
          }
          title="Click to hide or show amount"
        >

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
            {hiddenCards.savings
              ? "*****"
              : formatCurrency(
                  totalSavings
                )}
          </h2>

          <p className="privacy-hint">
            Click to hide/show
          </p>

        </div>


        <div
          className="stat-card private-card"
          onClick={() =>
            togglePrivacy(
              "expenses"
            )
          }
          title="Click to hide or show amount"
        >

          <span className="stat-label">
            Total Expenses
          </span>

          <h2 className="expense-value">
            {hiddenCards.expenses
              ? "*****"
              : formatCurrency(
                  totalExpenses
                )}
          </h2>

          <p className="privacy-hint">
            Click to hide/show
          </p>

        </div>

      </section>


      {/* ==================================================
          BUDGET TRACKER
      ================================================== */}

      <section className="dashboard-budget-card">

        <div className="budget-header">

          <div>

            <p className="page-label">
              BUDGET TRACKER
            </p>

            <h2>
              Manage Your Budget
            </h2>

            <p>
              Set a spending limit and
              track it automatically
              using your transactions.
            </p>

          </div>

        </div>


        {/* BUDGET SETUP */}

        <div className="dashboard-budget-setup">

          <div className="budget-field">

            <label>
              Budget Amount
            </label>

            <div className="budget-money-input">

              <span>
                ₱
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="2,000"
                value={
                  budgetAmount
                }
                onChange={(
                  event
                ) =>
                  setBudgetAmount(
                    event.target
                      .value
                  )
                }
              />

            </div>

          </div>


          <div className="budget-field">

            <label>
              Budget Period
            </label>

            <select
              value={
                budgetPeriod
              }
              onChange={(
                event
              ) =>
                handlePeriodChange(
                  event.target
                    .value
                )
              }
            >

              {PERIODS.map(
                (period) => (
                  <option
                    key={
                      period.value
                    }
                    value={
                      period.value
                    }
                  >
                    {
                      period.label
                    }
                  </option>
                )
              )}

            </select>

          </div>


          <button
            type="button"
            className="budget-save-button"
            onClick={
              saveBudget
            }
          >
            Save Budget
          </button>

        </div>


        {budgetMessage && (
          <p className="budget-message">
            {budgetMessage}
          </p>
        )}


        {/* NO BUDGET */}

        {!budgetData && (
          <div className="budget-empty-state">

            <strong>
              No budget cycle yet
            </strong>

            <p>
              Enter your budget,
              choose a period,
              and save it to begin
              tracking your spending.
            </p>

          </div>
        )}


        {/* ACTIVE / EXPIRED BUDGET */}

        {budgetData &&
          budgetCycle && (
            <div className="dashboard-budget-content">

              {/* PERIOD */}

              <div className="budget-cycle-info">

                <div>

                  <span>
                    Current Budget Cycle
                  </span>

                  <strong>
                    {
                      PERIODS.find(
                        (
                          period
                        ) =>
                          period.value ===
                          budgetData.period
                      )?.label
                    }
                  </strong>

                </div>


                <div>

                  <span>
                    Start Date
                  </span>

                  <strong>
                    {formatDate(
                      budgetCycle.startDate
                    )}
                  </strong>

                </div>


                <div>

                  <span>
                    End Date
                  </span>

                  <strong>
                    {formatDate(
                      budgetCycle.endDate
                    )}
                  </strong>

                </div>


                <div>

                  <span>
                    Status
                  </span>

                  <strong
                    className={
                      budgetCycle.isActive
                        ? "budget-active"
                        : "budget-expired"
                    }
                  >
                    {budgetCycle.isActive
                      ? "Active"
                      : "Expired"}
                  </strong>

                </div>

              </div>


              {/* EXPIRED MESSAGE */}

              {budgetCycle.isExpired && (
                <div className="budget-expired-message">

                  <strong>
                    Your budget cycle has ended.
                  </strong>

                  <p>
                    Save a new budget above
                    to start another cycle.
                  </p>

                </div>
              )}


              {/* BUDGET NUMBERS */}

              <div className="budget-stat-grid">

                <div className="budget-stat">

                  <span>
                    Budget
                  </span>

                  <strong>
                    {formatCurrency(
                      allocatedBudget
                    )}
                  </strong>

                </div>


                <div className="budget-stat">

                  <span>
                    Spent
                  </span>

                  <strong className="negative">
                    {formatCurrency(
                      budgetExpenses
                    )}
                  </strong>

                </div>


                <div className="budget-stat">

                  <span>
                    Income
                  </span>

                  <strong className="positive">
                    {formatCurrency(
                      budgetIncome
                    )}
                  </strong>

                </div>


                <div className="budget-stat">

                  <span>
                    Remaining
                  </span>

                  <strong
                    className={
                      remainingBudget >=
                      0
                        ? "positive"
                        : "negative"
                    }
                  >
                    {formatCurrency(
                      remainingBudget
                    )}
                  </strong>

                </div>

              </div>


              {/* PROGRESS */}

              <div className="budget-progress-section">

                <div className="budget-progress-header">

                  <div>

                    <strong>
                      Budget Used
                    </strong>

                    <span>
                      {budgetPercentage.toFixed(
                        1
                      )}
                      %
                    </span>

                  </div>

                </div>


                <div className="budget-progress-track">

                  <div
                    className={
                      budgetPercentage >
                      100
                        ? "budget-progress-bar over-budget"
                        : "budget-progress-bar"
                    }
                    style={{
                      width: `${progressPercentage}%`,
                    }}
                  />

                </div>


                <p>
                  {budgetPercentage <=
                  100
                    ? `${formatCurrency(
                        Math.max(
                          allocatedBudget -
                            budgetExpenses,
                          0
                        )
                      )} of your budget remains based on expenses.`
                    : `You have exceeded your budget by ${formatCurrency(
                        budgetExpenses -
                          allocatedBudget
                      )}.`}
                </p>

              </div>

            </div>
          )}

      </section>


      {/* ==================================================
          TRANSACTIONS
      ================================================== */}

      <section className="dashboard-section transactions-section">

        <div className="section-header">

          <div>

            <h2>
              Transactions
            </h2>

            <p>
              View and manage your
              recent transactions.
            </p>

          </div>


          <div className="transaction-actions">

            <Link
              to="/add?type=Income"
              className="primary-button income-button"
            >
              Add Income
            </Link>

            <Link
              to="/add?type=Expense"
              className="primary-button expense-button"
            >
              Add Expense
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
              onChange={(
                event
              ) =>
                setCategoryFilter(
                  event.target
                    .value
                )
              }
            >

              <option value="All">
                All Categories
              </option>

              {CATEGORIES.map(
                (
                  category
                ) => (
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
              onChange={(
                event
              ) =>
                setTypeFilter(
                  event.target
                    .value
                )
              }
            >

              <option value="All">
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


        {/* TRANSACTIONS */}

        {filteredTransactions.length ===
        0 ? (
          <div className="empty-state">

            <h3>
              No transactions found
            </h3>

            <p>
              Add an income or
              expense to start
              tracking your
              finances.
            </p>

            <div className="empty-state-actions">

              <Link
                to="/add?type=Income"
                className="secondary-button income-button"
              >
                Add Income
              </Link>

              <Link
                to="/add?type=Expense"
                className="secondary-button expense-button"
              >
                Add Expense
              </Link>

            </div>

          </div>
        ) : (
          <div className="transaction-grid">

            {filteredTransactions.map(
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
                      {
                        transaction.title ||
                        transaction.description
                      }
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

                    {transaction.type ===
                    "Income"
                      ? "+"
                      : "-"}

                    {formatCurrency(
                      transaction.amount
                    )}

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