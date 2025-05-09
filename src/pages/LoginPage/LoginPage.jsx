import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { loginUser } from "../../api/authApi";
import LoginForm from "../../components/LoginForm/LoginForm";
import styles from "./LoginPage.module.css";
import Loader from "../../components/Loader/Loader";
import { connectSocket } from "../../api/socket";

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      localStorage.setItem("authToken", data.token);
      connectSocket();

      toast.success("Вхід виконано успішно!");

      const profilePath =
        data.role === "doctor"
          ? `/profile/doctor/${data.user.id}`
          : `/profile/patient/${data.user.id}`;
      navigate(profilePath);
    } catch (error) {
      console.error("Помилка входу:", error.message);
      toast.error(error.message || "Невірний email або пароль");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <LoginForm onLogin={handleLogin} loading={loading} />
      <p className={styles.registerText}>
        Немає акаунту?{" "}
        <span
          className={styles.registerLink}
          onClick={() => navigate("/register")}
        >
          Зареєструватися
        </span>
      </p>
    </div>
  );
}

export default LoginPage;
