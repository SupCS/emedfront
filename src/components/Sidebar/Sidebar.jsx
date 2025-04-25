import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { getUnreadCounts } from "../../api/chatApi";
import { setUnreadMessages } from "../../store/unreadMessagesSlice";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const unreadTotal = useSelector((state) => state.unreadMessages);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleSidebar = () => setIsOpen((prev) => !prev);
  const closeSidebar = () => setIsOpen(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setLoadingUser(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setCurrentUser({ id: decoded.id, role: decoded.role });
    } catch (error) {
      toast.error("Помилка декодування токена");
    } finally {
      setLoadingUser(false);
    }
  }, []);

  useEffect(() => {
    if (!currentUser?.id || currentUser.role === "admin") return;

    const fetchUnreadMessages = async () => {
      try {
        const unreadCounts = await getUnreadCounts(currentUser.id);
        const totalUnread = Object.values(unreadCounts).reduce(
          (sum, count) => sum + count,
          0
        );
        dispatch(setUnreadMessages(totalUnread));
      } catch (error) {
        console.error("Помилка отримання непрочитаних повідомлень:", error);
      }
    };

    fetchUnreadMessages();
  }, [currentUser?.id, currentUser?.role, dispatch]);

  const handleLogout = () => {
    try {
      localStorage.removeItem("authToken");
      toast.success("Вихід успішний");
      navigate("/login");
    } catch (error) {
      toast.error("Помилка під час виходу");
    }
  };

  if (loadingUser) return null;

  return (
    <>
      <button className={styles.burger} onClick={toggleSidebar}>
        <div className={styles.line}></div>
        <div className={styles.line}></div>
        <div className={styles.line}></div>
      </button>

      {isOpen && <div className={styles.overlay} onClick={closeSidebar} />}

      <nav
        className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}
        aria-label="Main Navigation"
        onClick={closeSidebar}
      >
        <ul>
          {/* Завжди доступні */}
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

          {/* Не для адміна */}
          {currentUser?.role !== "admin" && (
            <>
              <li>
                <NavLink
                  to="/chat"
                  className={({ isActive }) => (isActive ? styles.active : "")}
                >
                  <i className="fa fa-comments"></i>
                  <span className={styles.navText}>
                    Чати{" "}
                    {unreadTotal > 0 && (
                      <span className={styles.unreadBadge}>{unreadTotal}</span>
                    )}
                  </span>
                </NavLink>
              </li>

              <li>
                <NavLink
                  to={`/profile/${currentUser.role}/${currentUser.id}`}
                  end
                  className={({ isActive }) => (isActive ? styles.active : "")}
                >
                  <i className="fa fa-user"></i>
                  <span className={styles.navText}>Мій профіль</span>
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/appointments"
                  className={({ isActive }) => (isActive ? styles.active : "")}
                >
                  <i className="fa fa-calendar-check"></i>
                  <span className={styles.navText}>Мої записи</span>
                </NavLink>
              </li>

              <li>
                <NavLink
                  to={
                    currentUser.role === "patient"
                      ? `/profile/patient/${currentUser.id}/prescriptions`
                      : `/prescriptions/doctor/${currentUser.id}`
                  }
                  className={({ isActive }) => (isActive ? styles.active : "")}
                >
                  <i className="fa fa-file-medical"></i>
                  <span className={styles.navText}>Призначення</span>
                </NavLink>
              </li>
            </>
          )}

          {/* Тільки для адміна */}
          {currentUser?.role === "admin" && (
            <li>
              <NavLink
                to="/admin"
                className={({ isActive }) => (isActive ? styles.active : "")}
              >
                <i className="fa fa-cogs"></i>
                <span className={styles.navText}>Адмін панель</span>
              </NavLink>
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
    </>
  );
};

export default Sidebar;
