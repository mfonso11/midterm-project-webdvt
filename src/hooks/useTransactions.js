import { useEffect, useState } from "react";

const STORAGE_KEY = "budget-transactions";

function useTransactions() {
  const [transactions, setTransactions] = useState(() => {
    try {
      const savedTransactions =
        localStorage.getItem(STORAGE_KEY);

      return savedTransactions
        ? JSON.parse(savedTransactions)
        : [];
    } catch (error) {
      console.error(
        "Failed to load transactions:",
        error
      );

      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(transactions)
      );
    } catch (error) {
      console.error(
        "Failed to save transactions:",
        error
      );
    }
  }, [transactions]);


  const addTransaction = (transaction) => {
    setTransactions((currentTransactions) => [
      ...currentTransactions,
      transaction,
    ]);
  };


  const updateTransaction = (
    updatedTransaction
  ) => {
    setTransactions((currentTransactions) =>
      currentTransactions.map(
        (transaction) =>
          transaction.id ===
          updatedTransaction.id
            ? updatedTransaction
            : transaction
      )
    );
  };


  const deleteTransaction = (id) => {
    setTransactions((currentTransactions) =>
      currentTransactions.filter(
        (transaction) =>
          transaction.id !== id
      )
    );
  };


  return {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
}


/*
 * Export both ways.
 *
 * This allows pages using:
 *
 * import useTransactions from "..."
 *
 * AND:
 *
 * import { useTransactions } from "..."
 *
 * to work correctly.
 */

export { useTransactions };

export default useTransactions;