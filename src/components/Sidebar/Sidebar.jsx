import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUser({ id: decoded.id, role: decoded.role });
      } catch (error) {
        console.error("Помилка декодування токена:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
    <nav className={styles.sidebar} aria-label="Main Navigation">
      <ul>
        <li>
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? styles.active : "")}
          >
            <i className="fa fa-home"></i>
            <span className={styles.navText}>Головна</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/doctors"
            className={({ isActive }) => (isActive ? styles.active : "")}
          >
            <i className="fa fa-user-md"></i>
            <span className={styles.navText}>Лікарі</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/chat"
            className={({ isActive }) => (isActive ? styles.active : "")}
          >
            <i className="fa fa-comments"></i>
            <span className={styles.navText}>Чати</span>
          </NavLink>
        </li>
        {currentUser ? (
          <li>
            <NavLink
              to={`/profile/${currentUser.role}/${currentUser.id}`}
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              <i className="fa fa-user"></i>
              <span className={styles.navText}>Мій профіль</span>
            </NavLink>
          </li>
        ) : (
          <li className={styles.disabledLink}>
            <i className="fa fa-user"></i>
            <span className={styles.navText}>Мій профіль</span>
          </li>
        )}
      </ul>
      <ul className={styles.logout}>
        <li>
          <a href="#" onClick={handleLogout} className={styles.logoutLink}>
            <i className="fa fa-power-off"></i>
            <span className={styles.navText}>Вийти</span>
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;
