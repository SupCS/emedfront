import { useEffect, useState } from "react";
import { getDoctorSchedule } from "../api/scheduleApi";
import { createAppointment } from "../api/appointmentApi";

function DoctorModal({ doctor, isOpen, onClose }) {
    const [schedule, setSchedule] = useState([]);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Отримання розкладу при відкритті модального вікна
    useEffect(() => {
        const fetchSchedule = async () => {
            if (doctor && isOpen) {
                try {
                    const data = await getDoctorSchedule(doctor._id);
                    setSchedule(data.availability);
                } catch (error) {
                    console.error("Помилка завантаження розкладу:", error);
                }
            }
        };

        fetchSchedule();
    }, [doctor, isOpen]);

    // Функція запису на прийом
    const handleBookSlot = async (date, startTime, endTime) => {
        try {
            await createAppointment(doctor._id, date, startTime, endTime);
            setSuccessMessage("Ви успішно записались на прийом!");

            // Оновлення розкладу після успішного запису
            const updatedSchedule = schedule.map(day => {
                if (day.date === date) {
                    const updatedSlots = day.slots.filter(
                        slot => !(slot.startTime === startTime && slot.endTime === endTime)
                    );

                    if (updatedSlots.length === 0) {
                        return null; // Видаляємо день, якщо більше немає слотів
                    }

                    return {
                        date: day.date,
                        slots: updatedSlots
                    };
                }
                return day;
            }).filter(day => day !== null);

            setSchedule(updatedSchedule);
        } catch (error) {
            console.error("Помилка запису на прийом:", error);
            setError("Не вдалося записатись на прийом. Спробуйте ще раз.");
        }
    };
    
    if (!isOpen || !doctor) return null;

    return (
        <div style={modalOverlayStyle}>
            <div style={modalStyle}>
                <button onClick={onClose} style={closeButtonStyle}>Закрити</button>
                <h2>{doctor.name}</h2>
                <p><strong>Спеціалізація:</strong> {doctor.specialization}</p>
                <p><strong>Рейтинг:</strong> {doctor.rating} ⭐</p>
                <p><strong>Біографія:</strong> {doctor.bio}</p>
                <p><strong>Email:</strong> {doctor.email}</p>

                <h3>Вільні часові слоти:</h3>
                {error && <p style={{ color: "red" }}>{error}</p>}
                {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
                
                {schedule && schedule.length > 0 ? (
                    schedule.map((day, index) => (
                        <div key={index} style={{ marginBottom: "10px" }}>
                            <strong>{day.date}:</strong>
                            <ul>
                                {day.slots.map((slot, idx) => (
                                    <li key={idx} style={slotStyle}>
                                        {slot.startTime} - {slot.endTime}
                                        <button 
                                            onClick={() => handleBookSlot(day.date, slot.startTime, slot.endTime)}
                                            style={bookButtonStyle}
                                        >
                                            Записатись
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))
                ) : (
                    <p>Немає вільних слотів.</p>
                )}
            </div>
        </div>
    );
}

const slotStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "5px 0"
};

const bookButtonStyle = {
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    padding: "5px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background 0.3s",
};

const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
};

const modalStyle = {
    backgroundColor: "#242424",
    color: "rgba(255, 255, 255, 0.87)",
    borderRadius: "8px",
    padding: "20px",
    width: "90%",
    maxWidth: "600px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    overflowY: "auto",
    maxHeight: "80vh",
    textAlign: "left",
    fontSize: "1rem",
    lineHeight: "1.5",
};

const closeButtonStyle = {
    background: "#ff4d4d",
    color: "#fff",
    border: "none",
    padding: "5px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    float: "right",
    transition: "background 0.3s",
};

closeButtonStyle["&:hover"] = {
    background: "#cc0000",
};


export default DoctorModal;