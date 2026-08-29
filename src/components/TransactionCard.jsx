import { Link } from "react-router-dom";

function TransactionCard({ transaction }) {
  const formattedAmount =
    Number(transaction.amount).toLocaleString(
      "en-PH",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  return (
    <Link
      to={`/transaction/${transaction.id}`}
      className="transaction-card"
    >
      <div className="transaction-card-top">
        <h3>
          {transaction.title ||
            transaction.description}
        </h3>

        <span
          className={
            transaction.type === "Income"
              ? "income-badge"
              : "expense-badge"
          }
        >
          {transaction.type}
        </span>
      </div>

      <div className="transaction-amount">
        {transaction.type === "Income"
          ? "+"
          : "-"}
        ₱{formattedAmount}
      </div>

      <div className="transaction-details">
        <span>
          {transaction.category}
        </span>

        <span>
          {transaction.date}
        </span>
      </div>
    </Link>
  );
}

export default TransactionCard;