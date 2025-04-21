import { useEffect, useState, useCallback } from "react";
import { getDoctors, getDoctorDetails } from "../../api/doctorApi";
import { getAvatarUrl } from "../../api/avatarApi";
import DoctorCard from "../../components/DoctorCard/DoctorCard";
import DoctorModal from "../../components/DoctorModal/DoctorModal";
import { toast } from "react-toastify";
import styles from "./DoctorListPage.module.css";

function DoctorListPage() {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [selectedSpecializations, setSelectedSpecializations] = useState([]);
  const [rating, setRating] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 8;

  const fetchDoctors = useCallback(async () => {
    try {
      const data = await getDoctors();
      setDoctors(data);

      const specs = [...new Set(data.map((doc) => doc.specialization))];
      setSpecializations(specs);
    } catch (err) {
      toast.error("Не вдалося завантажити список лікарів.");
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  useEffect(() => {
    let filtered = [...doctors];
    if (selectedSpecializations.length > 0) {
      filtered = filtered.filter((doc) =>
        selectedSpecializations.includes(doc.specialization)
      );
    }
    if (rating) {
      filtered = filtered.filter(
        (doc) => doc.rating && parseFloat(doc.rating) >= parseFloat(rating)
      );
    }
    setFilteredDoctors(filtered);
    setCurrentPage(1);
  }, [doctors, selectedSpecializations, rating]);

  const handleSpecializationChange = (e) => {
    const { value, checked } = e.target;
    setSelectedSpecializations((prev) =>
      checked ? [...prev, value] : prev.filter((spec) => spec !== value)
    );
  };

  const handleRatingChange = (e) => {
    setRating(e.target.value);
  };

  const openModal = async (doctorId) => {
    try {
      const doctorDetails = await getDoctorDetails(doctorId);
      setSelectedDoctor({
        ...doctorDetails,
        avatarUrl: doctorDetails.avatar
          ? getAvatarUrl(doctorDetails.avatar)
          : null,
      });
      setIsModalOpen(true);
    } catch (error) {
      toast.error("Помилка завантаження деталей лікаря.");
    }
  };

  const closeModal = () => {
    setSelectedDoctor(null);
    setIsModalOpen(false);
  };

  const startIdx = (currentPage - 1) * perPage;
  const paginatedDoctors = filteredDoctors.slice(startIdx, startIdx + perPage);
  const totalPages = Math.ceil(filteredDoctors.length / perPage);

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 5;
    const half = Math.floor(maxButtons / 2);

    let start = Math.max(2, currentPage - half);
    let end = Math.min(totalPages - 1, currentPage + half);

    if (currentPage <= half + 1) {
      end = Math.min(maxButtons, totalPages - 1);
    }
    if (currentPage >= totalPages - half) {
      start = Math.max(totalPages - maxButtons + 1, 2);
    }

    if (totalPages <= maxButtons + 2) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(
          <button
            key={i}
            className={`${styles.pageButton} ${
              currentPage === i ? styles.active : ""
            }`}
            onClick={() => setCurrentPage(i)}
          >
            {i}
          </button>
        );
      }
    } else {
      buttons.push(
        <button
          key={1}
          className={`${styles.pageButton} ${
            currentPage === 1 ? styles.active : ""
          }`}
          onClick={() => setCurrentPage(1)}
        >
          1
        </button>
      );

      if (start > 2) {
        buttons.push(<span key="dots-start">...</span>);
      }

      for (let i = start; i <= end; i++) {
        buttons.push(
          <button
            key={i}
            className={`${styles.pageButton} ${
              currentPage === i ? styles.active : ""
            }`}
            onClick={() => setCurrentPage(i)}
          >
            {i}
          </button>
        );
      }

      if (end < totalPages - 1) {
        buttons.push(<span key="dots-end">...</span>);
      }

      buttons.push(
        <button
          key={totalPages}
          className={`${styles.pageButton} ${
            currentPage === totalPages ? styles.active : ""
          }`}
          onClick={() => setCurrentPage(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className={styles.pageContainer}>
      <h2 className={styles.pageTitle}>Список лікарів</h2>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Спеціалізація:</label>
          <div className={styles.checkboxList}>
            {specializations.map((spec, index) => (
              <label key={index} className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  value={spec}
                  checked={selectedSpecializations.includes(spec)}
                  onChange={handleSpecializationChange}
                />
                {spec}
              </label>
            ))}
          </div>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Рейтинг:</label>
          <select
            value={rating}
            onChange={handleRatingChange}
            className={styles.select}
          >
            <option value="">Будь-який рейтинг</option>
            <option value="4.0">4.0 і вище</option>
            <option value="4.5">4.5 і вище</option>
            <option value="5.0">Тільки 5.0</option>
          </select>
        </div>
      </div>

      <div className={styles.doctorGrid}>
        {paginatedDoctors.length > 0 ? (
          paginatedDoctors.map((doctor) => (
            <div
              key={doctor._id}
              onClick={() => openModal(doctor._id)}
              style={{ cursor: "pointer" }}
            >
              <DoctorCard
                name={doctor.name}
                specialization={doctor.specialization}
                rating={doctor.rating}
                ratingCount={doctor.ratingCount}
                avatar={doctor.avatar ? getAvatarUrl(doctor.avatar) : null}
              />
            </div>
          ))
        ) : (
          <p className={styles.noResults}>
            Лікарів не знайдено за обраними фільтрами.
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>{renderPaginationButtons()}</div>
      )}

      <DoctorModal
        doctor={selectedDoctor}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
}

export default DoctorListPage;
