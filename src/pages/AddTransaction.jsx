import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTransactions } from "../hooks/useTransactions";

function AddTransaction() {
  const navigate = useNavigate();

  const { addTransaction } =
    useTransactions();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] =
    useState("");

  const categories = [
    "Food",
    "Transportation",
    "School",
    "Entertainment",
    "Shopping",
    "Bills",
    "Health",
    "Salary",
    "Allowance",
    "Other"
  ];

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      !title ||
      !amount ||
      !category ||
      !type ||
      !date
    ) {
      alert(
        "Please complete all required fields."
      );

      return;
    }

    const newTransaction = {
      id: Date.now().toString(),
      title,
      amount: Number(amount),
      category,
      type,
      date,
      description
    };

    addTransaction(newTransaction);

    navigate("/");
  };

  return (
    <div className="add-transaction-page">

      <div className="page-header">

        <div>

          <h1>
            Add Transaction
          </h1>

          <p>
            Record your income or expenses
            to keep your budget up to date.
          </p>

        </div>

      </div>


      <div className="form-container add-transaction-form">

        <form
          onSubmit={handleSubmit}
        >

          {/* TITLE */}

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
              placeholder="e.g. Grocery shopping"
              required
            />

          </div>


          {/* AMOUNT */}

          <div className="form-group">

            <label>
              Amount *
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) =>
                setAmount(
                  event.target.value
                )
              }
              placeholder="Enter amount"
              required
            />

          </div>


          {/* CATEGORY */}

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
              required
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


          {/* TYPE */}

          <div className="form-group">

            <label>
              Type *
            </label>

            <select
              value={type}
              onChange={(event) =>
                setType(
                  event.target.value
                )
              }
              required
            >

              <option value="">
                Select transaction type
              </option>

              <option value="Income">
                Income
              </option>

              <option value="Expense">
                Expense
              </option>

            </select>

          </div>


          {/* DATE */}

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
              required
            />

          </div>


          {/* DESCRIPTION */}

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
              placeholder="Add additional details..."
            />

          </div>


          {/* BUTTONS */}

          <div className="form-actions">

            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                navigate("/")
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button add-submit-button"
            >
              Add Transaction
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default AddTransaction;
