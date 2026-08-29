import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTransactions } from "../hooks/useTransactions";

function Dashboard() {
  const { transactions } = useTransactions();

  /* =========================================
     HIDE / SHOW FINANCIAL NUMBERS
  ========================================= */

  const [hideSavings, setHideSavings] = useState(false);
  const [hideExpenses, setHideExpenses] = useState(false);

  /* =========================================
     TRANSACTION FILTERS
  ========================================= */

  const [categoryFilter, setCategoryFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  /* =========================================
     FINANCIAL PREDICTION INPUTS
  ========================================= */

  const [currentBudget, setCurrentBudget] = useState("");
  const [currentSavings, setCurrentSavings] = useState("");
  const [currentExpenses, setCurrentExpenses] = useState("");

  const [period, setPeriod] = useState("1");

  /* =========================================
     TOTAL INCOME
  ========================================= */

  const totalIncome = useMemo(() => {
    return transactions
      .filter(
        (transaction) =>
          transaction.type === "Income"
      )
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount),
        0
      );
  }, [transactions]);

  /* =========================================
     TOTAL EXPENSES
  ========================================= */

  const totalExpenses = useMemo(() => {
    return transactions
      .filter(
        (transaction) =>
          transaction.type === "Expense"
      )
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount),
        0
      );
  }, [transactions]);

  /* =========================================
     TOTAL SAVINGS
  ========================================= */

  const totalSavings =
    totalIncome - totalExpenses;

  /* =========================================
     PREDICTION VALUES
  ========================================= */

  const budgetNumber =
    Number(currentBudget) || 0;

  const expensesNumber =
    Number(currentExpenses) || 0;

  /*
    1 Week  = 1
    2 Weeks = 2
    1 Month = 4
  */

  const multiplier =
    period === "1"
      ? 1
      : period === "2"
        ? 2
        : 4;

  const predictedBudget =
  budgetNumber * multiplier;

const predictedExpenses =
  expensesNumber * multiplier;

const predictedSavings =
  (budgetNumber - expensesNumber) * multiplier;

  /* =========================================
     ALL CATEGORIES
  ========================================= */

  const allCategories = [
    "Food",
    "Transportation",
    "School",
    "Entertainment",
    "Shopping",
    "Bills",
    "Health",
    "Salary",
    "Allowance",
    "Other"
  ];

  /* =========================================
     FILTER TRANSACTIONS
  ========================================= */

  const filteredTransactions =
    transactions.filter((transaction) => {
      const categoryMatch =
        categoryFilter === "All" ||
        transaction.category === categoryFilter;

      const typeMatch =
        typeFilter === "All" ||
        transaction.type === typeFilter;

      return categoryMatch && typeMatch;
    });

  /* =========================================
     FORMAT MONEY
  ========================================= */

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP"
    }).format(amount);
  };

  return (
    <div className="dashboard">

      {/* =====================================
          DASHBOARD HEADER
      ====================================== */}

      <div className="page-header">
        <div>
          <h1>Dashboard</h1>

          <p>
            Track your savings, expenses,
            predictions, and transactions.
          </p>
        </div>
      </div>


      {/* =====================================
          FINANCIAL OVERVIEW
      ====================================== */}

      <section>

        <div className="financial-grid">

          {/* TOTAL SAVINGS */}

          <div
            className="financial-card"
            onClick={() =>
              setHideSavings(!hideSavings)
            }
          >
            <h3>
              Total Savings
            </h3>

            <div
              className="amount"
              style={{
                color:
                  totalSavings >= 0
                    ? "green"
                    : "red"
              }}
            >
              {hideSavings
                ? "*****"
                : formatMoney(totalSavings)}
            </div>

            <small>
              Click to hide or show
            </small>
          </div>


          {/* TOTAL EXPENSES */}

          <div
            className="financial-card"
            onClick={() =>
              setHideExpenses(!hideExpenses)
            }
          >
            <h3>
              Total Expenses
            </h3>

            <div
              className="amount"
              style={{
                color: "red"
              }}
            >
              {hideExpenses
                ? "*****"
                : formatMoney(totalExpenses)}
            </div>

            <small>
              Click to hide or show
            </small>
          </div>

        </div>

      </section>


      {/* =====================================
          TRANSACTIONS
      ====================================== */}

      <section className="transactions-section">

        <div className="transactions-header">

          <div>
            <h2>
              Transactions
            </h2>

            <p>
              Select a transaction to view
              or edit its details.
            </p>
          </div>

        </div>


        {/* FILTERS */}

        <div className="filters">

          <div className="filter-group">

            <label>
              Category
            </label>

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(
                  event.target.value
                )
              }
            >
              <option value="All">
                All
              </option>

              {allCategories.map(
                (category) => (
                  <option
                    key={category}
                    value={category}
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
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(
                  event.target.value
                )
              }
            >
              <option value="All">
                All
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
              No transactions yet
            </h3>

            <p>
              Add a transaction to start
              tracking your finances.
            </p>

            <Link
              to="/add"
              className="primary-button"
            >
              Add Transaction
            </Link>

          </div>

        ) : (

          <div className="transactions-grid">

            {filteredTransactions.map(
              (transaction) => (

                <Link
                  key={transaction.id}
                  to={`/transaction/${transaction.id}`}
                  className="transaction-card"
                >

                  <div className="transaction-top">

                    <h3>
                      {transaction.title}
                    </h3>

                    <span
                      className={
                        transaction.type === "Income"
                          ? "income-label"
                          : "expense-label"
                      }
                    >
                      {transaction.type}
                    </span>

                  </div>


                  <div
                    className="transaction-amount"
                    style={{
                      color:
                        transaction.type === "Income"
                          ? "green"
                          : "red"
                    }}
                  >
                    {transaction.type === "Income"
                      ? "+"
                      : "-"}

                    {formatMoney(
                      Number(transaction.amount)
                    )}
                  </div>


                  <div className="transaction-details">

                    <p>
                      <strong>
                        Category:
                      </strong>{" "}
                      {transaction.category}
                    </p>

                    <p>
                      <strong>
                        Date:
                      </strong>{" "}
                      {transaction.date}
                    </p>

                  </div>

                </Link>

              )
            )}

          </div>

        )}

      </section>


      {/* =====================================
          FINANCIAL PREDICTION
      ====================================== */}

      <section className="prediction-section">

        <div className="section-heading">

          <div>

            <h2>
              Financial Prediction
            </h2>

            <p>
              Enter your current financial
              numbers to estimate your future
              savings and expenses.
            </p>

          </div>

        </div>


        {/* PREDICTION INPUTS */}

        <div className="prediction-input-grid">

          <div className="prediction-input-card">

            <label>
              Current Budget
            </label>

            <p className="input-description">
              Enter your budget for one week.
            </p>

            <input
              type="number"
              min="0"
              step="0.01"
              value={currentBudget}
              onChange={(event) =>
                setCurrentBudget(
                  event.target.value
                )
              }
              placeholder="Enter weekly budget"
            />

          </div>


          <div className="prediction-input-card">

            <label>
              Current Savings
            </label>

            <p className="input-description">
              Enter how much you have saved
              in total as of today.
            </p>

            <input
              type="number"
              min="0"
              step="0.01"
              value={currentSavings}
              onChange={(event) =>
                setCurrentSavings(
                  event.target.value
                )
              }
              placeholder="Enter current savings"
            />

          </div>


          <div className="prediction-input-card">

            <label>
              Current Expenses
            </label>

            <p className="input-description">
              Enter how much you have spent
              from your current budget.
            </p>

            <input
              type="number"
              min="0"
              step="0.01"
              value={currentExpenses}
              onChange={(event) =>
                setCurrentExpenses(
                  event.target.value
                )
              }
              placeholder="Enter current expenses"
            />

          </div>

        </div>


        {/* PREDICTION PERIOD */}

        <div className="prediction-period">

          <div>

            <h3>
              Prediction Period
            </h3>

            <p>
              Choose how far you want to
              project your current numbers.
            </p>

          </div>


          <div className="period-buttons">

            <button
              type="button"
              className={
                period === "1"
                  ? "period-button active"
                  : "period-button"
              }
              onClick={() =>
                setPeriod("1")
              }
            >
              1 Week
            </button>


            <button
              type="button"
              className={
                period === "2"
                  ? "period-button active"
                  : "period-button"
              }
              onClick={() =>
                setPeriod("2")
              }
            >
              2 Weeks
            </button>


            <button
              type="button"
              className={
                period === "4"
                  ? "period-button active"
                  : "period-button"
              }
              onClick={() =>
                setPeriod("4")
              }
            >
              1 Month
            </button>

          </div>

        </div>


        {/* PREDICTION RESULTS */}

        <div className="prediction-grid">

            {/* PREDICTED BUDGET */}

                <div className="prediction-card">

                    <h3>
                        Predicted Budget
                    </h3>

                    <div className="amount">
                        {formatMoney(predictedBudget)}
                    </div>

                <p className="prediction-note">
                    Weekly budget × {multiplier}
                </p>

        </div>


  {/* PREDICTED SAVINGS */}

  <div className="prediction-card">

    <h3>
      Predicted Savings
    </h3>

    <div
      className="amount"
      style={{
        color:
          predictedSavings >= 0
            ? "green"
            : "red"
      }}
    >
      {formatMoney(predictedSavings)}
    </div>

    <p className="prediction-note">
      (Budget − Expenses) × {multiplier}
    </p>

  </div>


  {/* PREDICTED EXPENSES */}

  <div className="prediction-card">

    <h3>
      Predicted Expenses
    </h3>

    <div
      className="amount"
      style={{
        color: "red"
      }}
    >
      {formatMoney(predictedExpenses)}
    </div>

    <p className="prediction-note">
      Weekly expenses × {multiplier}
    </p>

  </div>

</div>

      </section>

    </div>
  );
}

export default Dashboard;
