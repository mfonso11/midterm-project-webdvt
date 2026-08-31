import { useEffect, useState } from "react";

const STORAGE_KEY = "budget-transactions";
const UPDATE_EVENT = "budget-transactions-updated";

/* =====================================================
   LOAD TRANSACTIONS
===================================================== */

function loadTransactions() {
  try {
    const saved =
      localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return [];
    }

    const parsed =
      JSON.parse(saved);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch (error) {
    console.error(
      "Failed to load transactions:",
      error
    );

    return [];
  }
}

/* =====================================================
   SAVE TRANSACTIONS
===================================================== */

function saveTransactions(
  transactions
) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(transactions)
    );

    /*
      localStorage does not trigger the
      "storage" event in the same browser tab.

      This custom event keeps every component
      using this hook synchronized.
    */
    window.dispatchEvent(
      new Event(UPDATE_EVENT)
    );
  } catch (error) {
    console.error(
      "Failed to save transactions:",
      error
    );
  }
}

/* =====================================================
   HOOK
===================================================== */

function useTransactions() {
  const [transactions, setTransactions] =
    useState(() =>
      loadTransactions()
    );

  /* ===================================================
     SYNCHRONIZE ALL COMPONENTS
  =================================================== */

  useEffect(() => {
    const refreshTransactions = () => {
      setTransactions(
        loadTransactions()
      );
    };

    window.addEventListener(
      UPDATE_EVENT,
      refreshTransactions
    );

    window.addEventListener(
      "storage",
      refreshTransactions
    );

    return () => {
      window.removeEventListener(
        UPDATE_EVENT,
        refreshTransactions
      );

      window.removeEventListener(
        "storage",
        refreshTransactions
      );
    };
  }, []);

  /* ===================================================
     ADD
  =================================================== */

  const addTransaction = (
    transaction
  ) => {
    /*
      IMPORTANT:
      Always read the newest list from
      localStorage instead of relying on
      this component's possibly old state.
    */

    const currentTransactions =
      loadTransactions();

    const updatedTransactions = [
      ...currentTransactions,
      transaction,
    ];

    saveTransactions(
      updatedTransactions
    );

    setTransactions(
      updatedTransactions
    );
  };

  /* ===================================================
     UPDATE
  =================================================== */

  const updateTransaction = (
    idOrTransaction,
    updatedData
  ) => {
    const currentTransactions =
      loadTransactions();

    const updatedTransactions =
      currentTransactions.map(
        (transaction) => {

          /*
            Updating with a complete
            transaction object.
          */
          if (
            typeof idOrTransaction ===
            "object"
          ) {
            return (
              String(transaction.id) ===
              String(
                idOrTransaction.id
              )
                ? idOrTransaction
                : transaction
            );
          }

          /*
            Updating by ID + data.
          */
          return (
            String(transaction.id) ===
            String(idOrTransaction)
              ? {
                  ...transaction,
                  ...updatedData,
                  id: transaction.id,
                }
              : transaction
          );
        }
      );

    saveTransactions(
      updatedTransactions
    );

    setTransactions(
      updatedTransactions
    );
  };

  /* ===================================================
     DELETE
  =================================================== */

  const deleteTransaction = (
    id
  ) => {
    const currentTransactions =
      loadTransactions();

    const updatedTransactions =
      currentTransactions.filter(
        (transaction) =>
          String(transaction.id) !==
          String(id)
      );

    saveTransactions(
      updatedTransactions
    );

    setTransactions(
      updatedTransactions
    );
  };

  /* ===================================================
     DELETE ALL TRANSACTIONS FOR A DATE
     
     This is useful for Day Over.
     
     It performs ONE operation instead of
     repeatedly calling deleteTransaction().
  =================================================== */

  const deleteTransactionsForDate = (
    date
  ) => {
    const currentTransactions =
      loadTransactions();

    const updatedTransactions =
      currentTransactions.filter(
        (transaction) =>
          transaction.date !== date
      );

    saveTransactions(
      updatedTransactions
    );

    setTransactions(
      updatedTransactions
    );
  };

  return {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    deleteTransactionsForDate,
  };
}

export {
  useTransactions,
};

export default useTransactions;

