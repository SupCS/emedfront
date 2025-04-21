import { useEffect, useState, useCallback } from "react";
import Select from "react-select";
import { getDoctors, getDoctorDetails } from "../../api/doctorApi";
import { getAvatarUrl } from "../../api/avatarApi";
import DoctorCard from "../../components/DoctorCard/DoctorCard";
import DoctorModal from "../../components/DoctorModal/DoctorModal";
import Pagination from "../../components/Pagination/Pagination";
import { toast } from "react-toastify";
import styles from "./DoctorListPage.module.css";

function DoctorListPage() {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [selectedSpecializations, setSelectedSpecializations] = useState([]);
  const [rating, setRating] = useState(null);
  const [search, setSearch] = useState("");
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
        (doc) =>
          doc.rating && parseFloat(doc.rating) >= parseFloat(rating.value)
      );
    }
    if (search.trim()) {
      filtered = filtered.filter((doc) =>
        doc.name.toLowerCase().includes(search.trim().toLowerCase())
      );
    }
    setFilteredDoctors(filtered);
    setCurrentPage(1);
  }, [doctors, selectedSpecializations, rating, search]);

  const handleSpecializationChange = (selectedOptions) => {
    setSelectedSpecializations(selectedOptions.map((opt) => opt.value));
  };

  const handleRatingChange = (selectedOption) => {
    setRating(selectedOption);
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

  return (
    <div className={styles.pageContainer}>
      <h2 className={styles.pageTitle}>Список лікарів</h2>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Пошук за імʼям:</label>
          <input
            type="text"
            placeholder="Введіть імʼя лікаря..."
            className={styles.textInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Спеціалізація:</label>
          <Select
            isMulti
            options={specializations.map((spec) => ({
              value: spec,
              label: spec,
            }))}
            onChange={handleSpecializationChange}
            placeholder="Обрати спеціалізацію..."
            className={styles.selectDropdown}
          />
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Рейтинг:</label>
          <Select
            options={[
              { value: "5.0", label: "5.0 і вище" },
              { value: "4.5", label: "4.5 і вище" },
              { value: "4.0", label: "4.0 і вище" },
              { value: "3.5", label: "3.5 і вище" },
              { value: "3.0", label: "3.0 і вище" },
              { value: "2.5", label: "2.5 і вище" },
              { value: "2.0", label: "2.0 і вище" },
            ]}
            onChange={handleRatingChange}
            placeholder="Обрати рейтинг..."
            className={styles.selectDropdown}
            isClearable
            value={rating}
          />
        </div>
      </div>

      <div className={styles.doctorGrid}>
        {paginatedDoctors.length > 0 ? (
          <>
            {paginatedDoctors.map((doctor) => (
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
            ))}

            {Array.from({
              length: perPage - paginatedDoctors.length,
            }).map((_, index) => (
              <div key={`empty-${index}`} className={styles.emptyCard}></div>
            ))}
          </>
        ) : (
          <p className={styles.noResults}>
            Лікарів не знайдено за обраними фільтрами.
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
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
