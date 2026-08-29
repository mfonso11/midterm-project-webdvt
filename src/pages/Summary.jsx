import { useMemo } from "react";
import useTransactions from "../hooks/useTransactions";
import { useTheme } from "../context/ThemeContext";

const CATEGORIES = [
  "Food",
  "Transportation",
  "School",
  "Bills",
  "Shopping",
  "Entertainment",
  "Health",
  "Other",
];

function Summary() {
  const { transactions } = useTransactions();
  const { darkMode, toggleTheme } = useTheme();

  const expenseTransactions = useMemo(() => {
    return transactions.filter(
      (transaction) =>
        transaction.type === "Expense"
    );
  }, [transactions]);


  const totalExpenses = useMemo(() => {
    return expenseTransactions.reduce(
      (total, transaction) =>
        total + Number(transaction.amount),
      0
    );
  }, [expenseTransactions]);


  const categoryTotals = useMemo(() => {
    return CATEGORIES.map((category) => {

      const total = expenseTransactions
        .filter(
          (transaction) =>
            transaction.category === category
        )
        .reduce(
          (sum, transaction) =>
            sum + Number(transaction.amount),
          0
        );

      return {
        category,
        total,
      };

    }).filter((item) => item.total > 0);
  }, [expenseTransactions]);


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
    <div className="page-container">

      <div className="page-header">
        <div>
          <h1>Summary</h1>
          <p>
            See where your money is being spent.
          </p>
        </div>
      </div>


      {/* Theme */}

      <section className="theme-card">

        <div>
          <h2>Appearance</h2>

          <p>
            Switch between light and dark mode.
          </p>
        </div>

        <button
          className="theme-toggle"
          onClick={toggleTheme}
        >
          {darkMode
            ? "Switch to Light Mode"
            : "Switch to Dark Mode"}
        </button>

      </section>


      {/* Total */}

      <section className="summary-total-card">

        <span>
          Total Expenses
        </span>

        <h2>
          {formatCurrency(totalExpenses)}
        </h2>

      </section>


      {/* Spending Breakdown */}

      <section className="dashboard-section">

        <div className="section-header">
          <div>
            <h2>Spending Breakdown</h2>

            <p>
              Your expenses grouped by category.
            </p>
          </div>
        </div>


        {categoryTotals.length === 0 ? (

          <div className="empty-state">
            <h3>No expense data yet</h3>

            <p>
              Add an expense transaction to see
              your spending breakdown.
            </p>
          </div>

        ) : (

          <div className="summary-list">

            {categoryTotals.map((item) => {

              const percentage =
                totalExpenses > 0
                  ? (item.total /
                      totalExpenses) *
                    100
                  : 0;

              return (
                <div
                  className="summary-item"
                  key={item.category}
                >

                  <div className="summary-item-header">

                    <span>
                      {item.category}
                    </span>

                    <strong>
                      {formatCurrency(item.total)}
                    </strong>

                  </div>


                  <div className="progress-track">

                    <div
                      className="progress-bar"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />

                  </div>


                  <span className="summary-percentage">
                    {percentage.toFixed(1)}%
                  </span>

                </div>
              );

            })}

          </div>

        )}

      </section>

    </div>
  );
}

export default Summary;