import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

function Navbar() {
  const { theme, toggleTheme } = useTheme();
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
          Personal Budget Tracker
        </Link>

        {/* Hamburger Button */}
        <button
          type="button"
          className="hamburger-button"
          onClick={() => setMenuOpen(!menuOpen)}
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
            to="/add"
            className="nav-box"
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

          <button
            type="button"
            className="nav-box theme-button"
            onClick={() => {
              toggleTheme();
              closeMenu();
            }}
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
