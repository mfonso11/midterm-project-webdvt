import { useMemo } from "react";
import { useTransactions } from "../hooks/useTransactions";
import { useTheme } from "../context/ThemeContext";

function Summary() {
  const { transactions } =
    useTransactions();

  const {
    theme,
    toggleTheme
  } = useTheme();


  /* =========================================
     EXPENSE SUMMARY
  ========================================= */

  const expenseSummary =
    useMemo(() => {

      const summary = {};

      transactions
        .filter(
          (transaction) =>
            transaction.type === "Expense"
        )
        .forEach((transaction) => {

          const category =
            transaction.category;

          if (!summary[category]) {
            summary[category] = 0;
          }

          summary[category] +=
            Number(transaction.amount);

        });

      return summary;

    }, [transactions]);


  const formatMoney = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP"
    }).format(amount);
  };


  return (
    <div className="summary-page">

      {/* =====================================
          PAGE HEADER
      ====================================== */}

      <div className="page-header">

        <div>

          <h1>
            Summary
          </h1>

          <p>
            See where your money is being
            spent.
          </p>

        </div>

      </div>


      {/* =====================================
          THEME SETTINGS
      ====================================== */}

      <section className="theme-card">

        <div className="theme-card-content">

          <div>

            <h2>
              Appearance
            </h2>

            <p>
              Choose how you want your budget
              tracker to look.
            </p>

          </div>


          <div className="theme-status">

            <span>
              Current theme
            </span>

            <strong>
              {theme === "light"
                ? "Light Mode"
                : "Dark Mode"}
            </strong>

          </div>

        </div>


        <button
          className="theme-toggle-large"
          onClick={toggleTheme}
        >
          {theme === "light"
            ? "Switch to Dark Mode"
            : "Switch to Light Mode"}
        </button>

      </section>


      {/* =====================================
          EXPENSE BREAKDOWN
      ====================================== */}

      <section>

        <div className="section-heading">

          <div>

            <h2>
              Spending by Category
            </h2>

            <p>
              Breakdown of your recorded
              expenses.
            </p>

          </div>

        </div>


        {Object.keys(expenseSummary)
          .length === 0 ? (

          <div className="empty-state">

            <h3>
              No expenses yet
            </h3>

            <p>
              Add some expense transactions
              to see your spending breakdown.
            </p>

          </div>

        ) : (

          <div className="summary-grid">

            {Object.entries(
              expenseSummary
            ).map(
              ([category, amount]) => (

                <div
                  className="summary-card"
                  key={category}
                >

                  <h3>
                    {category}
                  </h3>

                  <div className="amount">
                    {formatMoney(amount)}
                  </div>

                </div>

              )
            )}

          </div>

        )}

      </section>

    </div>
  );
}

export default Summary;
