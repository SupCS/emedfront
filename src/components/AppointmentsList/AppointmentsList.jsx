import styles from "./AppointmentsList.module.css";

function AppointmentsList({ appointments, role }) {
  return (
    <div className={styles.appointmentsContainer}>
      <h3 className={styles.appointmentsTitle}>Записи (Appointments):</h3>
      {appointments.length > 0 ? (
        <ul className={styles.appointmentsList}>
          {appointments.map((appt) => (
            <li key={appt._id} className={styles.appointmentItem}>
              <strong>Дата:</strong> {appt.date} <br />
              <strong>Час:</strong> {appt.startTime} - {appt.endTime} <br />
              {role === "doctor" ? (
                <strong>Пацієнт:</strong>
              ) : (
                <strong>Лікар:</strong>
              )}
              {role === "doctor" ? appt.patient.name : appt.doctor.name} <br />
            </li>
          ))}
        </ul>
      ) : (
        <p>Немає записів.</p>
      )}
    </div>
  );
}

export default AppointmentsList;
