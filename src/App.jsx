import {
  Routes,
  Route,
} from "react-router-dom";

import Navbar from "./components/Navbar";

import Dashboard from "./pages/Dashboard";
import AddTransaction from "./pages/AddTransaction";
import TransactionDetail from "./pages/TransactionDetail";
import Summary from "./pages/Summary";
import Calculator from "./pages/Calculator";
import FinancialPrediction from "./pages/FinancialPrediction";
import Budget from "./pages/Budget";

function App() {
  return (
    <div className="app">

      <Navbar />

      <main>

        <Routes>

          <Route
            path="/"
            element={<Dashboard />}
          />

          <Route
            path="/add"
            element={<AddTransaction />}
          />

          <Route
            path="/transaction/:id"
            element={<TransactionDetail />}
          />

          <Route
            path="/budget"
            element={<Budget />}
          />

          <Route
            path="/summary"
            element={<Summary />}
          />

          <Route
            path="/prediction"
            element={<FinancialPrediction />}
          />

          <Route
            path="/calculator"
            element={<Calculator />}
          />

        </Routes>

      </main>

    </div>
  );
}

export default App;