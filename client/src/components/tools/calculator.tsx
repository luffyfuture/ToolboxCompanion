import { useState, useEffect } from "react";
import { Calculator as CalculatorEngine } from "@/lib/calculator";

export default function Calculator() {
  const [calculator] = useState(() => new CalculatorEngine());
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [history, setHistory] = useState<Array<{ expression: string; result: string }>>([]);

  const updateDisplay = () => {
    setDisplay(calculator.getDisplay());
    setExpression(calculator.getExpression());
    setHistory(calculator.getHistory());
  };

  const handleNumber = (num: string) => {
    calculator.inputNumber(num);
    updateDisplay();
  };

  const handleOperation = (op: string) => {
    calculator.inputOperation(op);
    updateDisplay();
  };

  const handleDecimal = () => {
    calculator.inputDecimal();
    updateDisplay();
  };

  const handleEquals = () => {
    calculator.calculate();
    updateDisplay();
  };

  const handleClear = () => {
    calculator.clear();
    updateDisplay();
  };

  const handleClearEntry = () => {
    calculator.clearEntry();
    updateDisplay();
  };

  const handleBackspace = () => {
    calculator.backspace();
    updateDisplay();
  };

  const handleClearHistory = () => {
    calculator.clearHistory();
    updateDisplay();
  };

  useEffect(() => {
    updateDisplay();
  }, []);

  return (
    <div className="max-w-md mx-auto">
      {/* Display */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-4">
        <div className="bg-slate-900 rounded-lg p-4 mb-4">
          <div className="text-right">
            <div className="text-slate-400 text-sm h-6">{expression}</div>
            <div className="text-white text-3xl font-mono">{display}</div>
          </div>
        </div>

        {/* Calculator Buttons */}
        <div className="grid grid-cols-4 gap-3">
          {/* Row 1 */}
          <button
            onClick={handleClear}
            className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold py-3 rounded-lg transition-colors"
          >
            C
          </button>
          <button
            onClick={handleClearEntry}
            className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold py-3 rounded-lg transition-colors"
          >
            CE
          </button>
          <button
            onClick={handleBackspace}
            className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold py-3 rounded-lg transition-colors"
          >
            <i className="fas fa-backspace"></i>
          </button>
          <button
            onClick={() => handleOperation("/")}
            className="bg-primary hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            ÷
          </button>

          {/* Row 2 */}
          <button
            onClick={() => handleNumber("7")}
            className="bg-white hover:bg-slate-100 text-slate-800 font-semibold py-3 rounded-lg border border-slate-200 transition-colors"
          >
            7
          </button>
          <button
            onClick={() => handleNumber("8")}
            className="bg-white hover:bg-slate-100 text-slate-800 font-semibold py-3 rounded-lg border border-slate-200 transition-colors"
          >
            8
          </button>
          <button
            onClick={() => handleNumber("9")}
            className="bg-white hover:bg-slate-100 text-slate-800 font-semibold py-3 rounded-lg border border-slate-200 transition-colors"
          >
            9
          </button>
          <button
            onClick={() => handleOperation("*")}
            className="bg-primary hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            ×
          </button>

          {/* Row 3 */}
          <button
            onClick={() => handleNumber("4")}
            className="bg-white hover:bg-slate-100 text-slate-800 font-semibold py-3 rounded-lg border border-slate-200 transition-colors"
          >
            4
          </button>
          <button
            onClick={() => handleNumber("5")}
            className="bg-white hover:bg-slate-100 text-slate-800 font-semibold py-3 rounded-lg border border-slate-200 transition-colors"
          >
            5
          </button>
          <button
            onClick={() => handleNumber("6")}
            className="bg-white hover:bg-slate-100 text-slate-800 font-semibold py-3 rounded-lg border border-slate-200 transition-colors"
          >
            6
          </button>
          <button
            onClick={() => handleOperation("-")}
            className="bg-primary hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            −
          </button>

          {/* Row 4 */}
          <button
            onClick={() => handleNumber("1")}
            className="bg-white hover:bg-slate-100 text-slate-800 font-semibold py-3 rounded-lg border border-slate-200 transition-colors"
          >
            1
          </button>
          <button
            onClick={() => handleNumber("2")}
            className="bg-white hover:bg-slate-100 text-slate-800 font-semibold py-3 rounded-lg border border-slate-200 transition-colors"
          >
            2
          </button>
          <button
            onClick={() => handleNumber("3")}
            className="bg-white hover:bg-slate-100 text-slate-800 font-semibold py-3 rounded-lg border border-slate-200 transition-colors"
          >
            3
          </button>
          <button
            onClick={() => handleOperation("+")}
            className="bg-primary hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            +
          </button>

          {/* Row 5 */}
          <button
            onClick={() => handleNumber("0")}
            className="col-span-2 bg-white hover:bg-slate-100 text-slate-800 font-semibold py-3 rounded-lg border border-slate-200 transition-colors"
          >
            0
          </button>
          <button
            onClick={handleDecimal}
            className="bg-white hover:bg-slate-100 text-slate-800 font-semibold py-3 rounded-lg border border-slate-200 transition-colors"
          >
            .
          </button>
          <button
            onClick={handleEquals}
            className="bg-accent hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            =
          </button>
        </div>
      </div>

      {/* Calculator History */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <h3 className="font-medium text-slate-800 mb-3 flex items-center">
          <i className="fas fa-history mr-2 text-slate-500"></i>
          History
        </h3>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {history.length === 0 ? (
            <p className="text-slate-500 text-sm">No calculations yet</p>
          ) : (
            history.map((entry, index) => (
              <div
                key={index}
                className="flex justify-between items-center text-sm py-1 hover:bg-slate-50 rounded px-2 -mx-2"
              >
                <span className="text-slate-600">{entry.expression}</span>
                <span className="font-mono text-slate-800">{entry.result}</span>
              </div>
            ))
          )}
        </div>
        <button
          onClick={handleClearHistory}
          className="w-full mt-3 py-2 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded hover:bg-slate-50 transition-colors"
        >
          Clear History
        </button>
      </div>
    </div>
  );
}
