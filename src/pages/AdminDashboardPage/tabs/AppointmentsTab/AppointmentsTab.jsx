import { useEffect, useRef, useState } from "react";
import {
  getAllAppointments,
  cancelAppointment,
} from "../../../../api/adminApi";
import styles from "./AppointmentsTab.module.css";
import flatpickr from "flatpickr";
import { Ukrainian } from "flatpickr/dist/l10n/uk.js";
import "flatpickr/dist/flatpickr.min.css";

function AppointmentsTab() {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [doctorSearch, setDoctorSearch] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [sortDirection, setSortDirection] = useState("desc");

  const fromRef = useRef(null);
  const toRef = useRef(null);

  useEffect(() => {
    if (!fromRef.current || !toRef.current) return;

    const fromPicker = flatpickr(fromRef.current, {
      locale: Ukrainian,
      dateFormat: "Y-m-d",
      defaultDate: from,
      onChange: ([date]) => setFrom(date),
    });

    const toPicker = flatpickr(toRef.current, {
      locale: Ukrainian,
      dateFormat: "Y-m-d",
      defaultDate: to,
      onChange: ([date]) => setTo(date),
    });

    return () => {
      fromPicker.destroy?.();
      toPicker.destroy?.();
    };
  }, [loading]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllAppointments();
        setAppointments(data);
        setFilteredAppointments(data);
      } catch (error) {
        console.error("❌ Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...appointments];

    if (doctorSearch.trim()) {
      filtered = filtered.filter((a) =>
        a.doctor.name.toLowerCase().includes(doctorSearch.trim().toLowerCase())
      );
    }

    if (patientSearch.trim()) {
      filtered = filtered.filter((a) =>
        a.patient.name
          .toLowerCase()
          .includes(patientSearch.trim().toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }

    if (from) {
      filtered = filtered.filter(
        (a) => new Date(a.createdAt) >= new Date(from)
      );
    }

    if (to) {
      filtered = filtered.filter((a) => new Date(a.createdAt) <= new Date(to));
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    });

    setFilteredAppointments(filtered);
  }, [
    doctorSearch,
    patientSearch,
    from,
    to,
    statusFilter,
    appointments,
    sortDirection,
  ]);

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handleCancel = async (id, status) => {
    const confirmed = window.confirm(
      "Ви впевнені, що хочете скасувати цей запис?"
    );
    if (!confirmed) return;

    try {
      await cancelAppointment(id);
      setAppointments((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: "cancelled" } : a))
      );
    } catch (error) {
      console.error("❌ Error cancelling appointment:", error);
    }
  };

  if (loading) return <div>Завантаження...</div>;

  return (
    <div className={styles.container}>
      <h2>Усі записи на прийом</h2>

      <div className={styles.filters}>
        <label>
          Пошук лікаря:
          <input
            type="text"
            value={doctorSearch}
            onChange={(e) => setDoctorSearch(e.target.value)}
            className={styles.input}
          />
        </label>
        <label>
          Пошук пацієнта:
          <input
            type="text"
            value={patientSearch}
            onChange={(e) => setPatientSearch(e.target.value)}
            className={styles.input}
          />
        </label>
        <label>
          Статус:
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.input}
          >
            <option value="all">Усі</option>
            <option value="pending">Очікує підтвердження</option>
            <option value="confirmed">Підтверджено</option>
            <option value="cancelled">Скасовано</option>
            <option value="passed">Завершено</option>
          </select>
        </label>
        <label>
          З дати:
          <input ref={fromRef} readOnly className={styles.input} />
        </label>
        <label>
          По дату:
          <input ref={toRef} readOnly className={styles.input} />
        </label>
        <button onClick={toggleSortDirection} className={styles.sortButton}>
          Сортувати {sortDirection === "asc" ? "↑" : "↓"}
        </button>
      </div>

      {filteredAppointments.length === 0 ? (
        <p>Немає записів для відображення.</p>
      ) : (
        <ul className={styles.prescriptionList}>
          {filteredAppointments.map((a) => (
            <li key={a._id} className={styles.prescriptionItem}>
              <h3>
                Запис на {new Date(a.date).toLocaleDateString()} • {a.startTime}{" "}
                - {a.endTime}
              </h3>
              <p>
                <strong>Лікар:</strong>{" "}
                <a
                  className={styles.linkText}
                  href={`/profile/doctor/${a.doctor._id}`}
                >
                  {a.doctor.name}
                </a>{" "}
                ({a.doctor.email})
              </p>
              <p>
                <strong>Пацієнт:</strong>{" "}
                <a
                  className={styles.linkText}
                  href={`/profile/patient/${a.patient._id}`}
                >
                  {a.patient.name}
                </a>{" "}
                ({a.patient.email})
              </p>
              <p>
                <strong>Статус:</strong> {a.status}
              </p>
              <p>
                <strong>Дата створення:</strong>{" "}
                {new Date(a.createdAt).toLocaleDateString()}
              </p>
              {!["cancelled", "passed"].includes(a.status) && (
                <button
                  onClick={() => handleCancel(a._id, a.status)}
                  style={{
                    marginTop: "8px",
                    backgroundColor: "#dc2626",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Скасувати
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AppointmentsTab;
