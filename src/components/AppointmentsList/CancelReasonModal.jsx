import { useState } from "react";
import styles from "./CancelReasonModal.module.css";
import { toast } from "react-toastify";

const CancelReasonModal = ({ isOpen, onClose, onSubmit }) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (reason.trim().length < 5 || reason.trim().length > 100) {
      toast.error("Причина повинна містити від 5 до 100 символів.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(reason.trim());
      setReason("");
      onClose();
    } catch (err) {
      toast.error("Не вдалося скасувати запис.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3 className={styles.modalTitle}>Вкажіть причину скасування</h3>
        <textarea
          className={styles.reasonInput}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          placeholder="Введіть причину (5-100 символів)"
        />
        <div className={styles.buttonGroup}>
          <button
            className={styles.confirmButton}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            Підтвердити
          </button>
          <button
            className={styles.cancelButton}
            onClick={onClose}
            disabled={isSubmitting}
          >
            Скасувати
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelReasonModal;
