import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../api/authApi";
import { toast } from "react-toastify";
import RegisterForm from "../../components/RegisterForm/RegisterForm";
import styles from "./RegisterPage.module.css";

function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (formData) => {
    setLoading(true);
    try {
      await registerUser(formData);
      toast.success("Реєстрація успішна! Тепер увійдіть.");
      navigate("/login");
    } catch (error) {
      toast.error(error.message || "Не вдалося зареєструватися.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <RegisterForm onRegister={handleRegister} loading={loading} />
      <p className={styles.registerText}>
        Вже є акаунт?{" "}
        <span
          className={styles.registerLink}
          onClick={() => navigate("/login")}
        >
          Увійти
        </span>
      </p>
    </div>
  );
}

export default RegisterPage;
