import { useEffect, useState } from "react";
import { getDoctorSchedule } from "../api/scheduleApi";
import { createAppointment } from "../api/appointmentApi";
import { getUserChats, createChat } from "../api/chatApi";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function DoctorModal({ doctor, isOpen, onClose }) {
  const [schedule, setSchedule] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchedule = async () => {
      if (doctor && isOpen) {
        try {
          const data = await getDoctorSchedule(doctor._id);
          setSchedule(data.availability);
        } catch (error) {
          toast.error("Помилка завантаження розкладу лікаря.");
          console.error("Помилка завантаження розкладу:", error);
        }
      }
    };

    fetchSchedule();
  }, [doctor, isOpen]);

  const handleBookSlot = async (date, startTime, endTime) => {
    try {
      await createAppointment(doctor._id, date, startTime, endTime);
      toast.success("Ви успішно записались на прийом!");

      const updatedSchedule = schedule
        .map((day) => {
          if (day.date === date) {
            const updatedSlots = day.slots.filter(
              (slot) =>
                !(slot.startTime === startTime && slot.endTime === endTime)
            );
            if (updatedSlots.length === 0) return null;
            return { date: day.date, slots: updatedSlots };
          }
          return day;
        })
        .filter((day) => day !== null);

      setSchedule(updatedSchedule);
    } catch (error) {
      toast.error("Не вдалося записатись на прийом.");
      console.error("Помилка запису на прийом:", error);
    }
  };

  const handleStartChat = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Будь ласка, увійдіть у систему, щоб почати чат.");
        return;
      }

      const decoded = jwtDecode(token);
      const patientId = decoded.id;

      // Перевіряємо, чи чат уже існує
      const userChats = await getUserChats(patientId);
      const existingChat = userChats.find((chat) =>
        chat.participants.some((p) => p._id === doctor._id)
      );

      if (existingChat) {
        navigate(`/chat?chatId=${existingChat._id}`);
        onClose();
        return;
      }

      // Створюємо новий чат
      const newChat = await createChat(
        patientId,
        "Patient",
        doctor._id,
        "Doctor"
      );

      navigate(`/chat?chatId=${newChat._id}`);
      onClose();
    } catch (error) {
      toast.error("Не вдалося створити чат.");
      console.error("Помилка створення чату:", error);
    }
  };

  if (!isOpen || !doctor) return null;

  return (
    <div style={modalOverlayStyle}>
      <div style={modalStyle}>
        <button onClick={onClose} style={closeButtonStyle}>
          Закрити
        </button>
        <div style={doctorHeaderStyle}>
          <img
            src={doctor.avatarUrl || "/images/default-avatar.webp"}
            alt="Аватар лікаря"
            style={modalAvatarStyle}
          />
          <h2>{doctor.name}</h2>
        </div>
        <p>
          <strong>Спеціалізація:</strong> {doctor.specialization}
        </p>
        <p>
          <strong>Рейтинг:</strong>{" "}
          {doctor.rating !== null
            ? `${doctor.rating} ⭐ (${doctor.ratingCount})`
            : "Немає оцінок"}
        </p>
        <p>
          <strong>Біографія:</strong> {doctor.bio}
        </p>
        <p>
          <strong>Email:</strong> {doctor.email}
        </p>

        <button onClick={handleStartChat} style={chatButtonStyle}>
          Почати чат
        </button>

        <h3>Вільні часові слоти:</h3>

        {schedule && schedule.length > 0 ? (
          schedule.map((day, index) => (
            <div key={index} style={{ marginBottom: "10px" }}>
              <strong>{day.date}:</strong>
              <ul>
                {day.slots.map((slot, idx) => (
                  <li key={idx} style={slotStyle}>
                    {slot.startTime} - {slot.endTime}
                    <button
                      onClick={() =>
                        handleBookSlot(day.date, slot.startTime, slot.endTime)
                      }
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

const doctorHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: "15px",
};

const modalAvatarStyle = {
  width: "80px",
  height: "80px",
  borderRadius: "50%",
  objectFit: "cover",
};

const slotStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "5px 0",
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

// Стиль для кнопки "Почати чат"
const chatButtonStyle = {
  backgroundColor: "#007BFF",
  color: "#fff",
  border: "none",
  padding: "10px 20px",
  borderRadius: "4px",
  cursor: "pointer",
  margin: "10px 0",
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
