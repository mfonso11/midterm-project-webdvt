import {
  useState,
  useEffect
} from "react";

import {
  useNavigate,
  useParams
} from "react-router-dom";

import { useTransactions } from "../hooks/useTransactions";

function TransactionDetail() {

  const {
    id
  } = useParams();

  const navigate = useNavigate();

  const {
    transactions,
    updateTransaction,
    deleteTransaction
  } = useTransactions();

  const transaction =
    transactions.find(
      (item) =>
        item.id === id
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

  useEffect(() => {

    if (transaction) {

      setTitle(
        transaction.title
      );

      setAmount(
        transaction.amount
      );

      setCategory(
        transaction.category
      );

      setType(
        transaction.type
      );

      setDate(
        transaction.date
      );

      setDescription(
        transaction.description || ""
      );

    }

  }, [transaction]);

  if (!transaction) {

    return (
      <div className="empty-state">

        <h2>
          Transaction not found
        </h2>

        <button
          className="primary-button"
          onClick={() =>
            navigate("/")
          }
        >
          Back to Dashboard
        </button>

      </div>
    );
  }

  const handleUpdate = (
    event
  ) => {

    event.preventDefault();

    if (
      !title ||
      !amount ||
      !category ||
      !date
    ) {
      return;
    }

    updateTransaction(
      id,
      {
        title,
        amount: Number(amount),
        category,
        type,
        date,
        description
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
    <div className="transaction-page">

      <div className="page-header">

        <div>

          <h1>
            Transaction Details
          </h1>

          <p>
            View and edit this transaction.
          </p>

        </div>

      </div>

      <div className="form-container">

        <form
          onSubmit={handleUpdate}
        >

          <div className="form-group">

            <label>
              Title
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
              Amount
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
              Category
            </label>

            <select
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value
                )
              }
            >

              <option value="Food">
                Food
              </option>

              <option value="Transportation">
                Transportation
              </option>

              <option value="Bills">
                Bills
              </option>

              <option value="Shopping">
                Shopping
              </option>

              <option value="Entertainment">
                Entertainment
              </option>

              <option value="Salary">
                Salary
              </option>

              <option value="Other">
                Other
              </option>

            </select>

          </div>

          <div className="form-group">

            <label>
              Type
            </label>

            <select
              value={type}
              onChange={(event) =>
                setType(
                  event.target.value
                )
              }
            >

              <option value="Expense">
                Expense
              </option>

              <option value="Income">
                Income
              </option>

            </select>

          </div>

          <div className="form-group">

            <label>
              Date
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
              className="primary-button"
            >
              Save Changes
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default TransactionDetail;
