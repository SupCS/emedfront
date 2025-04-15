import styles from "./AddSlotForm.module.css";

export default function AddSlotForm({
  date,
  startTime,
  endTime,
  setDate,
  setStartTime,
  setEndTime,
  onAdd,
  onClose,
}) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h4 className={styles.formTitle}>Додати тайм-слот</h4>
        <div className={styles.form}>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
          <div className={styles.actions}>
            <button onClick={onAdd}>Додати</button>
            <button onClick={onClose} className={styles.cancel}>
              Скасувати
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
