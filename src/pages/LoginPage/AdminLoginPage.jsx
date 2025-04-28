import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { loginAdmin } from "../../api/adminApi";
import LoginForm from "../../components/LoginForm/LoginForm";
import styles from "./LoginPage.module.css";

function AdminLoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const data = await loginAdmin(email, password);
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userRole", "admin");
      localStorage.setItem("userId", data.user.id);

      toast.success("Адміністративний вхід успішний!");
      navigate("/admin");
    } catch (error) {
      console.error("Помилка входу адміністратора:", error.message);
      toast.error(error.message || "Невірний email або пароль адміністратора");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <LoginForm onLogin={handleLogin} loading={loading} />
    </div>
  );
}

export default AdminLoginPage;
