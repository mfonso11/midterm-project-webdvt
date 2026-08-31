import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

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

const SCROLL_POSITION_STORAGE_KEY =
  "budget-dashboard-scroll-position";

function AddTransaction() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { addTransaction } = useTransactions();

  const [type, setType] = useState(
    searchParams.get("type") === "Income"
      ? "Income"
      : "Expense"
  );

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const urlType = searchParams.get("type");

    if (urlType === "Income") {
      setType("Income");
    } else if (urlType === "Expense") {
      setType("Expense");
    }
  }, [searchParams]);

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");

    if (
      !title.trim() ||
      !amount ||
      !category ||
      !date
    ) {
      setError(
        "Please complete all required fields."
      );

      return;
    }

    if (Number(amount) <= 0) {
      setError(
        "Amount must be greater than zero."
      );

      return;
    }

    const newTransaction = {
      id: Date.now().toString(),
      title: title.trim(),
      amount: Number(amount),
      category,
      date,
      description: description.trim(),
      type,
    };

    /*
      Keep the dashboard's current scroll position.

      This allows the dashboard to restore the exact
      area where the user was before opening this page.
    */
    const currentScrollPosition = {
      x: window.scrollX,
      y: window.scrollY,
    };

    sessionStorage.setItem(
      SCROLL_POSITION_STORAGE_KEY,
      JSON.stringify(
        currentScrollPosition
      )
    );

    addTransaction(newTransaction);

    navigate("/");
  };

  return (
    <div className="page-card add-page">

      <div className="page-heading">

        <div>

          <p className="page-label">
            TRANSACTION
          </p>

          <h1>
            Add Transaction
          </h1>

          <p className="page-description">
            Quickly record your income or expenses.
          </p>

        </div>

      </div>

      {/* Transaction Type */}

      <div className="transaction-type-selector">

        <button
          type="button"
          className={`type-choice income-choice ${
            type === "Income"
              ? "selected"
              : ""
          }`}
          onClick={() => setType("Income")}
        >
          <strong>
            + Income
          </strong>

          <span>
            Money you received
          </span>
        </button>

        <button
          type="button"
          className={`type-choice expense-choice ${
            type === "Expense"
              ? "selected"
              : ""
          }`}
          onClick={() => setType("Expense")}
        >
          <strong>
            − Expense
          </strong>

          <span>
            Money you spent
          </span>
        </button>

      </div>

      {/* Form */}

      <form
        className="transaction-form"
        onSubmit={handleSubmit}
      >

        <div className="form-group">

          <label>
            Transaction Name *
          </label>

          <input
            type="text"
            placeholder="e.g. Lunch, Salary, Allowance"
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
          />

        </div>

        <div className="form-group">

          <label>
            Amount *
          </label>

          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(event) =>
              setAmount(event.target.value)
            }
          />

        </div>

        <div className="form-group">

          <label>
            Category *
          </label>

          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value)
            }
          >

            <option value="">
              Select a category
            </option>

            {categories.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}

          </select>

        </div>

        <div className="form-group">

          <label>
            Date *
          </label>

          <input
            type="date"
            value={date}
            onChange={(event) =>
              setDate(event.target.value)
            }
          />

        </div>

        <div className="form-group">

          <label>
            Description
          </label>

          <textarea
            placeholder="Optional description"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
          />

        </div>

        {error && (
          <p className="form-error">
            {error}
          </p>
        )}

        {/* Form Actions */}

        <div className="form-actions">

          <Link
            to="/"
            className="secondary-button"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className={`submit-button ${
              type === "Income"
                ? "submit-income"
                : "submit-expense"
            }`}
          >
            Save {type}
          </button>

        </div>

      </form>

    </div>
  );
}

export default AddTransaction;