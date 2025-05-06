import { useEffect, useRef, useState } from "react";
import {
  getAllPrescriptions,
  deletePrescription,
} from "../../../../api/adminApi";
import styles from "./PrescriptionsTab.module.css";
import Loader from "../../../../components/Loader/Loader";
import flatpickr from "flatpickr";
import { Ukrainian } from "flatpickr/dist/l10n/uk.js";
import "flatpickr/dist/flatpickr.min.css";
import { Link } from "react-router-dom";

function PrescriptionsTab() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [doctorSearch, setDoctorSearch] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
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
        const data = await getAllPrescriptions();
        setPrescriptions(data);
        setFilteredPrescriptions(data);
      } catch (error) {
        console.error("❌ Error fetching prescriptions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...prescriptions];

    if (doctorSearch.trim()) {
      filtered = filtered.filter((p) =>
        p.doctor.name.toLowerCase().includes(doctorSearch.trim().toLowerCase())
      );
    }

    if (patientSearch.trim()) {
      filtered = filtered.filter((p) =>
        p.patient.name
          .toLowerCase()
          .includes(patientSearch.trim().toLowerCase())
      );
    }

    if (from) {
      filtered = filtered.filter(
        (p) => new Date(p.createdAt) >= new Date(from)
      );
    }

    if (to) {
      filtered = filtered.filter((p) => new Date(p.createdAt) <= new Date(to));
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    });

    setFilteredPrescriptions(filtered);
  }, [doctorSearch, patientSearch, from, to, prescriptions, sortDirection]);

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Ви впевнені, що хочете видалити це призначення?")) {
      return;
    }
    try {
      await deletePrescription(id);
      setPrescriptions((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      console.error("❌ Error deleting prescription:", error);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className={styles.container}>
      <h2>Усі призначення</h2>

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

      {console.log(filteredPrescriptions)}

      {filteredPrescriptions.length === 0 ? (
        <p>Немає доступних призначень.</p>
      ) : (
        <ul className={styles.prescriptionList}>
          {filteredPrescriptions.map((p) => (
            <li key={p._id} className={styles.prescriptionItem}>
              <h3>Діагноз: {p.diagnosis}</h3>
              <p>
                <strong>Лікування:</strong> {p.treatment}
              </p>
              <p>
                <strong>Лікар:</strong>{" "}
                <Link
                  className={styles.linkText}
                  to={`/profile/doctor/${p.doctor._id}`}
                >
                  {p.doctor.name}
                </Link>{" "}
                ({p.doctor.specialization})
              </p>
              <p>
                <strong>Пацієнт:</strong>{" "}
                <Link
                  className={styles.linkText}
                  to={`/profile/patient/${p.patient._id}`}
                >
                  {p.patient.name}
                </Link>
              </p>
              <div className={styles.attachmentsRow}>
                {p.pdfUrl && (
                  <a
                    href={p.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.pdfLink}
                  >
                    📄 Консультаційний висновок
                  </a>
                )}
                {p.attachments?.map((att, index) => (
                  <a
                    key={index}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.pdfLink}
                  >
                    📎 {att.title}
                  </a>
                ))}
              </div>
              <p>
                <strong>Дата створення:</strong>{" "}
                {new Date(p.createdAt).toLocaleDateString()}
              </p>
              <button
                onClick={() => handleDelete(p._id)}
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
                Видалити
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PrescriptionsTab;
