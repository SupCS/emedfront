import { useState } from "react";
import styles from "./RatingModal.module.css";
import { toast } from "react-toastify";
import { submitRating } from "../../api/ratingApi";

function RatingModal({ isOpen, onClose, appointmentId, onRated }) {
  const [value, setValue] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (value < 1 || value > 5) {
      toast.error("Оцінка має бути від 1 до 5");
      return;
    }

    try {
      setSubmitting(true);
      await submitRating(appointmentId, value);
      toast.success("Дякуємо за оцінку!");
      onRated(value);
      onClose();
    } catch (error) {
      toast.error(error.message || "Не вдалося зберегти оцінку");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>Оцініть консультацію</h3>
        <div className={styles.stars}>
          {[1, 2, 3, 4, 5].map((num) => (
            <span
              key={num}
              className={value >= num ? styles.filled : styles.empty}
              onClick={() => setValue(num)}
            >
              ★
            </span>
          ))}
        </div>
        <div className={styles.buttons}>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={styles.submitButton}
          >
            Підтвердити
          </button>
          <button onClick={onClose} className={styles.cancelButton}>
            Скасувати
          </button>
        </div>
      </div>
    </div>
  );
}

export default RatingModal;
