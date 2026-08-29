import { useEffect, useState } from "react";

const STORAGE_KEY = "budget-transactions";

function useTransactions() {
  const [transactions, setTransactions] =
    useState(() => {
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
    setTransactions(
      (currentTransactions) => [
        ...currentTransactions,
        transaction,
      ]
    );
  };

  const updateTransaction = (
    idOrTransaction,
    updatedData
  ) => {
    setTransactions(
      (currentTransactions) =>
        currentTransactions.map(
          (transaction) => {
            if (
              typeof idOrTransaction ===
              "object"
            ) {
              return transaction.id ===
                idOrTransaction.id
                ? idOrTransaction
                : transaction;
            }

            return String(transaction.id) ===
              String(idOrTransaction)
              ? {
                  ...transaction,
                  ...updatedData,
                  id: transaction.id,
                }
              : transaction;
          }
        )
    );
  };

  const deleteTransaction = (id) => {
    setTransactions(
      (currentTransactions) =>
        currentTransactions.filter(
          (transaction) =>
            String(transaction.id) !==
            String(id)
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

export { useTransactions };

export default useTransactions;