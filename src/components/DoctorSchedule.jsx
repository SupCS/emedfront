import { useEffect, useState, useCallback } from "react";
import {
  getDoctorSchedule,
  addDoctorSlot,
  removeDoctorSlot,
} from "../api/scheduleApi";
import { toast } from "react-toastify";

function DoctorSchedule({ doctorId }) {
  const [schedule, setSchedule] = useState(null);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Функція для отримання розкладу лікаря
  const fetchSchedule = useCallback(async () => {
    try {
      const data = await getDoctorSchedule(doctorId);
      setSchedule(data);
    } catch (err) {
      toast.error("Не вдалося завантажити розклад.");
    }
  }, [doctorId]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  // Функція для додавання нового слота
  const handleAddSlot = async () => {
    if (!date || !startTime || !endTime) {
      toast.info("Будь ласка, заповніть всі поля.");
      return;
    }

    try {
      await addDoctorSlot(date, [{ startTime, endTime }]);
      toast.success("Тайм-слот успішно додано!");
      fetchSchedule(); // Оновлюємо розклад після додавання
    } catch (err) {
      toast.error("Не вдалося додати тайм-слот.");
    }
  };

  // Функція для видалення слота
  const handleRemoveSlot = async (date, startTime, endTime) => {
    try {
      await removeDoctorSlot(date, startTime, endTime);
      toast.success("Тайм-слот успішно видалено!");
      fetchSchedule();
    } catch (err) {
      toast.error("Не вдалося видалити тайм-слот.");
    }
  };

  if (!schedule) return <p>Завантаження розкладу...</p>;

  return (
    <div>
      <h3>Розклад лікаря</h3>

      {schedule.availability.length === 0 ? (
        <p>Розклад відсутній</p>
      ) : (
        <ul>
          {schedule.availability.map((day, index) => (
            <li key={index}>
              <strong>{day.date}</strong>
              <ul>
                {day.slots.map((slot, idx) => (
                  <li key={idx}>
                    {slot.startTime} - {slot.endTime}
                    <button
                      onClick={() =>
                        handleRemoveSlot(day.date, slot.startTime, slot.endTime)
                      }
                    >
                      Видалити
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}

      <h4>Додати новий тайм-слот</h4>
      <label>Оберіть дату:</label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <label>Час початку:</label>
      <input
        type="time"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
      />
      <label>Час закінчення:</label>
      <input
        type="time"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
      />
      <button onClick={handleAddSlot} style={{ marginTop: "10px" }}>
        Додати слот
      </button>

      <button
        onClick={fetchSchedule}
        style={{ marginTop: "10px", marginLeft: "10px" }}
      >
        Оновити розклад
      </button>
    </div>
  );
}

export default DoctorSchedule;
