import styles from "./AppointmentsList.module.css";
import {
  updateAppointmentStatus,
  cancelConfirmedAppointment,
} from "../../api/appointmentApi";
import { toast } from "react-toastify";
import { useState } from "react";
import RatingModal from "../RatingModal/RatingModal";
import CancelReasonModal from "./CancelReasonModal";
import { Link } from "react-router-dom";

const statusStyles = {
  pending: { color: "#ffc107", label: "Очікує підтвердження" },
  confirmed: { color: "#28a745", label: "Підтверджено" },
  cancelled: { color: "#dc3545", label: "Скасовано" },
  passed: { color: "#007bff", label: "Завершено" },
};

function AppointmentsList({ appointments, role, onStatusUpdate, onRated }) {
  console.log(appointments);
  const [ratingAppointmentId, setRatingAppointmentId] = useState(null);
  const [cancelModalId, setCancelModalId] = useState(null);

  const handleStatusChange = async (appointmentId, newStatus, cancelReason) => {
    try {
      if (newStatus === "cancelled") {
        await cancelConfirmedAppointment(appointmentId, cancelReason);
      } else {
        await updateAppointmentStatus(appointmentId, newStatus);
      }

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

  const handleRated = (appointmentId, value) => {
    if (onRated) {
      onRated(appointmentId, value);
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
                      <>
                        <strong>Пацієнт:</strong>{" "}
                        <Link
                          className={styles.linkText}
                          to={`/profile/patient/${appt.patient._id}`}
                        >
                          {appt.patient.name}
                        </Link>
                      </>
                    ) : (
                      <>
                        <strong>Лікар:</strong>{" "}
                        <Link
                          className={styles.linkText}
                          to={`/profile/doctor/${appt.doctor._id}`}
                        >
                          {appt.doctor.name}
                        </Link>
                      </>
                    )}
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
                        onClick={() => setCancelModalId(appt._id)}
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
                          onClick={() => setCancelModalId(appt._id)}
                        >
                          Скасувати
                        </button>
                      </div>
                    )}

                  {role === "patient" &&
                    appt.status === "passed" &&
                    (appt.isRated && appt.ratingValue ? (
                      <div className={styles.ratingDisplay}>
                        Ваша оцінка: {appt.ratingValue} ★
                      </div>
                    ) : (
                      <button
                        className={styles.rateButton}
                        onClick={() => setRatingAppointmentId(appt._id)}
                      >
                        Оцінити
                      </button>
                    ))}

                  {appt.status === "cancelled" && appt.cancelReason && (
                    <div className={styles.cancelReason}>
                      <strong>Причина скасування:</strong> {appt.cancelReason}
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

      {ratingAppointmentId && (
        <RatingModal
          isOpen={Boolean(ratingAppointmentId)}
          appointmentId={ratingAppointmentId}
          onClose={() => setRatingAppointmentId(null)}
          onRated={(value) => {
            handleRated(ratingAppointmentId, value);
            setRatingAppointmentId(null);
          }}
        />
      )}

      {cancelModalId && (
        <CancelReasonModal
          isOpen={Boolean(cancelModalId)}
          onClose={() => setCancelModalId(null)}
          onSubmit={(reason) => {
            handleStatusChange(cancelModalId, "cancelled", reason);
            setCancelModalId(null);
          }}
        />
      )}
    </div>
  );
}

export default AppointmentsList;
