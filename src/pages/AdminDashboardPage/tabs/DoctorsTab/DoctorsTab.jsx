import { useEffect, useState } from "react";
import {
  getAllDoctors,
  blockDoctor,
  unblockDoctor,
  updateDoctor,
  removeAvatar,
  deleteDoctor,
} from "../../../../api/adminApi";
import styles from "./DoctorsTab.module.css";
import Loader from "../../../../components/Loader/Loader";
import EditProfileModal from "../../../../components/Profile/EditProfileModal/EditProfileModal";
import AddDoctorModal from "../../../../components/AddDoctorModal/AddDoctorModal";
import pencilIcon from "../../../../assets/pencil.svg";
import { getAvatarUrl } from "../../../../api/avatarApi";
import { Link } from "react-router-dom";
import PrimaryButton from "../../../../components/Buttons/PrimaryButton";

function DoctorsTab() {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showBlocked, setShowBlocked] = useState("all");
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [editableFields, setEditableFields] = useState([]);
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllDoctors();
        setDoctors(data);
        setFilteredDoctors(data);
      } catch (error) {
        console.error("❌ Error fetching doctors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...doctors];

    if (search.trim()) {
      filtered = filtered.filter((d) =>
        d.name.toLowerCase().includes(search.trim().toLowerCase())
      );
    }

    if (showBlocked === "blocked") {
      filtered = filtered.filter((d) => d.isBlocked);
    } else if (showBlocked === "active") {
      filtered = filtered.filter((d) => !d.isBlocked);
    }

    setFilteredDoctors(filtered);
  }, [search, showBlocked, doctors]);

  const handleBlockToggle = async (doctorId, isCurrentlyBlocked) => {
    try {
      if (isCurrentlyBlocked) {
        await unblockDoctor(doctorId);
      } else {
        await blockDoctor(doctorId);
      }
      setDoctors((prev) =>
        prev.map((d) =>
          d._id === doctorId ? { ...d, isBlocked: !isCurrentlyBlocked } : d
        )
      );
    } catch (error) {
      console.error("❌ Error toggling block status:", error);
    }
  };

  const handleAvatarRemove = async (id) => {
    try {
      await removeAvatar("doctor", id);
      setDoctors((prev) =>
        prev.map((d) => (d._id === id ? { ...d, avatar: null } : d))
      );
    } catch (error) {
      console.error("❌ Error removing avatar:", error);
    }
  };

  const handleUpdate = (updatedData) => {
    setDoctors((prev) =>
      prev.map((d) => (d._id === editingDoctorId ? updatedData.doctor : d))
    );
    setEditingDoctor(null);
    setEditingDoctorId(null);
  };

  const handleAddDoctor = (newDoctor) => {
    setDoctors((prev) => [...prev, newDoctor]);
    setShowAddModal(false);
  };

  const handleDeleteDoctor = async (id, name) => {
    const confirmed = window.confirm(
      `Ви впевнені, що хочете видалити лікаря ${name}?`
    );
    if (!confirmed) return;

    try {
      await deleteDoctor(id);
      setDoctors((prev) => prev.filter((d) => d._id !== id));
    } catch (error) {
      console.error("❌ Error deleting doctor:", error);
    }
  };
  const submitViaAdminApi = (data) => {
    return updateDoctor(editingDoctorId, data);
  };

  if (loading) return <Loader />;

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h2>Усі лікарі</h2>
        <button
          className={styles.addButton}
          onClick={() => setShowAddModal(true)}
        >
          + Додати лікаря
        </button>
      </div>

      <div className={styles.filters}>
        <label>
          Пошук лікаря:
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

      {filteredDoctors.length === 0 ? (
        <p>Немає лікарів для відображення.</p>
      ) : (
        <ul className={styles.patientList}>
          {filteredDoctors.map((doctor) => (
            <li key={doctor._id} className={styles.patientItem}>
              <div className={styles.avatarWrapper}>
                <img
                  src={getAvatarUrl(doctor.avatar)}
                  alt="avatar"
                  className={styles.avatar}
                />
              </div>

              <h3>
                <Link
                  className={styles.linkText}
                  to={`/profile/doctor/${doctor._id}`}
                >
                  {doctor.name}
                </Link>
              </h3>
              <p>
                <strong>Email:</strong> {doctor.email}
              </p>
              <p>
                <strong>Телефон:</strong> {doctor.phone || "Не вказано"}
              </p>
              <p>
                <strong>Спеціалізація:</strong> {doctor.specialization || "-"}
              </p>
              <p>
                <strong>Стаж:</strong> {doctor.experience || "—"} років
              </p>

              <div className={styles.buttonRow}>
                <div className={styles.actionButtons}>
                  <button
                    onClick={() =>
                      handleBlockToggle(doctor._id, doctor.isBlocked)
                    }
                    className={
                      doctor.isBlocked
                        ? styles.unblockButton
                        : styles.blockButton
                    }
                  >
                    {doctor.isBlocked ? "Розблокувати" : "Заблокувати"}
                  </button>

                  <button
                    onClick={() => handleAvatarRemove(doctor._id)}
                    className={styles.removeAvatarButton}
                  >
                    Видалити аватар
                  </button>
                  <button
                    onClick={() => handleDeleteDoctor(doctor._id, doctor.name)}
                    className={styles.deleteButton}
                  >
                    Видалити акаунт лікаря
                  </button>
                </div>

                <button
                  onClick={() => {
                    setEditingDoctor(doctor);
                    setEditingDoctorId(doctor._id);
                    setEditableFields([
                      "name",
                      "email",
                      "phone",
                      "bio",
                      "specialization",
                      "experience",
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

      {editingDoctor && (
        <EditProfileModal
          isOpen={Boolean(editingDoctor)}
          onClose={() => {
            setEditingDoctor(null);
            setEditingDoctorId(null);
          }}
          currentData={editingDoctor}
          onUpdate={handleUpdate}
          onSubmit={submitViaAdminApi}
          editableFields={editableFields}
        />
      )}

      {showAddModal && (
        <AddDoctorModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onCreated={handleAddDoctor}
        />
      )}
    </div>
  );
}

export default DoctorsTab;
