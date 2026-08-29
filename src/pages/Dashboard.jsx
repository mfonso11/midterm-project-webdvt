import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useTransactions from "../hooks/useTransactions";

const categories = [
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
  const { transactions, deleteTransaction } = useTransactions();

  const [categoryFilter, setCategoryFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  /*
   * PERFORMANCE OPTIMIZATION
   *
   * These calculations are only performed again when
   * the transaction data actually changes.
   */
  const totals = useMemo(() => {
    const income = transactions
      .filter((transaction) => transaction.type === "Income")
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount),
        0
      );

    const expenses = transactions
      .filter((transaction) => transaction.type === "Expense")
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount),
        0
      );

    return {
      income,
      expenses,
      balance: income - expenses,
    };
  }, [transactions]);

  /*
   * FILTERED TRANSACTIONS
   *
   * useMemo prevents unnecessary filtering when
   * unrelated state changes.
   */
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
  }, [
    transactions,
    categoryFilter,
    typeFilter,
  ]);

  const formatMoney = (amount) => {
    return `₱${Number(amount).toLocaleString(
      "en-PH",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (confirmDelete) {
      deleteTransaction(id);
    }
  };

  return (
    <div className="page-card dashboard-page">

      <div className="page-heading">
        <div>
          <p className="page-label">OVERVIEW</p>

          <h1>Dashboard</h1>

          <p className="page-description">
            Keep track of your current finances and recent transactions.
          </p>
        </div>
      </div>


      {/* =========================
          FINANCIAL OVERVIEW
      ========================== */}

      <section className="dashboard-section">

        <div className="financial-grid">

          <div className="financial-card savings-card">
            <span className="financial-label">
              Total Savings
            </span>

            <h2 className="financial-value">
              {formatMoney(totals.balance)}
            </h2>

            <p>
              Income minus expenses
            </p>
          </div>


          <div className="financial-card expense-card">
            <span className="financial-label">
              Total Expenses
            </span>

            <h2 className="financial-value expense-text">
              {formatMoney(totals.expenses)}
            </h2>

            <p>
              Total money spent
            </p>
          </div>


          <div className="financial-card balance-card">
            <span className="financial-label">
              Current Balance
            </span>

            <h2
              className={`financial-value ${
                totals.balance >= 0
                  ? "positive"
                  : "negative"
              }`}
            >
              {formatMoney(totals.balance)}
            </h2>

            <p>
              Available after expenses
            </p>
          </div>

        </div>

      </section>


      {/* =========================
          TRANSACTIONS
      ========================== */}

      <section className="dashboard-section">

        <div className="section-header">

          <div>
            <h2>Transactions</h2>

            <p>
              View and manage your recent transactions.
            </p>
          </div>

          <div className="transaction-actions">

            <Link
              to="/add?type=Income"
              className="action-button income-button"
            >
              + Add Income
            </Link>

            <Link
              to="/add?type=Expense"
              className="action-button expense-button"
            >
              − Add Expense
            </Link>

          </div>

        </div>


        {/* FILTERS */}

        <div className="filter-container">

          <div className="filter-group">

            <label>
              Category
            </label>

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
            >
              <option value="All">
                All Categories
              </option>

              {categories.map((category) => (
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

            <label>
              Type
            </label>

            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(event.target.value)
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


        {/* TRANSACTION LIST */}

        {filteredTransactions.length === 0 ? (

          <div className="empty-state">

            <h3>
              No transactions found
            </h3>

            <p>
              Add an income or expense to start tracking your finances.
            </p>

            <div className="empty-actions">

              <Link
                to="/add?type=Income"
                className="action-button income-button"
              >
                + Add Income
              </Link>

              <Link
                to="/add?type=Expense"
                className="action-button expense-button"
              >
                − Add Expense
              </Link>

            </div>

          </div>

        ) : (

          <div className="transaction-grid">

            {filteredTransactions.map(
              (transaction) => (

                <div
                  className="transaction-card"
                  key={transaction.id}
                >

                  <Link
                    to={`/transaction/${transaction.id}`}
                    className="transaction-main"
                  >

                    <div className="transaction-top">

                      <h3>
                        {transaction.title}
                      </h3>

                      <span
                        className={`transaction-amount ${
                          transaction.type === "Income"
                            ? "positive"
                            : "negative"
                        }`}
                      >
                        {transaction.type === "Income"
                          ? "+"
                          : "-"}
                        {formatMoney(
                          transaction.amount
                        )}
                      </span>

                    </div>


                    <div className="transaction-info">

                      <span>
                        {transaction.category}
                      </span>

                      <span>
                        {transaction.date}
                      </span>

                      <span
                        className={
                          transaction.type ===
                          "Income"
                            ? "income-badge"
                            : "expense-badge"
                        }
                      >
                        {transaction.type}
                      </span>

                    </div>


                    {transaction.description && (
                      <p className="transaction-description">
                        {transaction.description}
                      </p>
                    )}

                  </Link>


                  <button
                    className="delete-small-button"
                    onClick={() =>
                      handleDelete(transaction.id)
                    }
                    aria-label="Delete transaction"
                  >
                    Delete
                  </button>

                </div>

              )
            )}

          </div>

        )}

      </section>

    </div>
  );
}

export default Dashboard;