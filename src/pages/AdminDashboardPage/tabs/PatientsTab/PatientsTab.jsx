import { useEffect, useState } from "react";
import {
  getAllPatients,
  blockPatient,
  unblockPatient,
  updatePatient,
  removeAvatar,
} from "../../../../api/adminApi";
import styles from "./PatientsTab.module.css";
import Loader from "../../../../components/Loader/Loader";
import EditProfileModal from "../../../../components/Profile/EditProfileModal/EditProfileModal";
import pencilIcon from "../../../../assets/pencil.svg";
import { getAvatarUrl } from "../../../../api/avatarApi";

function PatientsTab() {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showBlocked, setShowBlocked] = useState("all");
  const [editingPatient, setEditingPatient] = useState(null);
  const [editableFields, setEditableFields] = useState([]);
  const [editingPatientId, setEditingPatientId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllPatients();
        setPatients(data);
        setFilteredPatients(data);
      } catch (error) {
        console.error("❌ Error fetching patients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...patients];

    if (search.trim()) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(search.trim().toLowerCase())
      );
    }

    if (showBlocked === "blocked") {
      filtered = filtered.filter((p) => p.isBlocked);
    } else if (showBlocked === "active") {
      filtered = filtered.filter((p) => !p.isBlocked);
    }

    setFilteredPatients(filtered);
  }, [search, showBlocked, patients]);

  const handleBlockToggle = async (patientId, isCurrentlyBlocked) => {
    try {
      if (isCurrentlyBlocked) {
        await unblockPatient(patientId);
      } else {
        await blockPatient(patientId);
      }
      setPatients((prev) =>
        prev.map((p) =>
          p._id === patientId ? { ...p, isBlocked: !isCurrentlyBlocked } : p
        )
      );
    } catch (error) {
      console.error("❌ Error toggling block status:", error);
    }
  };

  const handleAvatarRemove = async (id) => {
    try {
      await removeAvatar("patient", id);
      setPatients((prev) =>
        prev.map((p) => (p._id === id ? { ...p, avatar: null } : p))
      );
    } catch (error) {
      console.error("❌ Error removing avatar:", error);
    }
  };

  const handleUpdate = (updatedData) => {
    setPatients((prev) =>
      prev.map((p) => (p._id === editingPatientId ? updatedData.patient : p))
    );
    setEditingPatient(null);
    setEditingPatientId(null);
  };

  const submitViaAdminApi = (data) => {
    return updatePatient(editingPatientId, data);
  };

  if (loading) return <Loader />;

  return (
    <div className={styles.container}>
      <h2>Усі пацієнти</h2>

      <div className={styles.filters}>
        <label>
          Пошук пацієнта:
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.input}
          />
        </label>

        <label>
          Статус:
          <select
            value={showBlocked}
            onChange={(e) => setShowBlocked(e.target.value)}
            className={styles.input}
          >
            <option value="all">Усі</option>
            <option value="active">Активні</option>
            <option value="blocked">Заблоковані</option>
          </select>
        </label>
      </div>

      {filteredPatients.length === 0 ? (
        <p>Немає пацієнтів для відображення.</p>
      ) : (
        <ul className={styles.patientList}>
          {filteredPatients.map((patient) => (
            <li key={patient._id} className={styles.patientItem}>
              <div className={styles.avatarWrapper}>
                <img
                  src={getAvatarUrl(patient.avatar)}
                  alt="avatar"
                  className={styles.avatar}
                />
              </div>

              <h3>
                {" "}
                <a
                  className={styles.linkText}
                  href={`/profile/patient/${patient._id}`}
                >
                  {patient.name}
                </a>
              </h3>
              <p>
                <strong>Email:</strong> {patient.email}
              </p>
              <p>
                <strong>Телефон:</strong> {patient.phone || "Не вказано"}
              </p>
              <p>
                <strong>Стать:</strong> {patient.gender || "Не вказано"}
              </p>
              <p>
                <strong>Дата народження:</strong>{" "}
                {patient.birthDate
                  ? new Date(patient.birthDate).toLocaleDateString()
                  : "Не вказано"}
              </p>

              <div className={styles.buttonRow}>
                <div className={styles.actionButtons}>
                  <button
                    onClick={() =>
                      handleBlockToggle(patient._id, patient.isBlocked)
                    }
                    className={
                      patient.isBlocked
                        ? styles.unblockButton
                        : styles.blockButton
                    }
                  >
                    {patient.isBlocked ? "Розблокувати" : "Заблокувати"}
                  </button>

                  <button
                    onClick={() => handleAvatarRemove(patient._id)}
                    className={styles.removeAvatarButton}
                  >
                    Видалити аватар
                  </button>
                </div>

                <button
                  onClick={() => {
                    setEditingPatient(patient);
                    setEditingPatientId(patient._id);
                    setEditableFields([
                      "name",
                      "email",
                      "phone",
                      "birthDate",
                      "height",
                      "weight",
                      "bloodType",
                      "gender",
                      "allergies",
                      "chronicDiseases",
                    ]);
                  }}
                  className={styles.editIconButton}
                >
                  <img
                    src={pencilIcon}
                    alt="Редагувати"
                    className={styles.blockEditIcon}
                  />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editingPatient && (
        <EditProfileModal
          isOpen={Boolean(editingPatient)}
          onClose={() => {
            setEditingPatient(null);
            setEditingPatientId(null);
          }}
          currentData={editingPatient}
          onUpdate={handleUpdate}
          onSubmit={submitViaAdminApi}
          editableFields={editableFields}
        />
      )}
    </div>
  );
}

export default PatientsTab;
