import styles from "./ProfileInfo.module.css";
import pencilIcon from "../../assets/pencil.svg";

export default function RightBlock({
  icon,
  label,
  value,
  editable = false,
  onEditClick,
  isOwner,
}) {
  return (
    <div className={styles.rightBlock}>
      <div className={styles.rightBlockInner}>
        <div className={styles.blockLabelWrapper}>
          <span className={styles.blockLabel}>{label}</span>
          {editable && isOwner && (
            <button className={styles.inlineEditButton} onClick={onEditClick}>
              <img
                src={pencilIcon}
                className={styles.inlineEditIcon}
                alt="edit"
              />
            </button>
          )}
        </div>
        <div className={styles.blockValue}>{value || "-"}</div>
      </div>
      <div className={styles.iconBlock}>
        <img src={icon} alt="icon" className={styles.iconImage} />
      </div>
    </div>
  );
}
