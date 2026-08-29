import { useMemo } from "react";
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

function Summary() {
  const { transactions } =
    useTransactions();

  const summary = useMemo(() => {
    const expenses =
      transactions.filter(
        (transaction) =>
          transaction.type === "Expense"
      );

    const totalExpenses =
      expenses.reduce(
        (total, transaction) =>
          total +
          Number(transaction.amount),
        0
      );

    const categoryTotals =
      categories.map((category) => {

        const total =
          expenses
            .filter(
              (transaction) =>
                transaction.category ===
                category
            )
            .reduce(
              (sum, transaction) =>
                sum +
                Number(transaction.amount),
              0
            );

        return {
          category,
          total,
          percentage:
            totalExpenses > 0
              ? (total /
                  totalExpenses) *
                100
              : 0,
        };
      })
      .filter(
        (item) => item.total > 0
      )
      .sort(
        (a, b) =>
          b.total - a.total
      );

    return {
      totalExpenses,
      categoryTotals,
    };
  }, [transactions]);

  const formatMoney = (amount) => {
    return `₱${Number(amount).toLocaleString(
      "en-PH",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  return (
    <div className="page-card summary-page">

      <div className="page-heading">

        <p className="page-label">
          ANALYTICS
        </p>

        <h1>
          Spending Summary
        </h1>

        <p className="page-description">
          See where your money is going.
        </p>

      </div>


      {/* TOTAL */}

      <div className="summary-total-card">

        <span>
          Total Expenses
        </span>

        <h2>
          {formatMoney(
            summary.totalExpenses
          )}
        </h2>

      </div>


      {summary.categoryTotals.length ===
      0 ? (

        <div className="empty-state">

          <h3>
            No spending data yet
          </h3>

          <p>
            Add some expense transactions to see your spending breakdown.
          </p>

        </div>

      ) : (

        <>

          {/* GRAPH */}

          <section className="summary-section">

            <h2>
              Spending Breakdown
            </h2>

            <div className="spending-chart">

              {summary.categoryTotals.map(
                (item) => (

                  <div
                    className="chart-row"
                    key={item.category}
                  >

                    <div className="chart-label">

                      <span>
                        {item.category}
                      </span>

                      <strong>
                        {item.percentage.toFixed(
                          1
                        )}
                        %
                      </strong>

                    </div>


                    <div className="chart-track">

                      <div
                        className="chart-fill"
                        style={{
                          width: `${item.percentage}%`,
                        }}
                      />

                    </div>

                  </div>

                )
              )}

            </div>

          </section>


          {/* CATEGORY CARDS */}

          <section className="summary-section">

            <h2>
              Categories
            </h2>

            <div className="category-summary-grid">

              {summary.categoryTotals.map(
                (item) => (

                  <div
                    className="category-summary-card"
                    key={item.category}
                  >

                    <span>
                      {item.category}
                    </span>

                    <strong>
                      {formatMoney(
                        item.total
                      )}
                    </strong>

                    <small>
                      {item.percentage.toFixed(
                        1
                      )}
                      % of expenses
                    </small>

                  </div>

                )
              )}

            </div>

          </section>

        </>

      )}

    </div>
  );
}

export default Summary;