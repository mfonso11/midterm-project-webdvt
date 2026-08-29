import { useState } from "react";

function Calculator() {

  const [expression, setExpression] =
    useState("");

  const [result, setResult] =
    useState("");

  const [justCalculated, setJustCalculated] =
    useState(false);

  const handleNumber = (number) => {

    if (justCalculated) {

      setExpression(
        String(number)
      );

      setResult("");

      setJustCalculated(false);

      return;
    }

    setExpression(
      (current) =>
        current + String(number)
    );
  };

  const handleDecimal = () => {

    if (justCalculated) {

      setExpression("0.");

      setResult("");

      setJustCalculated(false);

      return;
    }

    const parts =
      expression.split(
        /[+\-×÷]/
      );

    const currentNumber =
      parts[parts.length - 1];

    if (
      currentNumber.includes(".")
    ) {
      return;
    }

    if (
      expression === "" ||
      /[+\-×÷]$/.test(expression)
    ) {

      setExpression(
        (current) =>
          current + "0."
      );

      return;
    }

    setExpression(
      (current) =>
        current + "."
    );
  };

  const handleOperator = (
    operator
  ) => {

    if (result === "Error") {
      return;
    }

    if (justCalculated) {

      setExpression(
        result + operator
      );

      setResult("");

      setJustCalculated(false);

      return;
    }

    if (expression === "") {
      return;
    }

    if (
      /[+\-×÷]$/.test(expression)
    ) {

      setExpression(
        expression.slice(0, -1) +
          operator
      );

      return;
    }

    setExpression(
      expression + operator
    );
  };

  const handleEquals = () => {

    if (expression === "") {
      return;
    }

    if (
      /[+\-×÷]$/.test(expression)
    ) {
      return;
    }

    try {

      const mathematicalExpression =
        expression
          .replace(/×/g, "*")
          .replace(/÷/g, "/");

      const calculatedResult =
        Function(
          `"use strict"; return (${mathematicalExpression})`
        )();

      if (
        typeof calculatedResult !==
          "number" ||
        !Number.isFinite(
          calculatedResult
        )
      ) {

        setResult("Error");

        setJustCalculated(true);

        return;
      }

      const formattedResult =
        Number.isInteger(
          calculatedResult
        )
          ? String(
              calculatedResult
            )
          : String(
              Number(
                calculatedResult.toFixed(
                  10
                )
              )
            );

      setResult(
        formattedResult
      );

      setJustCalculated(true);

    } catch {

      setResult("Error");

      setJustCalculated(true);
    }
  };

  const handleClear = () => {

    setExpression("");

    setResult("");

    setJustCalculated(false);
  };

  const handleSign = () => {

    if (
      expression === ""
    ) {
      return;
    }

    if (justCalculated) {

      if (
        !result ||
        result === "Error"
      ) {
        return;
      }

      setResult(
        result.startsWith("-")
          ? result.slice(1)
          : "-" + result
      );

      return;
    }

    const parts =
      expression.split(
        /([+\-×÷])/
      );

    const lastIndex =
      parts.length - 1;

    const lastPart =
      parts[lastIndex];

    if (
      lastPart === "" ||
      ["+", "-", "×", "÷"].includes(
        lastPart
      )
    ) {
      return;
    }

    parts[lastIndex] =
      lastPart.startsWith("-")
        ? lastPart.slice(1)
        : "-" + lastPart;

    setExpression(
      parts.join("")
    );
  };

  const handlePercent = () => {

    if (
      expression === "" ||
      result === "Error"
    ) {
      return;
    }

    if (justCalculated) {

      setResult(
        String(
          Number(result) / 100
        )
      );

      return;
    }

    const parts =
      expression.split(
        /([+\-×÷])/
      );

    const lastIndex =
      parts.length - 1;

    const lastPart =
      parts[lastIndex];

    if (
      lastPart === "" ||
      ["+", "-", "×", "÷"].includes(
        lastPart
      )
    ) {
      return;
    }

    parts[lastIndex] =
      String(
        Number(lastPart) / 100
      );

    setExpression(
      parts.join("")
    );
  };

  return (
    <div className="calculator-page">

      <div className="page-header">

        <div>

          <h1>
            Calculator
          </h1>

          <p>
            Perform quick calculations
            while managing your budget.
          </p>

        </div>

      </div>

      <div className="calculator-container">

        <div className="calculator">

          <div className="calculator-display">

            {justCalculated ? (

              <span className="calculator-equation">

                {expression} = {result}

              </span>

            ) : (

              <span className="calculator-equation">

                {expression || "0"}

              </span>

            )}

          </div>

          <div className="calculator-buttons">

            <button
              className="calculator-button function"
              onClick={handleClear}
            >
              AC
            </button>

            <button
              className="calculator-button function"
              onClick={handleSign}
            >
              +/-
            </button>

            <button
              className="calculator-button function"
              onClick={handlePercent}
            >
              %
            </button>

            <button
              className="calculator-button operator"
              onClick={() =>
                handleOperator("÷")
              }
            >
              ÷
            </button>

            <button
              className="calculator-button"
              onClick={() =>
                handleNumber(7)
              }
            >
              7
            </button>

            <button
              className="calculator-button"
              onClick={() =>
                handleNumber(8)
              }
            >
              8
            </button>

            <button
              className="calculator-button"
              onClick={() =>
                handleNumber(9)
              }
            >
              9
            </button>

            <button
              className="calculator-button operator"
              onClick={() =>
                handleOperator("×")
              }
            >
              ×
            </button>

            <button
              className="calculator-button"
              onClick={() =>
                handleNumber(4)
              }
            >
              4
            </button>

            <button
              className="calculator-button"
              onClick={() =>
                handleNumber(5)
              }
            >
              5
            </button>

            <button
              className="calculator-button"
              onClick={() =>
                handleNumber(6)
              }
            >
              6
            </button>

            <button
              className="calculator-button operator"
              onClick={() =>
                handleOperator("-")
              }
            >
              −
            </button>

            <button
              className="calculator-button"
              onClick={() =>
                handleNumber(1)
              }
            >
              1
            </button>

            <button
              className="calculator-button"
              onClick={() =>
                handleNumber(2)
              }
            >
              2
            </button>

            <button
              className="calculator-button"
              onClick={() =>
                handleNumber(3)
              }
            >
              3
            </button>

            <button
              className="calculator-button operator"
              onClick={() =>
                handleOperator("+")
              }
            >
              +
            </button>

            <button
              className="calculator-button zero"
              onClick={() =>
                handleNumber(0)
              }
            >
              0
            </button>

            <button
              className="calculator-button"
              onClick={handleDecimal}
            >
              .
            </button>

            <button
              className="calculator-button equals"
              onClick={handleEquals}
            >
              =
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Calculator;
