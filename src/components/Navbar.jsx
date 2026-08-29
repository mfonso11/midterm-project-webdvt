import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="app-header">

      <div className="header-inner">

        {/* Logo */}

        <Link
          to="/"
          className="app-logo"
        >
          Personal Budget Tracker
        </Link>

        {/* Navigation */}

        <nav className="app-navigation">

          <Link
            to="/"
            className="nav-box"
          >
            Dashboard
          </Link>

          <Link
            to="/add"
            className="nav-box add-nav-box"
          >
            Add Transaction
          </Link>

          <Link
            to="/summary"
            className="nav-box"
          >
            Summary
          </Link>

          <Link
            to="/calculator"
            className="nav-box"
          >
            Calculator
          </Link>

          {/* Theme Button */}

          <button
            className="nav-box theme-button"
            onClick={toggleTheme}
          >
            {theme === "light"
              ? "Dark Mode"
              : "Light Mode"}
          </button>

        </nav>

      </div>

    </header>
  );
}

export default Navbar;
