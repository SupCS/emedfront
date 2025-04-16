import React from "react";
import styles from "./ConfirmBookingModal.module.css";

export default function ConfirmBookingModal({
  doctorName,
  date,
  startTime,
  endTime,
  onConfirm,
  onCancel,
}) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h4 className={styles.title}>Підтвердження запису</h4>
        <div className={styles.details}>
          <p>
            <strong>Лікар:</strong> {doctorName}
          </p>
          <p>
            <strong>Дата прийому:</strong> {date}
          </p>
          <p>
            <strong>Час прийому:</strong> {startTime} - {endTime}
          </p>
          <p>Записатись на прийом?</p>
        </div>
        <div className={styles.actions}>
          <button onClick={onConfirm}>Так</button>
          <button onClick={onCancel} className={styles.cancel}>
            Скасувати
          </button>
        </div>
      </div>
    </div>
  );
}
