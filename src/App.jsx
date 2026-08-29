import { useState } from "react";
import { Link, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import AddTransaction from "./pages/AddTransaction";
import TransactionDetail from "./pages/TransactionDetail";
import Summary from "./pages/Summary";
import Calculator from "./pages/Calculator";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <div className="app">

      {/* ================================
          HAMBURGER BUTTON
      ================================= */}

      <button
        className={`hamburger-button ${
          menuOpen ? "menu-open" : ""
        }`}
        onClick={() =>
          setMenuOpen(!menuOpen)
        }
        aria-label="Toggle navigation"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>


      {/* ================================
          NAVIGATION
      ================================= */}

      <header
        className={`app-header ${
          menuOpen ? "header-visible" : ""
        }`}
      >

        <div className="header-inner">

          <Link
            to="/"
            className="app-logo"
            onClick={closeMenu}
          >
            Personal Budget Tracker
          </Link>


          <nav className="app-navigation">

            <Link
              to="/"
              className="nav-box"
              onClick={closeMenu}
            >
              Dashboard
            </Link>

            <Link
              to="/add"
              className="nav-box add-nav-box"
              onClick={closeMenu}
            >
              Add Transaction
            </Link>

            <Link
              to="/summary"
              className="nav-box"
              onClick={closeMenu}
            >
              Summary
            </Link>

            <Link
              to="/calculator"
              className="nav-box"
              onClick={closeMenu}
            >
              Calculator
            </Link>

          </nav>

        </div>

      </header>


      {/* ================================
          MAIN CONTENT
      ================================= */}

      <main>

        <div className="page-container">

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