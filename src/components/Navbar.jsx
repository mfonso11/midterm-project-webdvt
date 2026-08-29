import { useState } from "react";
import { Link } from "react-router-dom";

import { useTheme } from "../context/ThemeContext";

function Navbar() {
  const { darkMode, toggleTheme } = useTheme();

  const [showNavigation, setShowNavigation] =
    useState(true);

  return (
    <header className="app-header">

      <div className="header-inner">

        {/* LOGO */}

        <Link
          to="/"
          className="app-logo"
        >
          Personal Budget Tracker
        </Link>


        {/* NAVIGATION */}

        {showNavigation && (
          <nav className="app-navigation">

            <Link
              to="/"
              className="nav-box"
            >
              Dashboard
            </Link>

            <Link
              to="/budget"
              className="nav-box"
            >
              Budget
            </Link>

            <Link
              to="/summary"
              className="nav-box"
            >
              Summary
            </Link>

            <Link
              to="/prediction"
              className="nav-box"
            >
              Prediction
            </Link>

            <Link
              to="/calculator"
              className="nav-box"
            >
              Calculator
            </Link>


            {/* DARK MODE */}

            <button
              type="button"
              className="nav-box theme-nav-button"
              onClick={toggleTheme}
            >
              {darkMode
                ? "☀ Light Mode"
                : "🌙 Dark Mode"}
            </button>

          </nav>
        )}


        {/* SHOW / HIDE NAVIGATION */}

        <button
          type="button"
          className="nav-toggle-button"
          onClick={() =>
            setShowNavigation(
              (current) => !current
            )
          }
          aria-label={
            showNavigation
              ? "Hide navigation"
              : "Show navigation"
          }
        >
          {showNavigation
            ? "Hide Menu"
            : "Show Menu"}
        </button>

      </div>

    </header>
  );
}

export default Navbar;