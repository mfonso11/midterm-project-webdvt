import { Link } from "react-router-dom";

function TransactionCard({ transaction }) {
  return (
    <Link
      to={`/transaction/${transaction.id}`}
      className="transaction-card"
    >
      <div>
        <h3>{transaction.description}</h3>
        <p>
          {transaction.category} • {transaction.date}
        </p>
      </div>

      <strong
        className={
          transaction.type === "income"
            ? "income"
            : "expense"
        }
      >
        {transaction.type === "income" ? "+" : "-"}₱
        {Number(transaction.amount).toLocaleString()}
      </strong>
    </Link>
  );
}

export default TransactionCard;