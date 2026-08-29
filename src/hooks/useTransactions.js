import { useState } from "react";

const STORAGE_KEY =
  "personal-budget-transactions";

export function useTransactions() {

  const [transactions, setTransactions] = useState(
    () => {
      try {

        const saved =
          localStorage.getItem(
            STORAGE_KEY
          );

        return saved
          ? JSON.parse(saved)
          : [];

      } catch {
        return [];
      }
    }
  );

  const saveTransactions = (updatedTransactions) => {

    setTransactions(
      updatedTransactions
    );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        updatedTransactions
      )
    );
  };

  const addTransaction = (transaction) => {

    const newTransaction = {
      ...transaction,
      id: Date.now().toString()
    };

    saveTransactions([
      ...transactions,
      newTransaction
    ]);
  };

  const updateTransaction = (
    id,
    updatedData
  ) => {

    const updatedTransactions =
      transactions.map(
        (transaction) =>
          transaction.id === id
            ? {
                ...transaction,
                ...updatedData
              }
            : transaction
      );

    saveTransactions(
      updatedTransactions
    );
  };

  const deleteTransaction = (id) => {

    const updatedTransactions =
      transactions.filter(
        (transaction) =>
          transaction.id !== id
      );

    saveTransactions(
      updatedTransactions
    );
  };

  return {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction
  };
}
