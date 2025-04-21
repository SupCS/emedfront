import styles from "./DoctorCard.module.css";

function DoctorCard({
  name,
  specialization,
  rating,
  ratingCount,
  avatar,
  onBookClick,
}) {
  return (
    <div className={styles.card} onClick={onBookClick}>
      <img
        src={avatar || "/images/default-avatar.webp"}
        alt="Аватар лікаря"
        className={styles.avatar}
      />
      <div className={styles.name}>{name}</div>
      <div className={styles.specialization}>{specialization}</div>
      <div className={styles.rating}>
        {rating !== null && rating !== undefined ? (
          <>
            {rating} ⭐{" "}
            <span className={styles.ratingCount}>({ratingCount || 0})</span>
          </>
        ) : (
          "Немає оцінок"
        )}
      </div>
      <button className={styles.bookButton}>Записатись</button>
    </div>
  );
}

export default DoctorCard;
