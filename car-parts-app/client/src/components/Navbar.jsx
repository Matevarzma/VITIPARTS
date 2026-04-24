import { Link, NavLink } from "react-router-dom";

function Navbar({ isAdminAuthenticated }) {
  return (
    <header className="site-header">
      <div className="container header-top">
        <Link to="/" className="brand">
          <span className="brand-title">VITIPARTS</span>
          <span className="brand-subtitle">Car Parts Catalog</span>
        </Link>

        <div className="header-search">
          <input
            type="text"
            placeholder="Search will be added in a later step"
            disabled
          />
          <button type="button" disabled>
            Search
          </button>
        </div>
      </div>

      <div className="header-nav-wrap">
        <nav className="container header-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Home
          </NavLink>
          <NavLink
            to="/admin"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            {isAdminAuthenticated ? "Admin Panel" : "Admin Login"}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
