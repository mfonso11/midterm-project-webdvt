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

function Dashboard() {
  const { transactions } = useTransactions();

  const [categoryFilter, setCategoryFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const [hiddenCards, setHiddenCards] = useState({
    savings: false,
    expenses: false,
  });

  const togglePrivacy = (card) => {
    setHiddenCards((current) => ({
      ...current,
      [card]: !current[card],
    }));
  };

  const totalIncome = useMemo(() => {
    return transactions
      .filter((transaction) => transaction.type === "Income")
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount),
        0
      );
  }, [transactions]);

  const totalExpenses = useMemo(() => {
    return transactions
      .filter((transaction) => transaction.type === "Expense")
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount),
        0
      );
  }, [transactions]);

  const totalSavings = totalIncome - totalExpenses;

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const categoryMatch =
        categoryFilter === "All" ||
        transaction.category === categoryFilter;

      const typeMatch =
        typeFilter === "All" ||
        transaction.type === typeFilter;

      return categoryMatch && typeMatch;
    });
  }, [transactions, categoryFilter, typeFilter]);

  const formatCurrency = (value) => {
    return `₱${Number(value).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="page-container dashboard-page">

      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>
            Keep track of your savings and expenses.
          </p>
        </div>
      </div>


      {/* Financial Overview */}

      <section className="financial-section">

        <div
          className="stat-card private-card"
          onClick={() => togglePrivacy("savings")}
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
              : formatCurrency(totalSavings)}
          </h2>

          <p className="privacy-hint">
            Click to hide/show
          </p>
        </div>


        <div
          className="stat-card private-card"
          onClick={() => togglePrivacy("expenses")}
          title="Click to hide or show amount"
        >
          <span className="stat-label">
            Total Expenses
          </span>

          <h2 className="expense-value">
            {hiddenCards.expenses
              ? "*****"
              : formatCurrency(totalExpenses)}
          </h2>

          <p className="privacy-hint">
            Click to hide/show
          </p>
        </div>

      </section>


      {/* Transactions */}

      <section className="dashboard-section transactions-section">

        <div className="section-header">
          <div>
            <h2>Transactions</h2>
            <p>
              View and manage your recent transactions.
            </p>
          </div>

          <Link
            to="/add-transaction"
            className="primary-button"
          >
            Add Transaction
          </Link>
        </div>


        {/* Filters */}

        <div className="filters">

          <div className="filter-group">
            <label>Category</label>

            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value)
              }
            >
              <option value="All">
                All Categories
              </option>

              {CATEGORIES.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>
          </div>


          <div className="filter-group">
            <label>Type</label>

            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value)
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


        {/* Transaction Cards */}

        {filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <h3>No transactions found</h3>
            <p>
              Add an income or expense to start
              tracking your finances.
            </p>

            <Link
              to="/add-transaction"
              className="secondary-button"
            >
              Add Your First Transaction
            </Link>
          </div>
        ) : (

          <div className="transaction-grid">

            {filteredTransactions.map((transaction) => (

              <Link
                key={transaction.id}
                to={`/transaction/${transaction.id}`}
                className="transaction-card"
              >

                <div className="transaction-card-top">

                  <h3>
                    {transaction.description}
                  </h3>

                  <span
                    className={
                      transaction.type === "Income"
                        ? "income-badge"
                        : "expense-badge"
                    }
                  >
                    {transaction.type}
                  </span>

                </div>


                <div className="transaction-amount">
                  {transaction.type === "Income"
                    ? "+"
                    : "-"}
                  {formatCurrency(transaction.amount)}
                </div>


                <div className="transaction-details">

                  <span>
                    {transaction.category}
                  </span>

                  <span>
                    {transaction.date}
                  </span>

                </div>

              </Link>

            ))}

          </div>

        )}

      </section>

    </div>
  );
}

export default Dashboard;