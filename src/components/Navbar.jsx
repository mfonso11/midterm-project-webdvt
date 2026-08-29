import { useState } from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="app-header">

      <div className="header-inner">

        <Link
          to="/"
          className="app-logo"
          onClick={closeMenu}
        >
          Budget Tracker
        </Link>


        <button
          type="button"
          className="hamburger-button"
          onClick={() =>
            setMenuOpen(
              (current) => !current
            )
          }
          aria-label={
            menuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={menuOpen}
        >
          {menuOpen ? "×" : "☰"}
        </button>


        <nav
          className={`app-navigation ${
            menuOpen
              ? "menu-open"
              : ""
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
            to="/add?type=Income"
            className="nav-box"
            onClick={closeMenu}
          >
            Add Transaction
          </Link>


          <Link
            to="/budget"
            className="nav-box"
            onClick={closeMenu}
          >
            Budget
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