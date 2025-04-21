import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { createPrescription } from "../../api/prescriptionsApi";
import flatpickr from "flatpickr";
import { Ukrainian } from "flatpickr/dist/l10n/uk.js";
import "flatpickr/dist/flatpickr.min.css";
import styles from "./PrescriptionModal.module.css";

const PrescriptionModal = ({ isOpen, onClose, patientId }) => {
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [noExpiry, setNoExpiry] = useState(false);

  const datePickerRef = useRef(null);

  useEffect(() => {
    if (isOpen && datePickerRef.current) {
      const today = new Date();
      const twoWeeksLater = new Date();
      twoWeeksLater.setDate(today.getDate() + 14);

      const defaultDateStr = twoWeeksLater.toISOString().split("T")[0];
      setValidUntil(defaultDateStr);

      flatpickr(datePickerRef.current, {
        locale: Ukrainian,
        dateFormat: "Y-m-d",
        defaultDate: defaultDateStr,
        minDate: "today",
        disableMobile: true,
        onChange: ([selectedDate]) => {
          if (selectedDate) {
            const dateStr = selectedDate.toISOString().split("T")[0];
            setValidUntil(dateStr);
          }
        },
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createPrescription({
        patientId,
        diagnosis,
        treatment,
        validUntil: noExpiry ? null : validUntil,
      });

      toast.success("Призначення успішно створено!");
      setDiagnosis("");
      setTreatment("");
      setValidUntil("");
      setNoExpiry(false);
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      toast.error(err.message || "Не вдалося створити призначення.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalCard}>
        <h2 className={styles.modalTitle}>Створити призначення</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>Діагноз</label>
          <input
            type="text"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            required
            className={styles.input}
          />

          <label className={styles.label}>Лікування</label>
          <textarea
            value={treatment}
            onChange={(e) => setTreatment(e.target.value)}
            required
            className={styles.textarea}
          />

          <label className={styles.label}>
            Дійсний до
            <input
              type="checkbox"
              checked={noExpiry}
              onChange={(e) => setNoExpiry(e.target.checked)}
              style={{ marginLeft: "8px" }}
            />
            <span style={{ marginLeft: "4px" }}>Без терміну дії</span>
          </label>

          {!noExpiry && (
            <input
              ref={datePickerRef}
              type="text"
              value={validUntil}
              readOnly
              className={styles.input}
            />
          )}

          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.saveButton}>
              Виписати
            </button>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Закрити
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrescriptionModal;
