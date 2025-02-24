import { useEffect, useState, useCallback } from "react";
import { getDoctors, getDoctorDetails } from "../api/doctorApi";
import DoctorCard from "../components/DoctorCard";
import DoctorModal from "../components/DoctorModal";

function DoctorListPage() {
    const [doctors, setDoctors] = useState([]);
    const [error, setError] = useState("");
    const [selectedSpecializations, setSelectedSpecializations] = useState([]);
    const [rating, setRating] = useState("");

    // Стан для модального вікна
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const specializations = ["Психіатр", "Психолог", "Лор"];

    const fetchDoctors = useCallback(async () => {
        try {
            const data = await getDoctors(selectedSpecializations, rating);
            setDoctors(data);
            setError(""); // Очищаємо помилку, якщо запит вдалий
        } catch (err) {
            setError(err.message || "Не вдалося завантажити список лікарів.");
        }
    }, [selectedSpecializations, rating]);

    useEffect(() => {
        fetchDoctors();
    }, [fetchDoctors]);

    const handleSpecializationChange = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setSelectedSpecializations([...selectedSpecializations, value]);
        } else {
            setSelectedSpecializations(selectedSpecializations.filter((spec) => spec !== value));
        }
    };

    const openModal = async (doctorId) => {
        try {
            const doctorDetails = await getDoctorDetails(doctorId);
            setSelectedDoctor(doctorDetails);
            setIsModalOpen(true);
        } catch (error) {
            console.error("Помилка завантаження деталей лікаря:", error);
        }
    };

    const closeModal = () => {
        setSelectedDoctor(null);
        setIsModalOpen(false);
    };

    return (
        <div>
            <h2>Список лікарів</h2>

            {/* Вивід помилки (якщо є) */}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {/* Форма фільтрації */}
            <div style={filterContainerStyle}>
                <fieldset style={{ border: "1px solid #ccc", padding: "10px", borderRadius: "8px" }}>
                    <legend>Спеціалізація:</legend>
                    {specializations.map((spec, index) => (
                        <label key={index} style={{ display: "block", margin: "5px 0" }}>
                            <input
                                type="checkbox"
                                value={spec}
                                checked={selectedSpecializations.includes(spec)}
                                onChange={handleSpecializationChange}
                            />
                            {spec}
                        </label>
                    ))}
                </fieldset>

                <fieldset style={{ border: "1px solid #ccc", padding: "10px", borderRadius: "8px" }}>
                    <legend>Рейтинг:</legend>
                    <select value={rating} onChange={(e) => setRating(e.target.value)}>
                        <option value="">Будь-який рейтинг</option>
                        <option value="4.0">4.0 і вище</option>
                        <option value="4.5">4.5 і вище</option>
                        <option value="5.0">Тільки 5.0</option>
                    </select>
                </fieldset>
            </div>

            <div style={cardContainerStyle}>
                {doctors.length > 0 ? (
                    doctors.map((doctor) => (
                        <div 
                            key={doctor._id} 
                            onClick={() => openModal(doctor._id)}
                            style={{ cursor: "pointer" }} // Робимо картку клікабельною
                        >
                            <DoctorCard
                                name={doctor.name}
                                specialization={doctor.specialization}
                                rating={doctor.rating}
                            />
                        </div>
                    ))
                ) : (
                    <p>Лікарів не знайдено за обраними фільтрами.</p>
                )}
            </div>

            {/* Модальне вікно */}
            <DoctorModal
                doctor={selectedDoctor}
                isOpen={isModalOpen}
                onClose={closeModal}
            />
        </div>
    );
}

const filterContainerStyle = {
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "20px"
};

const cardContainerStyle = {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center"
};

export default DoctorListPage;