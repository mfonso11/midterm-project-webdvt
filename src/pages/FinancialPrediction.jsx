import { useMemo, useState } from "react";

function FinancialPrediction() {

  const [budget, setBudget] =
    useState("");

  const [savings, setSavings] =
    useState("");

  const [expenses, setExpenses] =
    useState("");

  const [period, setPeriod] =
    useState(1);


  const multiplier =
    period === 1
      ? 1
      : period === 2
      ? 2
      : 4;


  const prediction = useMemo(() => {

    const budgetNumber =
      Number(budget) || 0;

    const savingsNumber =
      Number(savings) || 0;

    const expensesNumber =
      Number(expenses) || 0;


    const predictedBudget =
      budgetNumber * multiplier;

    const predictedExpenses =
      expensesNumber * multiplier;

    const predictedSavings =
      (budgetNumber -
        expensesNumber) *
      multiplier;


    return {
      predictedBudget,
      predictedExpenses,
      predictedSavings,
      savingsNumber,
    };

  }, [
    budget,
    savings,
    expenses,
    multiplier,
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


  return (
    <div className="page-card prediction-page">

      <div className="page-heading">

        <p className="page-label">
          FORECAST
        </p>

        <h1>
          Financial Prediction
        </h1>

        <p className="page-description">
          Estimate your future budget, expenses, and savings.
        </p>

      </div>


      <section className="prediction-input-section">

        <h2>
          Your Current Finances
        </h2>

        <p className="section-description">
          Enter values for one week so the tracker can estimate future amounts.
        </p>


        <div className="prediction-input-grid">

          <div className="form-group">

            <label>
              Current Budget *
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 1000"
              value={budget}
              onChange={(event) =>
                setBudget(
                  event.target.value
                )
              }
            />

            <small>
              Input one week's worth of budget.
            </small>

          </div>


          <div className="form-group">

            <label>
              Current Savings
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 500"
              value={savings}
              onChange={(event) =>
                setSavings(
                  event.target.value
                )
              }
            />

            <small>
              Enter how much you have saved today.
            </small>

          </div>


          <div className="form-group">

            <label>
              Current Expenses *
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 300"
              value={expenses}
              onChange={(event) =>
                setExpenses(
                  event.target.value
                )
              }
            />

            <small>
              Enter one week's worth of expenses.
            </small>

          </div>

        </div>

      </section>


      <section className="prediction-section">

        <h2>
          Prediction Period
        </h2>

        <div className="period-buttons">

          <button
            type="button"
            className={
              period === 1
                ? "period-button active"
                : "period-button"
            }
            onClick={() =>
              setPeriod(1)
            }
          >
            1 Week
          </button>

          <button
            type="button"
            className={
              period === 2
                ? "period-button active"
                : "period-button"
            }
            onClick={() =>
              setPeriod(2)
            }
          >
            2 Weeks
          </button>

          <button
            type="button"
            className={
              period === 4
                ? "period-button active"
                : "period-button"
            }
            onClick={() =>
              setPeriod(4)
            }
          >
            1 Month
          </button>

        </div>

      </section>


      <section className="prediction-section">

        <h2>
          Your Prediction
        </h2>

        <div className="prediction-grid">

          <div className="prediction-card">

            <span>
              Predicted Budget
            </span>

            <strong>
              {formatMoney(
                prediction.predictedBudget
              )}
            </strong>

            <small>
              Weekly budget × {multiplier}
            </small>

          </div>


          <div className="prediction-card">

            <span>
              Predicted Savings
            </span>

            <strong
              className={
                prediction.predictedSavings >= 0
                  ? "positive"
                  : "negative"
              }
            >
              {formatMoney(
                prediction.predictedSavings
              )}
            </strong>

            <small>
              (Budget − Expenses) × {multiplier}
            </small>

          </div>


          <div className="prediction-card">

            <span>
              Predicted Expenses
            </span>

            <strong className="negative">
              {formatMoney(
                prediction.predictedExpenses
              )}
            </strong>

            <small>
              Weekly expenses × {multiplier}
            </small>

          </div>

        </div>

      </section>

    </div>
  );
}

export default FinancialPrediction;