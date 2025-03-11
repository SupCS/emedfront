import { useState } from "react";
import { createPrescription } from "../../api/prescriptionsApi";
import styles from "./PrescriptionModal.module.css";

const PrescriptionModal = ({ isOpen, onClose, patientId }) => {
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [noExpiry, setNoExpiry] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await createPrescription({
        patientId,
        diagnosis,
        treatment,
        validUntil: noExpiry ? null : validUntil,
      });

      setSuccess("Призначення успішно створено!");
      setDiagnosis("");
      setTreatment("");
      setValidUntil("");
      setNoExpiry(false);

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || "Не вдалося створити призначення.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>Створити призначення</h2>
        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}
        <form onSubmit={handleSubmit}>
          <label>
            Діагноз:
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              required
            />
          </label>
          <label>
            Лікування:
            <textarea
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              required
            />
          </label>
          <label>
            Дійсний до:
            <input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              disabled={noExpiry}
            />
          </label>
          <div className={styles.buttons}>
            <button type="submit">Виписати</button>
            <button type="button" onClick={onClose} className={styles.close}>
              Закрити
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrescriptionModal;
