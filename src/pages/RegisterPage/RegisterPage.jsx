import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../api/authApi";
import RegisterForm from "../../components/RegisterForm/RegisterForm";
import styles from "./RegisterPage.module.css";
import Loader from "../../components/Loader/Loader";

function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (formData) => {
    setLoading(true);
    try {
      await registerUser(formData);
      navigate("/login"); // Переходимо на сторінку логіну після успішної реєстрації
    } catch (err) {
      console.error("Registration error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      {loading ? (
        <Loader></Loader>
      ) : (
        <>
          <RegisterForm onRegister={handleRegister} />
          <p className={styles.registerText}>
            Вже є аккаунт?{" "}
            <span
              className={styles.registerLink}
              onClick={() => navigate("/login")}
            >
              На сторінку логіну
            </span>
          </p>
        </>
      )}
    </div>
  );
}

export default RegisterPage;
