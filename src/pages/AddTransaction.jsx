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

const ACTIVE_DATE_STORAGE_KEY =
  "budget-active-date";

/* =====================================================
   DATE
===================================================== */

function getLocalDate() {
  const date = new Date();

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getActiveDate() {
  try {
    const saved =
      localStorage.getItem(
        ACTIVE_DATE_STORAGE_KEY
      );

    return saved || getLocalDate();
  } catch {
    return getLocalDate();
  }
}

/* =====================================================
   COMPONENT
===================================================== */

function AddTransaction() {
  const navigate =
    useNavigate();

  const [searchParams] =
    useSearchParams();

  const {
    addTransaction,
  } = useTransactions();

  /* ===================================================
     TYPE
  =================================================== */

  const [type, setType] =
    useState(() =>
      searchParams.get("type") ===
      "Income"
        ? "Income"
        : "Expense"
    );

  /* ===================================================
     FORM
  =================================================== */

  const [title, setTitle] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [category, setCategory] =
    useState("");

  /*
    IMPORTANT:
    Automatically use the date currently
    being tracked by Dashboard.
  */
  const [date, setDate] =
    useState(() =>
      getActiveDate()
    );

  const [description, setDescription] =
    useState("");

  const [error, setError] =
    useState("");

  /* ===================================================
     URL TYPE
  =================================================== */

  useEffect(() => {
    const urlType =
      searchParams.get("type");

    if (
      urlType === "Income"
    ) {
      setType("Income");
    }

    if (
      urlType === "Expense"
    ) {
      setType("Expense");
    }
  }, [searchParams]);

  /* ===================================================
     SUBMIT
  =================================================== */

  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    setError("");

    /* -----------------------------------------------
       VALIDATION
    ------------------------------------------------ */

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

    const numericAmount =
      Number(amount);

    if (
      !Number.isFinite(
        numericAmount
      ) ||
      numericAmount <= 0
    ) {
      setError(
        "Amount must be greater than zero."
      );

      return;
    }

    /* -----------------------------------------------
       CREATE TRANSACTION
    ------------------------------------------------ */

    const newTransaction = {
      id:
        `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`,

      title:
        title.trim(),

      amount:
        numericAmount,

      category,

      /*
        YYYY-MM-DD

        This MUST match Dashboard's
        activeDate format.
      */
      date,

      description:
        description.trim(),

      type,
    };

    /* -----------------------------------------------
       SAVE
    ------------------------------------------------ */

    addTransaction(
      newTransaction
    );

    /*
      Go back to Dashboard.

      Dashboard will receive the transaction
      update through the shared event.
    */
    navigate("/");
  };

  /* ===================================================
     RENDER
  =================================================== */

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
            Quickly record your income or
            expenses.
          </p>

        </div>

      </div>

      {/* =================================================
          TYPE
      ================================================= */}

      <div className="transaction-type-selector">

        <button
          type="button"
          className={`type-choice income-choice ${
            type === "Income"
              ? "selected"
              : ""
          }`}
          onClick={() =>
            setType("Income")
          }
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
          onClick={() =>
            setType("Expense")
          }
        >

          <strong>
            − Expense
          </strong>

          <span>
            Money you spent
          </span>

        </button>

      </div>

      {/* =================================================
          FORM
      ================================================= */}

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
              setTitle(
                event.target.value
              )
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
              setAmount(
                event.target.value
              )
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
              setCategory(
                event.target.value
              )
            }
          >

            <option value="">
              Select a category
            </option>

            {categories.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              )
            )}

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
              setDate(
                event.target.value
              )
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
              setDescription(
                event.target.value
              )
            }
          />

        </div>

        {error && (
          <p className="form-error">
            {error}
          </p>
        )}

        {/* =================================================
            ACTIONS
        ================================================= */}

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