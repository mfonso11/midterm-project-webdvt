import { Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import AddTransaction from "./pages/AddTransaction";
import TransactionDetail from "./pages/TransactionDetail";
import Summary from "./pages/Summary";
import Calculator from "./pages/Calculator";
import Navbar from "./components/Navbar";

function App() {
  return (
    <div className="app">

      <Navbar />

      <main className="app-main">

        <div className="app-content">

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
              path="/summary"
              element={<Summary />}
            />

            <Route
              path="/calculator"
              element={<Calculator />}
            />

          </Routes>

        </div>

      </main>

    </div>
  );
}

export default App;
