import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

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

function TransactionDetail() {

  const { id } = useParams();

  const navigate = useNavigate();

  const {
    transactions,
    updateTransaction,
    deleteTransaction,
  } = useTransactions();


  const transaction =
    transactions.find(
      (item) =>
        String(item.id) ===
        String(id)
    );


  const [title, setTitle] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [type, setType] =
    useState("Expense");

  const [date, setDate] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [error, setError] =
    useState("");


  useEffect(() => {

    if (!transaction) {
      return;
    }

    setTitle(
      transaction.title ||
      transaction.description ||
      ""
    );

    setAmount(
      transaction.amount ?? ""
    );

    setCategory(
      transaction.category || ""
    );

    setType(
      transaction.type || "Expense"
    );

    setDate(
      transaction.date || ""
    );

    setDescription(
      transaction.description || ""
    );

    setError("");

  }, [transaction]);


  if (!transaction) {

    return (
      <div className="page-card">

        <div className="empty-state">

          <h2>
            Transaction not found
          </h2>

          <p>
            This transaction may have been
            deleted or no longer exists.
          </p>

          <button
            className="primary-button"
            onClick={() =>
              navigate("/")
            }
          >
            Back to Dashboard
          </button>

        </div>

      </div>
    );

  }


  const handleUpdate = (event) => {

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


    updateTransaction(
      id,
      {
        title: title.trim(),
        amount: Number(amount),
        category,
        type,
        date,
        description:
          description.trim(),
      }
    );

    navigate("/");

  };


  const handleDelete = () => {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this transaction?"
      );

    if (!confirmed) {
      return;
    }

    deleteTransaction(id);

    navigate("/");

  };


  return (
    <div className="page-card transaction-detail-page">

      <div className="page-heading">

        <div>

          <p className="page-label">
            TRANSACTION
          </p>

          <h1>
            Transaction Details
          </h1>

          <p className="page-description">
            View and edit this transaction.
          </p>

        </div>

      </div>


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
            Money received
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
            Money spent
          </span>

        </button>

      </div>


      <form
        className="transaction-form"
        onSubmit={handleUpdate}
      >

        <div className="form-group">

          <label>
            Transaction Name *
          </label>

          <input
            type="text"
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
            value={amount}
            onChange={(event) =>
              setAmount(
                event.target.value
              )
            }
            min="0"
            step="0.01"
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

            {CATEGORIES.map(
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
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value
              )
            }
            rows="4"
          />

        </div>


        {error && (
          <p className="form-error">
            {error}
          </p>
        )}


        <div className="form-actions">

          <button
            type="button"
            className="danger-button"
            onClick={handleDelete}
          >
            Delete
          </button>

          <button
            type="submit"
            className={`submit-button ${
              type === "Income"
                ? "submit-income"
                : "submit-expense"
            }`}
          >
            Save Changes
          </button>

        </div>

      </form>

    </div>
  );
}

export default TransactionDetail;