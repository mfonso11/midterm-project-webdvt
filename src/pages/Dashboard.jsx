import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import useTransactions from "../hooks/useTransactions";
import TransactionCard from "../components/TransactionCard";

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
  const { transactions } =
    useTransactions();

  const [categoryFilter, setCategoryFilter] =
    useState("All");

  const [typeFilter, setTypeFilter] =
    useState("All");

  const [hiddenCards, setHiddenCards] =
    useState({
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

  const totalSavings =
    totalIncome - totalExpenses;

  const filteredTransactions =
    useMemo(() => {
      return transactions.filter(
        (transaction) => {
          const categoryMatch =
            categoryFilter === "All" ||
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

  const formatCurrency = (value) => {
    return `₱${Number(value).toLocaleString(
      "en-PH",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  return (
    <div className="page-container dashboard-page">
      <div className="page-header">
        <div>
          <h1>
            Dashboard
          </h1>

          <p>
            Keep track of your savings and expenses.
          </p>
        </div>
      </div>

      <section className="financial-section">
        <div
          className="stat-card private-card"
          onClick={() =>
            togglePrivacy("savings")
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
            togglePrivacy("expenses")
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

      <section className="dashboard-section transactions-section">
        <div className="section-header">
          <div>
            <h2>
              Transactions
            </h2>

            <p>
              View and manage your recent transactions.
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
                All Categories
              </option>

              {CATEGORIES.map(
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

        {filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <h3>
              No transactions found
            </h3>

            <p>
              Add an income or expense to start
              tracking your finances.
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
              (transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                />
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;