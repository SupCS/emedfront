import { useState } from "react";
import styles from "./LoginForm.module.css";
import Loader from "../Loader/Loader";

function LoginForm({ onLogin, loading }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err.message || "Помилка входу");
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Вхід</h2>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Пароль:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
          />
        </div>
        <div className={styles.buttonWrapper}>
          {loading ? (
            <div className={styles.loaderContainer}>
              <Loader />
            </div>
          ) : (
            <button type="submit" className={styles.button}>
              Увійти
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default LoginForm;
