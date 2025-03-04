import styles from "./LogoutButton.module.css";

function LogoutButton({ onLogout }) {
  return (
    <button className={styles.logoutButton} onClick={onLogout}>
      Logout
    </button>
  );
}

export default LogoutButton;
