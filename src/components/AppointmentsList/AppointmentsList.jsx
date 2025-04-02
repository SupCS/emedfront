import styles from "./AppointmentsList.module.css";
import { updateAppointmentStatus } from "../../api/appointmentApi";
import { toast } from "react-toastify";

const statusStyles = {
  pending: { color: "#ffc107", label: "Очікує підтвердження" },
  confirmed: { color: "#28a745", label: "Підтверджено" },
  cancelled: { color: "#dc3545", label: "Скасовано" },
  passed: { color: "#007bff", label: "Завершено" },
};

function AppointmentsList({ appointments, role, onStatusUpdate }) {
  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await updateAppointmentStatus(appointmentId, newStatus);
      toast.success(
        `Статус змінено на "${
          newStatus === "confirmed" ? "Підтверджено" : "Скасовано"
        }"`
      );

      if (onStatusUpdate) {
        onStatusUpdate(appointmentId, newStatus);
      }
    } catch (error) {
      toast.error(error.message || "Не вдалося оновити статус");
    }
  };

  return (
    <div className={styles.appointmentsContainer}>
      {appointments.length > 0 ? (
        <ul className={styles.appointmentsList}>
          {appointments.map((appt) => {
            const { color, label } = statusStyles[appt.status] || {};
            return (
              <li key={appt._id} className={styles.appointmentItem}>
                <div className={styles.left}>
                  <div>
                    <strong>Дата:</strong> {appt.date}
                  </div>
                  <div>
                    <strong>Час:</strong> {appt.startTime} - {appt.endTime}
                  </div>
                  <div>
                    {role === "doctor" ? (
                      <strong>Пацієнт:</strong>
                    ) : (
                      <strong>Лікар:</strong>
                    )}{" "}
                    {role === "doctor" ? appt.patient.name : appt.doctor.name}
                  </div>
                </div>

                <div className={styles.right}>
                  <div className={styles.status}>
                    <span
                      className={styles.statusDot}
                      style={{ backgroundColor: color }}
                    />
                    {label}
                  </div>

                  {role === "doctor" && appt.status === "pending" && (
                    <div className={styles.buttonGroup}>
                      <button
                        className={styles.confirmButton}
                        onClick={() =>
                          handleStatusChange(appt._id, "confirmed")
                        }
                      >
                        Підтвердити
                      </button>
                      <button
                        className={styles.cancelButton}
                        onClick={() =>
                          handleStatusChange(appt._id, "cancelled")
                        }
                      >
                        Відхилити
                      </button>
                    </div>
                  )}

                  {["doctor", "patient"].includes(role) &&
                    appt.status === "confirmed" && (
                      <div className={styles.buttonGroup}>
                        <button
                          className={styles.cancelButton}
                          onClick={() => {
                            const confirmed = window.confirm(
                              "Ви впевнені, що хочете скасувати підтверджений запис? Це незворотна дія."
                            );
                            if (confirmed) {
                              handleStatusChange(appt._id, "cancelled");
                            }
                          }}
                        >
                          Скасувати
                        </button>
                      </div>
                    )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>Немає записів для відображення.</p>
      )}
    </div>
  );
}

export default AppointmentsList;
