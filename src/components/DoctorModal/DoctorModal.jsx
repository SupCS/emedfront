import { useEffect, useState } from "react";
import { getDoctorSchedule } from "../../api/scheduleApi";
import { getUserChats, createChat } from "../../api/chatApi";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DoctorSchedule from "../DoctorSchedule/DoctorSchedule";
import styles from "./DoctorModal.module.css";
import { Link } from "react-router-dom";

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
        }
      }
    };
    fetchSchedule();
  }, [doctor, isOpen]);

  const handleStartChat = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return toast.error("Увійдіть у систему, щоб почати чат.");

      const decoded = jwtDecode(token);
      const userChats = await getUserChats(decoded.id);
      const existingChat = userChats.find((chat) =>
        chat.participants.some((p) => p._id === doctor._id)
      );

      if (existingChat) {
        navigate(`/chat?chatId=${existingChat._id}`);
        onClose();
        return;
      }

      const newChat = await createChat(
        decoded.id,
        "Patient",
        doctor._id,
        "Doctor"
      );

      navigate(`/chat?chatId=${newChat._id}`);
      onClose();
    } catch {
      toast.error("Не вдалося створити чат.");
    }
  };

  const getYearsLabel = (n) => {
    if (typeof n !== "number") return "-";
    const lastDigit = n % 10;
    const lastTwoDigits = n % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return `${n} років`;
    if (lastDigit === 1) return `${n} рік`;
    if (lastDigit >= 2 && lastDigit <= 4) return `${n} роки`;
    return `${n} років`;
  };

  if (!isOpen || !doctor) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Закрити"
        >
          &times;
        </button>

        <div className={styles.header}>
          <img
            src={doctor.avatarUrl || "/images/default-avatar.webp"}
            alt="Аватар"
            className={styles.avatar}
          />
          <div>
            <h2 className={styles.name}>
              <Link
                to={`/profile/doctor/${doctor._id}`}
                className={styles.nameLink}
              >
                {doctor.name}
              </Link>
            </h2>
            <p className={styles.email}>{doctor.email}</p>
            <p className={styles.specialization}>{doctor.specialization}</p>
          </div>
        </div>

        <p className={styles.info}>
          <strong>Стаж:</strong> {getYearsLabel(doctor.experience)}
        </p>
        <p className={styles.info}>
          <strong>Рейтинг:</strong> {doctor.rating ?? "Немає"} ⭐ (
          {doctor.ratingCount})
        </p>
        <p className={styles.info}>
          <strong>Про себе:</strong> {doctor.bio}
        </p>

        <button className={styles.chatButton} onClick={handleStartChat}>
          Почати чат
        </button>

        <DoctorSchedule
          doctorId={doctor._id}
          isOwner={false}
          doctorName={doctor.name}
          variant="modal"
        />
      </div>
    </div>
  );
}

export default DoctorModal;
