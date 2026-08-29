import { useState } from "react";

function Calculator() {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [justCalculated, setJustCalculated] =
    useState(false);

  const handleNumber = (number) => {
    if (justCalculated) {
      setExpression("");
      setDisplay(number);
      setJustCalculated(false);
      return;
    }

    if (display === "0") {
      setDisplay(number);
    } else {
      setDisplay((current) => current + number);
    }
  };


  const handleOperator = (operator) => {
    setJustCalculated(false);

    const operatorSymbol =
      operator === "*"
        ? "×"
        : operator === "/"
        ? "÷"
        : operator;

    setExpression((current) => {
      if (!current) {
        return display + " " + operatorSymbol;
      }

      return current + " " + display + " " + operatorSymbol;
    });

    setDisplay("0");
  };


  const calculateResult = () => {
    if (!expression) return;

    const fullExpression =
      expression + " " + display;

    try {
      const safeExpression =
        fullExpression
          .replace(/×/g, "*")
          .replace(/÷/g, "/");

      const result = Function(
        `"use strict"; return (${safeExpression})`
      )();

      const formattedResult =
        Number.isInteger(result)
          ? result.toString()
          : result.toFixed(2).replace(/\.?0+$/, "");

      setExpression(fullExpression + " =");
      setDisplay(formattedResult);
      setJustCalculated(true);

    } catch {
      setExpression("");
      setDisplay("Error");
    }
  };


  const clearCalculator = () => {
    setDisplay("0");
    setExpression("");
    setJustCalculated(false);
  };


  return (
    <div className="page-container">

      <div className="page-header">
        <div>
          <h1>Calculator</h1>
          <p>
            Quickly calculate amounts while managing
            your finances.
          </p>
        </div>
      </div>


      <div className="calculator-container">

        <div className="calculator-display">

          {expression ? (
            <div>
              <div className="calculator-expression">
                {expression}
              </div>

              <div className="calculator-current">
                {display}
              </div>
            </div>
          ) : (
            display
          )}

        </div>


        <div className="calculator-buttons">

          <button
            className="clear"
            onClick={clearCalculator}
          >
            C
          </button>

          <button
            className="operator"
            onClick={() =>
              handleOperator("/")
            }
          >
            ÷
          </button>

          <button
            className="operator"
            onClick={() =>
              handleOperator("*")
            }
          >
            ×
          </button>

          <button
            className="operator"
            onClick={() =>
              handleOperator("-")
            }
          >
            −
          </button>


          <button onClick={() => handleNumber("7")}>
            7
          </button>

          <button onClick={() => handleNumber("8")}>
            8
          </button>

          <button onClick={() => handleNumber("9")}>
            9
          </button>

          <button
            className="operator"
            onClick={() =>
              handleOperator("+")
            }
          >
            +
          </button>


          <button onClick={() => handleNumber("4")}>
            4
          </button>

          <button onClick={() => handleNumber("5")}>
            5
          </button>

          <button onClick={() => handleNumber("6")}>
            6
          </button>

          <button onClick={() => handleNumber("1")}>
            1
          </button>


          <button onClick={() => handleNumber("2")}>
            2
          </button>

          <button onClick={() => handleNumber("3")}>
            3
          </button>

          <button onClick={() => handleNumber("0")}>
            0
          </button>

          <button onClick={() => handleNumber(".")}>
            .
          </button>


          <button
            className="equals"
            onClick={calculateResult}
          >
            =
          </button>

        </div>

      </div>

    </div>
  );
}

export default Calculator;