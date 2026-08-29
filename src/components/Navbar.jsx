import { useState } from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="app-header">
      <div className="header-inner">

        {/* Logo */}
        <Link
          to="/"
          className="app-logo"
          onClick={closeMenu}
        >
          Budget Tracker
        </Link>

        {/* Hamburger */}
        <button
          type="button"
          className="hamburger-button"
          onClick={() =>
            setMenuOpen((current) => !current)
          }
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        {/* Navigation */}
        <nav
          className={`app-navigation ${
            menuOpen ? "menu-open" : ""
          }`}
        >
          <Link
            to="/"
            className="nav-box"
            onClick={closeMenu}
          >
            Dashboard
          </Link>

          <Link
            to="/budget"
            className="nav-box"
            onClick={closeMenu}
          >
            Budget Allocation
          </Link>

          <Link
            to="/add?type=Income"
            className="nav-box"
            onClick={closeMenu}
          >
            Add Income
          </Link>

          <Link
            to="/add?type=Expense"
            className="nav-box"
            onClick={closeMenu}
          >
            Add Expense
          </Link>

          <Link
            to="/summary"
            className="nav-box"
            onClick={closeMenu}
          >
            Summary
          </Link>

          <Link
            to="/prediction"
            className="nav-box"
            onClick={closeMenu}
          >
            Prediction
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
  );
}

export default Navbar;