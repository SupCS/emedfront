import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { loginUser } from "../../api/authApi";
import LoginForm from "../../components/LoginForm/LoginForm";
import styles from "./LoginPage.module.css";
import Loader from "../../components/Loader/Loader";

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userRole", data.role);
      localStorage.setItem("userId", data.user.id);

      // Відображаємо повідомлення про успішний вхід
      toast.success("Вхід виконано успішно!");

      // Перенаправляємо на відповідний профіль
      const profilePath =
        data.role === "doctor"
          ? `/profile/doctor/${data.user.id}`
          : `/profile/patient/${data.user.id}`;
      navigate(profilePath);
    } catch (error) {
      console.error("Login error:", error.message);
      toast.error(error.message || "Невірний email або пароль");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      {loading ? (
        <Loader />
      ) : (
        <>
          <LoginForm onLogin={handleLogin} />
          <p className={styles.registerText}>
            Don&apos;t have an account?{" "}
            <span
              className={styles.registerLink}
              onClick={() => navigate("/register")}
            >
              Register
            </span>
          </p>
        </>
      )}
    </div>
  );
}

export default LoginPage;
