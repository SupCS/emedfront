import { Link } from "react-router-dom";
import styles from "./button.module.css";

export default function PrimaryButton({ to, children }) {
  return (
    <Link to={to} className={styles.primaryButton}>
      {children}
    </Link>
  );
}
