import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { getUnreadCounts } from "../../api/chatApi";
import { socket } from "../../api/socket";
import {
  setUnreadMessages,
  incrementUnreadMessages,
} from "../../store/unreadMessagesSlice";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const unreadTotal = useSelector((state) => state.unreadMessages);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUser({ id: decoded.id, role: decoded.role });

        // Отримуємо кількість непрочитаних повідомлень при першому завантаженні
        fetchUnreadMessages(decoded.id);

        // Підписуємось на сокети
        socket.on("receiveMessage", (message) => {
          console.log("Отримано нове повідомлення:", message);
          dispatch(incrementUnreadMessages()); // Збільшуємо лічильник
        });

        return () => {
          socket.off("receiveMessage");
        };
      } catch (error) {
        toast.error("Помилка декодування токена");
      }
    }
  }, [dispatch]);

  const fetchUnreadMessages = async (userId) => {
    try {
      const unreadCounts = await getUnreadCounts(userId);
      const totalUnread = Object.values(unreadCounts).reduce(
        (sum, count) => sum + count,
        0
      );
      dispatch(setUnreadMessages(totalUnread));
    } catch (error) {
      console.error("Помилка отримання непрочитаних повідомлень:", error);
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("authToken");
      toast.success("Вихід успішний");
      navigate("/login");
    } catch (error) {
      toast.error("Помилка під час виходу");
    }
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
            <span className={styles.navText}>
              Чати{" "}
              {unreadTotal > 0 && (
                <span className={styles.unreadBadge}>{unreadTotal}</span>
              )}
            </span>
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
