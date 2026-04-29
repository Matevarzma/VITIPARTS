import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

function Navbar({ isAdminAuthenticated }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchText(params.get("search") || "");
  }, [location.search]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const nextPath = location.pathname === "/admin" ? "/" : location.pathname;
    const trimmedSearch = searchText.trim();
    const params = new URLSearchParams();

    if (trimmedSearch) {
      params.set("search", trimmedSearch);
    }

    navigate({
      pathname: nextPath,
      search: params.toString() ? `?${params.toString()}` : "",
    });
  };

  let searchPlaceholder = "ბრენდების ძებნა";

  if (location.pathname.startsWith("/brands/")) {
    searchPlaceholder = "მანქანის მოდელის ან წლის ძებნა";
  }

  if (location.pathname.startsWith("/cars/")) {
    searchPlaceholder = "ნაწილის სახელის ან კოდის ძებნა";
  }

  return (
    <header className="site-header">
      <div className="container header-top">
        <Link to="/" className="brand">
          <img src="/logo.png" alt="VITIPARTS logo" className="brand-logo" />
        </Link>

        <form className="header-search" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
          />
          <button type="submit">ძებნა</button>
        </form>
      </div>

      <div className="header-nav-wrap">
        <nav className="container header-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            მთავარი
          </NavLink>
          <NavLink
            to="/admin"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            {isAdminAuthenticated ? "ადმინის პანელი" : "ადმინის შესვლა"}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
