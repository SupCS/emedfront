import { Link } from "react-router-dom";
import styles from "./button.module.css";

export default function OutlineButton({ to, children }) {
  return (
    <Link to={to} className={styles.outlineButton}>
      {children}
    </Link>
  );
}
